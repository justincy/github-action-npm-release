const core = require('@actions/core');
const {Octokit} = require('@octokit/rest');
const {resolve} = require('path');

const octokit = new Octokit({
  auth: process.env.GITHUB_TOKEN
});

async function main() {

  core.info(`Repository ${process.env.GITHUB_REPOSITORY}`);
  const [owner, repo] = process.env.GITHUB_REPOSITORY.split('/');

  // 1. Get the current version
  const {version: currentVersion} = require(resolve('./package.json'));
  core.info(`Current version: ${currentVersion}`);

  // 2. Get the latest release version and hash
  // We'll use the version for deciding whether or not we need to create
  // a new release (currentVersion !== latestVersion) and we'll use the
  // sha to generate a change log from that commit up until the current.
  let firstRelease = false;
  const {data: [latestRelease]} = await octokit.repos.listReleases({
    owner,
    repo,
    per_page: 1
  });
  if (!latestRelease) {
    // In the future we might want to handle this scenario by generating
    // a change log using all commits from the beginning of time, but that's
    // probably not what most people would want in their first release.
    core.setFailed('No release yet exists. Create the first one manually.');
  }

  // 3. If versions are different or its the first release
  //    1. Generate a change log
  //    2. Publish a release
}

main();