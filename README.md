# Automatic GitHub Release

Automatically generate a release when the package.json version changes. The release name and tag will match the new version. If no releases yet exist, this action will create the first release.

The release notes will contain a change log generated from git history in the following format:

```md
- f0d91bd Making progress
- 275e3e2 Initial commit
```

## Assumptions

This action makes a few assumptions:

- `actions/checkout@v2` with `fetch-depth: 0` is used before this action runs. That allows this action to have all the information it needs to generate the change log from the git history.
- You are only releasing from one branch
- It is only used during `push`

## Usage Example

```yml
name: Release
on:
  push:
    branches:
      - master

jobs:
  build:
    name: Release
    runs-on: ubuntu-latest
    steps:
      - name: Checkout
        uses: actions/checkout@v2
        with:
          fetch-depth: 0
      - name: Release
        uses: justincy/github-action-npm-release@v1.2.0
        id: release
      - name: Print release output
        if: ${{ steps.release.outputs.released == 'true' }}
        run: echo Release ID ${{ steps.release.outputs.release_id }}
```

Works great in tandem with auto-publishing. Here's an example for the GitHub Package Registry:

```yml
name: Release
on:
  push:
    branches:
      - master

jobs:
  release:
    name: Release
    runs-on: ubuntu-latest
    steps:
      - name: Checkout repository
        uses: actions/checkout@v2
        with:
          fetch-depth: 0
      - name: Automatic GitHub Release
        uses: justincy/github-action-npm-release@2.0.1
        id: release
      - uses: actions/setup-node@v1
        if: steps.release.outputs.released == 'true'
        with:
          registry-url: 'https://npm.pkg.github.com'
      - name: Publish
        if: steps.release.outputs.released == 'true'
        run: npm publish
        env:
          NODE_AUTH_TOKEN: ${{ secrets.GITHUB_TOKEN }}
```

## Inputs

- `token`: Personal access token for GitHub authentication. Optional. Defaults to `${{ github.token }}`.
- `path`: Path of the package.json file that will be examined. Optional. Defaults to `${{ github.workspace }}`.

## Outputs

- `released`: Set to true when a release is created.
- `html_url`: The URL for viewing the release in a browser.
- `upload_url`: The URL for uploading assets to the release.
- `release_id`: ID of the release.
- `release_tag`: Tag of the release.
- `release_name`: Name of the release.

## Why re-invent the wheel?

- [Publish to npm](https://github.com/marketplace/actions/publish-to-npm)
    - I don't want to be tied to any specific commit format. I want a new `version` to be the only signal to release.
- [Version Check](https://github.com/marketplace/actions/version-check)
    - It only checks commits in a single push. If the workflow run associated with the push that has the new version fails and you push again to fix it, then the second workflow run isn't associated with the commits where the version changed and therefore it doesn't detect that the version changed.
- I wanted to learn more about GitHub actions.

## Possible future enhancements

- Add options for draft and pre-release
- Add option for custom git-log format
