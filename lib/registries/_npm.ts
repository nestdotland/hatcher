import type { Variable } from "./registry.ts";

const namingRules = "[\\w\\d_\\-\\.]+";
export const packageName = `${namingRules}|@${namingRules}/${namingRules}`;

export const options = {
  module: {
    fetch: false,
  },
  version: {
    versions: true,
    distTags: true,
  },
};

export const module: Variable = {
  key: "module",
  url: "hatcher:///",
  compatibilityLayer: {
    async fetch(): Promise<string[]> {
      if (options.module.fetch) {
        const res = await fetch("https://replicate.npmjs.com/_all_docs");
        const json = await res.json();
        return json?.rows?.map((row: { key: string }) => row.key) ?? [];
      }
      return [];
    },
  },
};

export const version: Variable = {
  key: "version",
  url: "hatcher:///${module}",
  compatibilityLayer: {
    async fetch(module: string): Promise<string[]> {
      const res = await fetch(`https://registry.npmjs.org/${module}`, {
        headers: {
          Accept:
            "application/vnd.npm.install-v1+json; q=1.0, application/json; q=0.8, */*",
        },
      });
      const json = await res.json();
      const versions: string[] = [];
      if (options.version.versions) {
        versions.push(...Object.keys(json?.versions ?? {}));
      }
      if (options.version.distTags) {
        versions.push(...Object.keys(json?.["dist-tags"] ?? {}));
      }
      return versions;
    },
  },
};

export const path: Variable = {
  key: "path",
  url: "https://cdn.skypack.dev/${module}@${{version}}?meta",
  compatibilityLayer: {
    async transform(res: Response) {
      const json = await res.json();
      return Object.keys(json?.packageExports ?? {})
        .map((path) => path.substring(2)) ?? [];
    },
  },
};

export const versionlessPath: Variable = {
  key: "path",
  url: "https://cdn.skypack.dev/${module}?meta",
  compatibilityLayer: {
    async transform(res: Response) {
      const json = await res.json();
      return Object.keys(json?.packageExports ?? {})
        .map((path) => path.substring(2)) ?? [];
    },
  },
};

export const range: Variable = {
  key: "range",
  url: "hatcher:///",
  compatibilityLayer: {
    async fetch() {
      return await [
        "~",
        "^",
      ];
    },
  },
};
