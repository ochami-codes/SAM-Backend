import { githubConfig } from "../../config/github.ts";
import { getGithubInstallationOctokit } from "../../utils/github/githubClient.ts";

export interface GithubContent {
  path: string;
  sha: string;
  content: string;
}
export interface GithubContentEntry { path: string; name: string; sha: string; type: "file" | "dir"; }
export async function getGithubContent(
  path: string
): Promise<GithubContent> {
  const octokit = await getGithubInstallationOctokit();

  const { data } = await octokit.rest.repos.getContent({
    owner: githubConfig.owner,
    repo: githubConfig.repo,
    path,
    ref: githubConfig.branch,
  });

  if (Array.isArray(data)) {
    throw new Error(`Expected a file but received a directory: ${path}`);
  }

  if (data.type !== "file") {
    throw new Error(`Expected a file but received: ${data.type}`);
  }

  if (!data.content) {
    throw new Error(`GitHub returned no content for: ${path}`);
  }

  return {
    path: data.path,
    sha: data.sha,
    content: Buffer.from(data.content, "base64").toString("utf-8"),
  };
}
export async function listGithubContent( path: string ): Promise<GithubContentEntry[]> { const octokit = await getGithubInstallationOctokit();
     const { data } = await octokit.rest.repos.getContent({ owner: githubConfig.owner, repo: githubConfig.repo, path, ref: githubConfig.branch, }); 
     if (!Array.isArray(data)) { throw new Error(`Expected a directory but received a file: ${path}`);
     }
      return data .filter( (entry): entry is typeof entry & { type: "file" | "dir"; 

      } => entry.type === "file" || entry.type === "dir" ) .map((entry) => ({ path: entry.path, name: entry.name, sha: entry.sha, type: entry.type, })); }
export interface UpdateGithubContentInput {
  path: string;
  content: string;
  sha: string;
  message: string;
}

export interface UpdatedGithubContent {
  path: string;
  sha: string;
  commitSha: string;
}
export async function updateGithubContent(
  input: UpdateGithubContentInput
): Promise<UpdatedGithubContent> {
  const octokit = await getGithubInstallationOctokit();

  const encodedContent = Buffer.from(
    input.content,
    "utf-8"
  ).toString("base64");

  const { data } = await octokit.rest.repos.createOrUpdateFileContents({
    owner: githubConfig.owner,
    repo: githubConfig.repo,
    path: input.path,
    message: input.message,
    content: encodedContent,
    sha: input.sha,
    branch: githubConfig.branch,
  });

  if (!data.content?.path || !data.content.sha || !data.commit.sha) {
    throw new Error("GitHub returned an incomplete update response");
  }

  return {
    path: data.content.path,
    sha: data.content.sha,
    commitSha: data.commit.sha,
  };
}
export interface DeleteGithubContentInput {
  path: string;
  sha: string;
  message: string;
}

export interface DeletedGithubContent {
  path: string;
  commitSha: string;
}

export async function deleteGithubContent(
  input: DeleteGithubContentInput
): Promise<DeletedGithubContent> {
  const octokit = await getGithubInstallationOctokit();

  const { data } = await octokit.rest.repos.deleteFile({
    owner: githubConfig.owner,
    repo: githubConfig.repo,
    path: input.path,
    message: input.message,
    sha: input.sha,
    branch: githubConfig.branch,
  });

  if (!data.commit.sha) {
    throw new Error("GitHub returned an incomplete delete response");
  }

  return {
    path: input.path,
    commitSha: data.commit.sha,
  };
}