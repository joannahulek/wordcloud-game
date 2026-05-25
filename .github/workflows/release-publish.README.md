# Release And Publish Jobs

This explains how pull request checks, release, prerelease, and publish workflows run.

## Workflow Files

`ci.yml` runs only for pull requests.

`deploy.yml` runs only for pushes to:

```text
main
master
prerelease
```

`classify-change.yml` decides whether a push came from a merged pull request or from a direct commit.

`release.yml` runs Semantic Release.

`publish.yml` deploys the built app to GitHub Pages.

## Pull Request Flow

For pull requests, only validation jobs are visible:

```text
classify-change -> setup -> code-checks -> tests -> build
```

`deploy` and `publish` are not part of the pull request workflow.

## Merged Pull Request Flow

When a pull request is merged into `main`, `master`, or `prerelease`, `deploy.yml` runs.

The validation jobs are skipped because they already passed on the pull request.

The flow is:

```text
classify-change -> deploy -> publish
```

`publish` still waits for manual approval through the `github-pages` environment.

## Direct Commit Flow

When someone commits directly to `main`, `master`, or `prerelease`, `deploy.yml` runs everything from start to finish:

```text
classify-change -> setup -> code-checks -> tests -> build -> deploy -> publish
```

This is intentional because direct commits did not go through pull request checks first.

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

The check is done after the PR is merged.

For direct commits, the first line of the commit message is checked instead of a PR title. It must also start with `feat:`, `fix:`, or `perf:`.

## Production Releases

Merges or direct commits to `main` or `master` create normal production releases.

Example production tags:

```text
v1.2.0
v1.2.1
```

## Prereleases

Merges or direct commits to `prerelease` create prereleases.

Example prerelease tags:

```text
v1.2.0-prerelease.1
v1.2.0-prerelease.2
```

Prerelease tags and GitHub releases are still real repository objects, but they are separated from normal production version tags.

When you later merge tested changes into `main`, Semantic Release will create the normal production release from the production branch.

## Publish Job

The `publish` job runs only when all of these are true:

```text
The deploy job passed.
The release check returned should-release=true.
```

`publish.yml` builds the app, uploads the `dist` folder as a GitHub Pages artifact, and deploys it to GitHub Pages.

## Manual Trigger

These jobs are reusable or event-driven workflows, so release and publish are normally triggered by pushing to `main`, `master`, or `prerelease`.

To manually trigger the normal flow, push an empty commit with a release prefix:

```sh
git checkout prerelease
git pull
git commit --allow-empty -m "fix: trigger prerelease"
git push
```

Use `feat:` for a minor release, and `fix:` or `perf:` for a patch release.

To manually approve publishing, use the `github-pages` environment approval in GitHub Actions. Configure required reviewers for the `github-pages` environment in repository settings. Then the `publish` job will wait for approval before deploying.

Do not use `chore:`, `test:`, or `docs:` if you want release and publish to run. Those prefixes are intentionally skipped.
