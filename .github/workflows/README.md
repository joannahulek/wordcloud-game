# GitHub Actions Workflows

This directory contains small workflows that are combined into two main flows:

```text
Pull request checks
Release, prerelease, and publish after merge or direct push
```

---

## How the checkout + setup pattern works

Every job that uses the local composite action (`.github/actions/setup`) must first check out the repository itself. This is because GitHub runs each job on a fresh machine with an empty workspace. The composite action lives inside the repo, so the repo must already be checked out before GitHub can find and run it.

The pattern used in every job is:

```text
Step 1: Checkout source       — downloads the repo onto the runner machine
Step 2: Setup project         — called with skip-checkout: 'true' so it does not
                                check out again; just installs Bun and dependencies
```

The only exception is `release.yml`, which needs the full git history for Semantic Release. It uses the same pattern but passes `fetch-depth: 0` to the checkout step.

---

## Composite Action

### `.github/actions/setup`

This is a reusable action, not a workflow. It is called inside individual jobs to avoid repeating the same Bun setup steps in every workflow file.

Steps:

```text
1. Checkout source
   Checks out the repo onto the runner machine.
   This step is skipped when skip-checkout: 'true' is passed in,
   which happens when the calling job already ran its own checkout above.

2. Setup Bun
   Installs Bun version 1.2.21 on the runner.
   Bun is the package manager and runtime used by this project.

3. Restore Bun cache
   Looks for a previously saved cache of downloaded packages.
   The cache key is based on the OS and the contents of bun.lock.
   If the lockfile has not changed since the last run, packages are
   restored from cache and the next step runs faster.
   If no cache exists yet, this step is skipped silently.

4. Install dependencies
   Runs bun install --frozen-lockfile.
   This installs all packages listed in bun.lock exactly as they are.
   The --frozen-lockfile flag means the install will fail if bun.lock
   is out of date, which prevents accidental version drift.
```

---

## Main Workflows

These two files are the entry points. Everything else is called from here.

---

### `ci-triggered-by.PR.yml`

Runs automatically when a pull request is opened, updated (new commits pushed), or its title is edited.

Watched branches (the PR must be targeting one of these):

```text
main
master
release/**
prerelease
```

Changes to `README.md` are ignored and will not trigger this workflow.

If multiple pushes arrive at the same time, only the latest one runs. Earlier runs are cancelled automatically (`cancel-in-progress: true`).

Jobs and their order:

```text
1. classify-change
   Runs first. Decides whether the full pipeline is needed.
   On a PR, full checks are always required, so this always returns true.

2. code-checks  (runs after classify-change)
   Runs ESLint and TypeScript checks in parallel.
   Only runs if classify-change said full checks are required.

3. tests  (runs after code-checks)
   Runs unit tests and end-to-end tests in parallel.
   Only runs if classify-change said full checks are required.

4. build  (runs after code-checks and tests)
   Builds the app and saves the output as an artifact.
   Only runs if classify-change said full checks are required.
```

Deploy and publish do not run on PRs.

---

### `ci-triggered-by.direct-merge.yml`

Runs automatically when a commit is pushed directly to a release branch.

Watched branches:

```text
main
master
prerelease
```

Changes to `README.md` are ignored and will not trigger this workflow.

If multiple pushes arrive at the same time, only the latest one runs. Earlier runs are cancelled automatically.

There are two possible paths depending on what kind of push it was:

**Path A — merged pull request**
The push came from merging a PR. Checks already passed on that PR, so they are skipped here.

```text
1. classify-change   — detects this is a merged PR push
2. deploy            — creates the release tag
3. publish           — deploys to GitHub Pages
```

**Path B — direct commit**
Someone pushed a commit directly to the branch without a PR. Checks have not run yet, so the full pipeline runs first.

```text
1. classify-change   — detects this is a direct push
2. code-checks       — runs ESLint and TypeScript checks
3. tests             — runs unit and e2e tests
4. build             — builds the app
5. deploy            — creates the release tag
6. publish           — deploys to GitHub Pages
```

---

## Reusable Workflows

These files are called by the main workflows above. They cannot be triggered on their own (except `build.yml`, `code-checks.yml`, and `tests.yml` which also support manual dispatch via the GitHub Actions UI).

---

### `classify-change.yml`

