import "dotenv/config";
import { getGithubInstallationOctokit } from "./src/utils/github/githubClient.ts";
import { githubConfig } from "./src/config/github.ts";
export const octokit = await getGithubInstallationOctokit();

const { data } = await octokit.rest.repos.getContent({
  owner: githubConfig.owner,
  repo: githubConfig.repo,
  path: "",
  ref: "main",
});

console.log(data);