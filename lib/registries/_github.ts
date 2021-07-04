import type { Variable } from "./registry.ts";
import { Core, paginateRest, restEndpointMethods } from "../../deps.ts";

const Octokit = Core.plugin(restEndpointMethods, paginateRest);
const octokit = new Octokit();

export const namingRules = "[\\w\\d_\\-\\.]+";

export const author: Variable = {
  key: "author",
  url: "hatcher:///",
  compatibilityLayer: {
    async fetch() {
      const users: string[] = [];
      const iterator = octokit.paginate.iterator(octokit.rest.users.list, {
        per_page: 100,
      });
      for await (const response of iterator) {
        const names: string[] = response.data
          .map((user) => user?.login)
          .filter((user) => user !== undefined) as string[];
        users.push(...names);
      }
      return users;
    },
  },
};

export const module: Variable = {
  key: "module",
  url: "hatcher:///${author}",
  compatibilityLayer: {
    async fetch(author: string) {
      const modules: string[] = [];
      const iterator = octokit.paginate.iterator(
        octokit.rest.repos.listForUser,
        {
          username: author,
          per_page: 100,
        },
      );
      for await (const response of iterator) {
        modules.push(...response.data.map((repo) => repo.name));
      }
      return modules;
    },
  },
};

export const version: Variable = {
  key: "version",
  url: "hatcher:///${author}/${module}",
  compatibilityLayer: {
    async fetch(author: string, module: string) {
      const versions: string[] = [];
      const repo = { owner: author, repo: module };
      const versionIterator = octokit.paginate.iterator(
        octokit.rest.repos.listReleases,
        {
          ...repo,
          per_page: 100,
        },
      );
      for await (const response of versionIterator) {
        versions.push(...response.data.map((release) => release.tag_name));
      }
      const branchIterator = octokit.paginate.iterator(
        octokit.rest.repos.listBranches,
        {
          ...repo,
          per_page: 100,
        },
      );
      for await (const response of branchIterator) {
        versions.push(...response.data.map((branch) => branch.name));
      }
      return versions;
    },
  },
};

export const path: Variable = {
  key: "path",
  url: "hatcher:///${author}/${module}/${version}",
  compatibilityLayer: {
    async fetch(author: string, module: string, version: string) {
      const paths: string[] = [];
      const repo = { owner: author, repo: module };
      const [tag, branch] = await Promise.allSettled([
        octokit.rest.git.getRef({
          ...repo,
          ref: `tags/${version}`,
        }),
        octokit.rest.git.getRef({
          ...repo,
          ref: `heads/${version}`,
        }),
      ]);
      let sha = "";
      if (tag.status === "fulfilled") {
        sha = tag.value.data.object.sha;
      } else if (branch.status === "fulfilled") {
        sha = branch.value.data.object.sha;
      } else {
        throw new Error("Version doesn't exist.");
      }
      const tree = await octokit.rest.git.getTree({
        ...repo,
        tree_sha: sha,
        recursive: "true",
      });
      for (const element of tree.data.tree) {
        if (element.type === "blob" && element.path !== undefined) {
          paths.push(element.path);
        }
      }
      return paths;
    },
  },
};

export const versionlessPath: Variable = {
  key: "path",
  url: "hatcher:///${author}/${module}",
  compatibilityLayer: {
    async fetch(author: string, module: string) {
      const paths: string[] = [];
      const repo = { owner: author, repo: module };
      const repository = await octokit.rest.repos.get(repo);
      const ref = await octokit.rest.git.getRef({
        ...repo,
        ref: `heads/${repository.data.default_branch}`,
      });
      const tree = await octokit.rest.git.getTree({
        ...repo,
        tree_sha: ref.data.object.sha,
        recursive: "true",
      });
      for (const element of tree.data.tree) {
        if (element.type === "blob" && element.path !== undefined) {
          paths.push(element.path);
        }
      }
      return paths;
    },
  },
};
