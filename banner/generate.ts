import dotenv from "dotenv";
import _axios from "axios";
import fs from "fs/promises";
import path from "path";

interface GitHubUser {
  followers: number;
}

interface GitHubRepository {
  name: string;
  stargazers_count: number;
}

interface GitHubContributor {
  login: string;
  contributions: number;
}

interface GitHubStats {
  stars: number;
  repos: number;
  followers: number;
  commits: number;
}

dotenv.config();

const USERNAME = process.env.GITHUB_USERNAME ?? "cuzknothz";
const API_TOKEN = process.env.NEVERLAND_KEY;

const axios = _axios.create({
  baseURL: "https://api.github.com/",
  headers: API_TOKEN ? { Authorization: `Bearer ${API_TOKEN}` } : {},
});

async function fetchGitHubStats(): Promise<GitHubStats> {
  const [{ data: user }, { data: repositoriesResponse }] = await Promise.all([
    axios.get<GitHubUser>(`/users/${USERNAME}`),
    axios.get<{ items: GitHubRepository[] }>(
      `/search/repositories?q=user:${USERNAME}&per_page=100`,
    ),
  ]);

  const repositories = repositoriesResponse.items;
  const contributorResults = await Promise.allSettled(
    repositories.map((repository) =>
      axios.get<GitHubContributor[]>(
        `/repos/${USERNAME}/${repository.name}/contributors`,
      ),
    ),
  );

  const commits = contributorResults.reduce((total, result) => {
    if (result.status !== "fulfilled") {
      return total;
    }

    const contributors = result.value.data;
    if (!Array.isArray(contributors)) {
      return total;
    }

    const currentUser = contributors.find(
      (contributor) => contributor.login === USERNAME,
    );

    return total + (currentUser?.contributions ?? 0);
  }, 0);

  return {
    stars: repositories.reduce(
      (total, repository) => total + repository.stargazers_count,
      0,
    ),
    repos: repositories.length,
    followers: user.followers,
    commits,
  };
}

function buildTemplateValues(stats: GitHubStats): Record<string, number> {
  return {
    STARS: stats.stars,
    REPOS: stats.repos,
    FOLLOWERS: stats.followers,
    COMMITS: stats.commits,
  };
}

async function renderTemplateFile(
  inputPath: string,
  outputPath: string,
  values: Record<string, number>,
): Promise<void> {
  const template = await fs.readFile(inputPath, "utf8");
  const renderedTemplate = Object.entries(values).reduce(
    (result, [key, value]) => result.replaceAll(`{{${key}}}`, String(value)),
    template,
  );

  await fs.writeFile(outputPath, renderedTemplate, "utf8");
}

async function main(): Promise<void> {
  try {
    const stats = await fetchGitHubStats();
    const templateValues = buildTemplateValues(stats);

    await renderTemplateFile(
      path.resolve("./banner/template_banner.svg"),
      path.resolve("./banner/finalize_banner.svg"),
      templateValues,
    );

    console.log("Banner generated successfully.");
  } catch (error) {
    console.error("Failed to generate banner:", error);
    process.exitCode = 1;
  }
}

await main();
