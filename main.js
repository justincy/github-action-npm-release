const core = require('@actions/core');
const {Octokit} = require('@octokit/rest');
const {resolve} = require('path');
const {promisify} = require('util');
const exec = promisify(require('child_process').exec);

const octokit = new Octokit({
  auth: process.env.GITHUB_TOKEN
});

async function main() {

  core.info(`Repository ${process.env.GITHUB_REPOSITORY}`);
  const [owner, repo] = process.env.GITHUB_REPOSITORY.split('/');

  // 1. Get the current version
  const {version: newVersion} = require(resolve('./package.json'));
  core.info(`New version: ${newVersion}`);

  // 2. Get the latest release version and hash
  // We'll use the version for deciding whether or not we need to create
  // a new release (newVersion !== latestVersion) and we'll use the
  // sha to generate a change log from that commit up until the current.
  let beginningSha;
  let firstRelease = false;
  let previousVersion;
  const {data: [latestRelease]} = await octokit.repos.listReleases({
    owner,
    repo,
    per_page: 1
  });

  // Handle scenario where there is no release yet
  if (!latestRelease) {
    firstRelease = true;
    core.info('Existing release. Release notes will contain all commits from the beginning of the repo.');
  }

  // There are other releases
  else {
    // TODO: calculate the version of the latest release
  }

  // 3. If versions are different or if its the first release
  if (firstRelease || previousVersion !== newVersion) {
    
    // 1. Generate the change log
    let changeLog;
    try {
      const {stdout, stderr} = await exec(`git log ${firstRelease ? '' : `${beginningSha}..HEAD`} --pretty=format:"- %h %s"`);
      changeLog = stdout.trim();
      core.info(`Change Log:\n\n${changeLog}`);
    } catch (error) {
      core.setFailed('Unable to generate the change log.');
      core.error(error);
      process.exit();
    }

    // 2. Publish a release
    try {
      const {data} = await octokit.repos.createRelease({
        owner, 
        repo, 
        tag_name: newVersion, 
        name: newVersion, 
        target_commitish: process.env.GITHUB_SHA,
        body: changeLog
      });
      // What output should we provide?
      // https://developer.github.com/v3/repos/releases/#response-4
      core.info(`Created release ${newVersion}`)
    } catch (error) {
      core.setFailed(`Failed to create release ${newVersion} for ${owner}/${repo}#${process.env.GITHUB_SHA}`);
      core.error(error);
      core.info(JSON.stringify(error.headers));
      core.info(JSON.stringify(error.request));
      process.exit();
    }
  }
  
  // Nothing to do
  else {
    core.info('Version has not changed.');
  }
}

main();