Figures out what kind of event triggered the pipeline and passes that information to the jobs that come after it.

It receives these inputs from the calling workflow:

```text
event-name      — whether this is a pull_request or push event
ref-name        — the branch name (e.g. main, prerelease)
head-sha        — the commit SHA that triggered the run
repository      — the full repo name (e.g. owner/repo)
commit-message  — the commit message (used as a fallback)
```

It runs one shell script that does the following:

```text
1. Starts with: full-checks-required = true, release-branch-push = false, merged-pr-push = false

2. If the event is a push to main, master, or prerelease:
   - Sets release-branch-push = true
   - Calls the GitHub API to check if a PR was merged into this commit
   - Also checks if the commit message starts with "Merge pull request"
   - If either is true: sets merged-pr-push = true and full-checks-required = false
     (checks already ran on the PR, no need to repeat them)

3. Writes the three output values so the calling workflow can read them.
```

Outputs:

```text
full-checks-required  — true if lint, tests, and build should run
release-branch-push   — true if the push is to a release branch
merged-pr-push        — true if the push came from a merged pull request
```

---

### `code-checks.yml`

Runs two jobs in parallel. Both jobs check code quality but in different ways.

**ESLint job** — checks for code style and potential errors:

```text
1. Checkout source
   Downloads the repo onto the runner so the local composite action can be found.

2. Setup project  (skip-checkout: 'true')
   Installs Bun and restores cached packages, then runs bun install.
   Skips the internal checkout since step 1 already did it.

3. Run ESLint
   Runs bun run lint.
   ESLint reads the source files and reports any rule violations.
   The job fails if any errors are found.
```

**TS check job** — checks that all TypeScript types are correct:

```text
1. Checkout source
   Same as above — needed before the local action can run.

2. Setup project  (skip-checkout: 'true')
   Same as above.

3. Run type checking
   Runs bun run type-check.
   The TypeScript compiler checks all files for type errors without producing output.
   The job fails if any type errors are found.
```

---

### `tests.yml`

Runs two jobs in parallel. Both jobs install the same dependencies but run different kinds of tests.

If multiple runs are triggered at the same time for the same branch, earlier ones are cancelled.

**unit job** — fast tests that do not need a browser:

```text
1. Checkout source
   Downloads the repo so the local action can be found.

2. Setup project  (skip-checkout: 'true')
   Installs Bun and dependencies.

3. Run unit and integration tests
   Runs bun run test.
   Bun's built-in test runner executes all unit and integration test files.
   The job fails if any test fails.
```

**e2e job** — browser-based tests that simulate real user interactions:

```text
1. Checkout source
   Downloads the repo so the local action can be found.

2. Setup project  (skip-checkout: 'true')
   Installs Bun and dependencies.

3. Install Playwright browsers
   Runs bunx playwright install --with-deps.
   Downloads Chromium, Firefox, and WebKit along with their system dependencies.
   This step is separate because browser binaries are not part of the npm packages.

4. Run end-to-end tests
   Runs bun run test:e2e.
   Playwright launches real browsers and runs the test scenarios.
   The job fails if any scenario fails.
```

---

### `build.yml`

Builds the production version of the app and saves the output so `publish.yml` can deploy it without building again.

```text
1. Checkout source
   Downloads the repo so the local action can be found.

2. Setup project  (skip-checkout: 'true')
   Installs Bun and dependencies.

3. Build
   Runs bun run build.
   Produces the production-ready files in the dist folder.

4. Upload build artifact
   Saves the dist folder as a GitHub Actions artifact named build-output-artifact.
   This artifact is available to any later job in the same workflow run.
   publish.yml downloads it instead of running the build a second time.
```

---

### `release.yml`

Decides whether this change should create a new release. If yes, runs Semantic Release to create the tag and update the changelog.

Runs two jobs in sequence.

**Job 1 — release-candidate** (always runs):

```text
1. Resolve release title
   Calls the GitHub API to find the PR title associated with this commit.
   If no PR is found, falls back to the first line of the commit message.
   Checks whether the title starts with feat:, fix:, or perf:.
   If yes:  sets should-release = true  (release will proceed)
   If no:   sets should-release = false (release is skipped)
```

**Job 2 — Create new tag** (only runs if Job 1 set should-release = true):

