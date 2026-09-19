import { App } from "octokit";
import { githubConfig } from "../../config/github.ts";

export const githubApp = new App({
  appId: githubConfig.appId,
  privateKey: githubConfig.privateKey,
});

export async function testGithubAppAuthentication() {
  const { data } = await githubApp.octokit.rest.apps.getAuthenticated();

  console.log("GitHub App authenticated:", {
    id: data!.id,
    slug: data!.slug,
    name: data!.name,
  });

  return data;
}

export async function getGithubInstallationOctokit() {
  return githubApp.getInstallationOctokit(
    githubConfig.installationId
  );
}