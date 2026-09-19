import fs from "node:fs";
import path from "node:path";

const githubAppId = process.env.GITHUB_APP_ID;
const githubInstallationId =
  process.env.GITHUB_INSTALLATION_ID;

if (!githubAppId) {
  throw new Error(
    "GITHUB_APP_ID is not configured"
  );
}

if (!githubInstallationId) {
  throw new Error(
    "GITHUB_INSTALLATION_ID is not configured"
  );
}

const githubPrivateKey = fs.readFileSync(
  path.resolve("secrets/sam.pem"),
  "utf8"
);

const githubContentRoot =
  process.env.GITHUB_CONTENT_ROOT;

if (!githubContentRoot) {
  throw new Error("GITHUB_CONTENT_ROOT is not configured");
}

export const githubConfig = {
  appId: Number(githubAppId),
  installationId: Number(githubInstallationId),
  privateKey: githubPrivateKey,
  owner: process.env.GITHUB_OWNER ?? "",
  repo: process.env.GITHUB_REPO ?? "",
  branch: process.env.GITHUB_BRANCH ?? "main",
  contentRoot: githubContentRoot,
};