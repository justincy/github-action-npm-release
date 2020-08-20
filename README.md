# github-action-npm-release

Automatically generate a release when the package.json version changes. The release name and tag will match the new version. If no releases yet exist, this action will create the first release.

The release notes will contain a change log generated from git history in the following format:

```
- f0d91bd Making progress
- 275e3e2 Initial commit
```

## Usage Example

```
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
```

## Assumptions

This action makes a few assumptions:

* `actions/checkout@v2` with `fetch-depth: 0` is used before this action runs. That allows this action to have all the information it needs to generate the change log from the git hustory.
* You are only releasing from one branch
* It is only used during `push`

## Possible future enhancements

* Add output indicating whether a release was created
* Add outputs with metadata from the release
* Add options for draft and pre-release
* Add option for custom git-log format