```text
1. Checkout repository
   Checks out the full git history with fetch-depth: 0.
   Semantic Release needs the complete history to calculate the next version
   number and to generate the changelog. A shallow clone is not enough.

2. Setup Node.js
   Installs Node.js version 24.
   Semantic Release requires Node.js to run even though the project uses Bun.

3. Setup project  (skip-checkout: 'true')
   Installs Bun and dependencies.
   Skips the internal checkout because step 1 already checked out with the
   correct options.

4. Release
   Runs bun run release.
   Semantic Release reads the commit history, calculates the next version number,
   creates the git tag, updates CHANGELOG.md, commits the changelog update,
   and creates the GitHub release with release notes.
```

Release-triggering prefixes:

```text
feat:   creates a minor release  (e.g. v1.1.0 -> v1.2.0)
fix:    creates a patch release  (e.g. v1.1.0 -> v1.1.1)
perf:   creates a patch release  (e.g. v1.1.0 -> v1.1.1)
```

Prefixes that do not create a release:

```text
chore:
test:
docs:
refactor:
```

---

### `publish.yml`

Deploys the built app to GitHub Pages. It does not build the app itself — it uses the artifact that `build.yml` already produced and saved.

```text
1. Download build artifact
   Downloads the build-output-artifact saved by build.yml into the dist folder.
   This avoids running the build a second time.

2. Upload GitHub Pages artifact
   Repackages the dist folder into the format that GitHub Pages deployment expects.

3. Publish to GitHub Pages
   Deploys the packaged artifact to GitHub Pages.
   The live URL is written to the job output so it appears in the Actions summary.
```

If the `github-pages` environment has required reviewers configured in the repository settings, GitHub will pause before this job and wait for a manual approval.

---

### `sync-prerelease.yml`

Runs automatically after any push to `main` or `master`. Its job is to keep the `prerelease` branch up to date with production so they do not drift apart over time.

Changes to `README.md` are ignored and will not trigger this workflow.

If multiple runs are triggered at the same time, only the latest one continues. Earlier ones are cancelled.

```text
1. Checkout repository
   Checks out the full git history with fetch-depth: 0.
   The full history is needed to compare branches and perform the merge.

2. Configure Git bot
   Sets the git user name and email to the GitHub Actions bot identity.
   This is required so the merge commit has a valid author.

3. Prepare sync branch
   - Fetches the latest state of both the production branch and prerelease from remote.
   - Checks that the prerelease branch actually exists. Exits with an error if it does not.
   - Checks if prerelease already contains all commits from the production branch.
     If yes: marks sync-needed = false and stops. Nothing to do.
   - If not: creates a local branch called sync/<source>-to-prerelease based on prerelease,
     merges the production branch into it, and pushes it to the remote.
     Marks sync-needed = true and records the branch name for the next step.
   - If there are merge conflicts, this step fails so they can be resolved manually.

4. Open or update sync PR  (only runs if sync-needed = true)
   - Checks if a PR already exists from the sync branch into prerelease.
   - If a PR exists: updates its title and description.
   - If no PR exists: creates a new one.
   - Never pushes directly to prerelease — always goes through a PR.
```

---

## Release Branches

Production:

```text
main
master
```

Prerelease:

```text
prerelease
```

Production tags:

```text
v1.2.0
v1.2.1
```

Prerelease tags:

```text
v1.2.0-prerelease.1
v1.2.0-prerelease.2
```

---

## Recommended Flow

1. Open a PR into `prerelease`.
2. Let `ci-triggered-by.PR.yml` validate it.
3. Merge into `prerelease`.
4. Let `ci-triggered-by.direct-merge.yml` create a prerelease.
5. Test the prerelease.
6. Open a PR from `prerelease` into `main` or `master`.
7. Let PR checks run again.
8. Merge into production.
9. Let `ci-triggered-by.direct-merge.yml` create the production release.
10. Let `sync-prerelease.yml` open a PR to sync production back into `prerelease`.

---

## Manual Trigger

To manually trigger a prerelease, push an empty commit to `prerelease` with a release prefix:

```sh
git checkout prerelease
git pull
git commit --allow-empty -m "fix: trigger prerelease"
git push
```

Use:

```text
feat:  for a minor release
fix:   for a patch release
perf:  for a patch release
```

Do not use `chore:`, `test:`, `docs:`, or `refactor:` if you want a release to be created.
