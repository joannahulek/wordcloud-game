# GitHub Actions Workflows

This directory contains small workflows that are combined into two main flows:

```text
Pull request checks
Release, prerelease, and publish after merge or direct push
```

---

## Composite Action

### `.github/actions/setup`

This is a reusable action, not a workflow. It is called inside individual jobs to avoid repeating the same setup steps everywhere.

What it does:

```text
1. Checks out the repository (can be skipped if the job already did it)
2. Installs Bun
3. Restores the Bun dependency cache
4. Runs bun install --frozen-lockfile
```

The `skip-checkout` input is used when a job needs a custom checkout first (for example, `release.yml` needs full git history, so it checks out with `fetch-depth: 0` before calling this action).

---

## Main Workflows

### `ci-triggered-by.PR.yml`

Runs when a pull request is opened, updated, or its title is edited.

Target branches:

```text
main
master
release/**
prerelease/**
```

Jobs:

```text
Classify PR change -> Lint and type-check -> Run tests -> Build app
```

Purpose:

```text
Validate pull requests before they are merged.
Deploy and publish jobs do not run here.
```

### `ci-triggered-by.direct-merge.yml`

Runs when something is pushed directly to a release branch.

Branches:

```text
main
master
prerelease
```

For a merged pull request, checks are skipped because they already passed on the PR:

```text
Classify push -> Create release tag -> Publish to GitHub Pages
```

For a direct commit, the full pipeline runs because the change did not go through PR checks:

```text
Classify push -> Lint and type-check -> Run tests -> Build app -> Create release tag -> Publish to GitHub Pages
```

---

## Reusable Workflows

These files are called by the main workflows above. They are not triggered directly.

### `classify-change.yml`

Figures out what kind of event triggered the pipeline and tells the other jobs what to do.

Outputs:

```text
full-checks-required  — true if lint, tests, and build should run
release-branch-push   — true if the push is to main, master, or prerelease
merged-pr-push        — true if the push came from a merged pull request
```

### `code-checks.yml`

Runs two jobs in parallel. Each job calls the setup action to install dependencies, then runs its check.

```text
ESLint      — runs bun run lint
TS check    — runs bun run type-check
```

### `tests.yml`

Runs two jobs in parallel. Each job calls the setup action to install dependencies, then runs its tests.

```text
unit   — runs bun run test
e2e    — installs Playwright browsers, then runs bun run test:e2e
```

### `build.yml`

Builds the app and saves the output so `publish.yml` can use it without building again.

```text
1. Calls the setup action to install dependencies
2. Runs bun run build
3. Uploads the dist folder as a build artifact named build-output-artifact
```

### `release.yml`

Decides whether this change should create a new release, and if so, runs Semantic Release.

```text
Job 1 — Check release eligibility:
  Reads the PR title or commit message.
  If it starts with feat:, fix:, or perf:, allows the release to proceed.
  Anything else (chore:, docs:, refactor:, test:) skips the release.

Job 2 — Create new tag (only runs if Job 1 approved):
  Checks out the full git history (needed by Semantic Release).
  Calls the setup action with skip-checkout: true so it does not overwrite the checkout above.
  Runs bun run release.
  Semantic Release creates the version tag, updates CHANGELOG.md, and creates the GitHub release.
```

Release-triggering prefixes:

```text
feat:   minor release
fix:    patch release
perf:   patch release
```

Prefixes that do not trigger a release:

```text
chore:
test:
docs:
refactor:
```

### `publish.yml`

Deploys the built app to GitHub Pages. It does not build the app itself — it downloads the artifact that `build.yml` already produced.

```text
1. Downloads the build-output-artifact into the dist folder
2. Uploads dist as a GitHub Pages artifact
3. Deploys it to GitHub Pages
```

If the `github-pages` environment has required reviewers configured, GitHub will pause and wait for approval before deploying.

### `sync-prerelease.yml`

Runs after a push to `main` or `master`. Keeps the `prerelease` branch up to date with production.

```text
1. Checks if prerelease already contains the production branch. If yes, does nothing.
2. If not, creates a sync branch from prerelease and merges the production branch into it.
3. Opens or updates a pull request from the sync branch into prerelease.
4. Does not push directly to prerelease — a PR is always created so changes can be reviewed.
5. Fails if there are merge conflicts so they can be resolved manually.
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