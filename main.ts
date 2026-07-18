import dotenv from "dotenv";
import _axios from "axios";
import fs from "fs";

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

dotenv.config();

const USERNAME = "cuzknothz";

const axios = _axios.create({
  baseURL: "https://api.github.com/",
  headers: { Authorization: `Bearer ${process.env.NEVERLAND_KEY}` },
});

const { data: userData } = await axios.get<GitHubUser>(`/users/${USERNAME}`);

const {
  data: { items: repoList },
} = await axios.get<{ items: GitHubRepository[] }>(
  `/search/repositories?q=user:${USERNAME}&per_page=100`,
);

const getTotalStars = (): number => {
  let count = 0;
  for (let c = 0; c < repoList.length; ++c) {
    count += repoList[c].stargazers_count;
  }
  return count;
};

const getTotalRepos = (): number => repoList.length;

const getTotalFollowers = (): number => userData.followers;

const getTotalContributions = async (): Promise<number> => {
  let count = 0;
  for (let c = 0; c < repoList.length; ++c) {
    const { data: contributors } = await axios.get<GitHubContributor[]>(
      `/repos/${USERNAME}/${repoList[c].name}/contributors`,
    );

    for (let i = 0; i < contributors.length; ++i) {
      if (contributors[i].login === USERNAME) {
        count += contributors[i].contributions;
      }
    }
  }
  return count;
};

const PLACEHOLDERS: Record<string, number> = {
  STARS: getTotalStars(),
  REPOS: getTotalRepos(),
  FOLLOWERS: getTotalFollowers(),
  COMMITS: await getTotalContributions(),
};

const processUpdateFile = (inputPath: string, outputPath: string): void => {
  fs.readFile(inputPath, "utf8", (err, data) => {
    if (err) {
      console.log(err);
      return;
    }

    let template = data;
    for (const key in PLACEHOLDERS) {
      const value = PLACEHOLDERS[key];
      template = template.replaceAll("{{" + key + "}}", String(value));
    }
    fs.writeFile(outputPath, template, (err) => {
      if (err) {
        console.log(err);
        return;
      }
      console.log("DONE");
    });
  });
};

processUpdateFile("cuzknothz.svg", "banner.svg");
