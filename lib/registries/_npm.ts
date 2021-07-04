import type { Variable } from "./registry.ts";

const namingRules = "[\\w\\d_\\-\\.]+";
export const packageName = `${namingRules}|@${namingRules}/${namingRules}`;

export const module: Variable = {
  key: "module",
  url: "https://replicate.npmjs.com/_all_docs",
  compatibilityLayer: {
    async transform(res: Response) {
      const json = await res.json();
      return json?.rows?.map((row: { key: string }) => row.key) ?? [];
    },
  },
};

export const version: Variable = {
  key: "version",
  url: "https://registry.npmjs.org/${module}",
  compatibilityLayer: {
    headers: new Headers({
      Accept:
        "application/vnd.npm.install-v1+json; q=1.0, application/json; q=0.8, */*",
    }),
    async transform(res: Response) {
      const json = await res.json();
      return Object.keys(json?.["dist-tags"] ?? {})
        .concat(Object.keys(json?.versions ?? {}));
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
      return [
        "~",
        "^",
      ];
    },
  },
};
