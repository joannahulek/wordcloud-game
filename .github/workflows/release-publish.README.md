# GitHub Actions Workflows

This directory contains small workflows that are combined into two main flows:

```text
Pull request checks
Release, prerelease, and publish after merge or direct push
```

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
Classify PR change -> Install dependencies -> Lint and type-check -> Run tests -> Build app
```

Purpose:

```text
Validate pull requests before they are merged.
Deploy and publish jobs are not visible in this workflow.
```

### `ci-triggered-by.direct-merge.yml`

Runs on pushes to release branches.

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
Classify push -> Install dependencies -> Lint and type-check -> Run tests -> Build app -> Create release tag -> Publish to GitHub Pages
```

## Reusable Workflows

These files are called by the main workflows.

### `classify-change.yml`

Job name:

```text
Decide workflow path (PR or direct merge)
```

What it does:

```text
Checks whether the event is a PR, a merged PR push, or a direct push.
Tells later jobs whether full checks are required.
Tells later jobs whether the push is on a release branch.
```

Outputs:

```text
full-checks-required
release-branch-push
merged-pr-push
```

### `setup.yml`

Job name:

```text
Install Bun dependencies
```

What it does:

```text
Checks out the repository.
Installs Bun.
Restores Bun dependency cache.
Runs bun install --frozen-lockfile.
```

### `code-checks.yml`

Jobs:

```text
Run ESLint
Run TypeScript type-check
```

What it does:

```text
Runs bun run lint.
Runs bun run type-check.
```

### `tests.yml`

Jobs:

```text
Run end-to-end tests
Run unit tests
```

What it does:

```text
Runs Playwright end-to-end tests with bun run test:e2e.
Runs Bun unit tests with bun run test.
```

### `build.yml`

Job name:

```text
Build app
```

What it does:

```text
Installs dependencies.
Runs bun run build.
Produces the production dist output.
```

### `release.yml`

Jobs:

```text
Check release eligibility
Create Semantic Release
```

What it does:

```text
Checks whether the PR title or commit message starts with feat:, fix:, or perf:.
If yes, runs Semantic Release.
Semantic Release creates the tag, updates CHANGELOG.md, commits the changelog entry, and creates the GitHub release.
```

Release-triggering prefixes:

```text
feat:
fix:
perf:
```

Prefixes that do not release:

```text
chore:
test:
docs:
refactor:
```

### `publish.yml`

Job name:

```text
Deploy site to GitHub Pages
```

What it does:

```text
Builds the app.
Uploads dist as a GitHub Pages artifact.
Deploys that artifact to GitHub Pages.
```

Manual approval:

```text
The job uses the github-pages environment.
If that environment has required reviewers, GitHub pauses before deployment.
```

### `sync-prerelease.yml`

Job name:

```text
Open sync PR to prerelease
```

What it does:

```text
Runs after a push to main or master.
Checks if prerelease already contains the production branch.
If not, creates or updates a PR from sync/<branch>-to-prerelease into prerelease.
Does not push directly to prerelease.
Fails on merge conflicts so they can be resolved manually.
```

## Release Branches

Production release branches:

```text
main
master
```

Prerelease branch:

```text
prerelease
```

Production tags look like:

```text
v1.2.0
v1.2.1
```

Prerelease tags look like:

```text
v1.2.0-prerelease.1
v1.2.0-prerelease.2
```

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
feat: for a minor release
fix: for a patch release
perf: for a patch release
```

Do not use `chore:`, `test:`, or `docs:` if you want release and publish to run.
