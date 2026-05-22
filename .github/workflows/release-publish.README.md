# Release And Publish Jobs

This explains how the `deploy` and `publish` jobs are triggered.

## Normal Flow

The flow is defined in `.github/workflows/ci.yml`:

```text
build -> deploy -> publish
```

`deploy` calls `.github/workflows/release.yml`.

`publish` calls `.github/workflows/publish.yml`.

`publish` only starts after `deploy` finishes successfully.

## What PR Name Triggers Release And Publish

The pull request title must start with one of these prefixes:

```text
feat:
fix:
perf:
```

Examples that trigger release and publish:

```text
feat: add word cloud game board
fix: correct mobile layout
perf: reduce bundle size
```

Examples that do not trigger release or publish:

```text
test: add App unit test
chore: update dependencies
docs: update readme
refactor: simplify layout
```

The check is done after the PR is merged into `main` or `master`.

If the change is pushed directly to `main` or `master`, the first line of the commit message is checked instead of a PR title. It must also start with `feat:`, `fix:`, or `perf:`.

## Release Job

The `deploy` job in `ci.yml` runs only when all of these are true:

```text
The build job passed.
The event is a push.
The target branch is main or master.
```

Then `release.yml` checks whether the PR title or commit message starts with `feat:`, `fix:`, or `perf:`.

If yes, Semantic Release runs and creates the new version tag, updates `CHANGELOG.md`, commits the changelog entry, and creates the GitHub release.

If no, release is skipped.

## Publish Job

The `publish` job in `ci.yml` runs only when all of these are true:

```text
The deploy job passed.
The event is a push.
The target branch is main or master.
The release check returned should-release=true.
```

`publish.yml` builds the app, uploads the `dist` folder as a GitHub Pages artifact, and deploys it to GitHub Pages.

## Manual Trigger

These jobs are reusable workflows, so they are not started from the GitHub Actions "Run workflow" button directly.

To manually trigger the normal release and publish flow, push an empty commit to `main` or `master` with a release prefix:

```sh
git checkout main
git pull
git commit --allow-empty -m "fix: trigger release"
git push
```

Use `feat:` for a minor release, and `fix:` or `perf:` for a patch release.

To manually approve publishing, use the `github-pages` environment approval in GitHub Actions. Configure required reviewers for the `github-pages` environment in repository settings. Then the `publish` job will wait for approval before deploying.

Do not use `chore:`, `test:`, or `docs:` if you want release and publish to run. Those prefixes are intentionally skipped.
