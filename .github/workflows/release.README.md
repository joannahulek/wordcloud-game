# Release Workflow

This explains `.github/workflows/release.yml` in simple terms.

```yaml
name: Release
```

Names this workflow `Release` in GitHub Actions.

```yaml
on:
    workflow_call:
```

Allows another workflow to run this workflow. In this project, `ci.yml` calls it after the build job succeeds.

```yaml
permissions:
    contents: write
    issues: write
    pull-requests: write
```

Gives the workflow permission to create tags, update files like `CHANGELOG.md`, create GitHub releases, and comment on issues or pull requests.

```yaml
concurrency:
    group: release-${{ github.ref }}
    cancel-in-progress: false
```

Prevents two releases for the same branch from running at the same time. Already running releases are not cancelled.

```yaml
jobs:
    release-candidate:
        runs-on: ubuntu-latest
```

Starts the first job. It checks if this change should trigger a release. It runs on a fresh Ubuntu machine.

```yaml
        outputs:
            should-release: ${{ steps.release-title.outputs.should-release }}
```

Saves the result of the release check so the next job can use it.

```yaml
        steps:
            - name: Resolve release title
              id: release-title
```

Starts a step named `Resolve release title`. The `id` lets later lines read values produced by this step.

```yaml
              env:
                  GH_TOKEN: ${{ secrets.GITHUB_TOKEN }}
                  HEAD_SHA: ${{ github.sha }}
                  REPOSITORY: ${{ github.repository }}
                  COMMIT_MESSAGE: ${{ github.event.head_commit.message }}
```

Defines values used by the shell script. These include the GitHub token, commit SHA, repository name, and commit message.

```yaml
              run: |
```

Runs the following shell script.

```sh
title="$(gh api "repos/${REPOSITORY}/commits/${HEAD_SHA}/pulls" \
    -H "Accept: application/vnd.github+json" \
    --jq '.[0].title // empty')"
```

Asks GitHub which pull request introduced this commit, then reads that pull request title.

```sh
if [ -z "$title" ]; then
    title="${COMMIT_MESSAGE%%$'\n'*}"
fi
```

If there is no pull request, this was probably a direct commit to `main` or `master`, so it uses the first line of the commit message.

```sh
if [[ "$title" =~ ^(feat|fix|perf): ]]; then
    echo "should-release=true" >> "$GITHUB_OUTPUT"
    echo "Release allowed for: $title"
else
    echo "should-release=false" >> "$GITHUB_OUTPUT"
    echo "Release skipped for: $title"
fi
```

Allows release only when the pull request title or commit message starts with `feat:`, `fix:`, or `perf:`. Other prefixes, such as `test:` or `chore:`, skip release.

```yaml
    release:
        needs: release-candidate
        if: needs.release-candidate.outputs.should-release == 'true'
        runs-on: ubuntu-latest
```

Starts the real release job only after the check job finishes and says release is allowed.

```yaml
        steps:
            - name: Checkout repository
              uses: actions/checkout@v5
              with:
                  fetch-depth: 0
```

Downloads the repository. `fetch-depth: 0` gets full Git history, which Semantic Release needs to find previous tags.

```yaml
            - name: Setup Node.js
              uses: actions/setup-node@v5
              with:
                  node-version: 24
```

Installs Node.js 24, which Semantic Release needs.

```yaml
            - name: Setup Bun 🛠️
              uses: oven-sh/setup-bun@v2
              with:
                  bun-version: 1.2.21
```

Installs Bun version `1.2.21`.

```yaml
            - name: Get cached dependencies 🛠️
              id: cache-deps
              uses: actions/cache@v5
              with:
                  path: ~/.bun/install/cache
                  key: bun-${{ runner.os }}-${{ hashFiles('**/bun.lock') }}
                  restore-keys: |
                      bun-${{ runner.os }}-
```

Restores Bun's dependency cache to speed up installs. The cache key changes when `bun.lock` changes.

```yaml
            - name: Install dependencies 🛠️
              run: bun install --frozen-lockfile
```

Installs dependencies exactly as defined in `bun.lock`.

```yaml
            - name: Release 🚀
              env:
                  GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
              run: bun run release
```

Runs Semantic Release. It creates the new tag, updates `CHANGELOG.md`, commits that changelog entry, and publishes the GitHub release.
