import { Registry } from "./registry.ts";
import * as npm from "./_npm.ts";
import * as gh from "./_github.ts";

/* built-in intellisense */
export const deno = new Registry("deno.land");
export const nest = new Registry("x.nest.land");
export const crux = new Registry("crux.land", {
  variableMapping: new Map([["version", "tag"]]),
});

/* npm based intellisense */

const esmQueryParams = {
  key: "query",
  url: "hatcher:///",
  compatibilityLayer: {
    async fetch() {
      return await [
        "bundle",
        "dev",
        "deps",
        "css",
        "target",
        "no-check",
      ];
    },
  },
};

export const esm = new Registry("esm.sh", {
  intellisense: {
    version: 1,
    registries: [{
      schema:
        `/:module(${npm.packageName})@:range(\\W)?:version/:path*{\\?:query}?`,
      variables: [
        npm.module,
        npm.range,
        npm.version,
        npm.path,
        esmQueryParams,
      ],
    }, {
      schema: `/:module(${npm.packageName})/:path*{\\?:query}?`,
      variables: [npm.module, npm.versionlessPath, esmQueryParams],
    }],
  },
});

const skypackQueryParams = {
  key: "query",
  url: "hatcher:///",
  compatibilityLayer: {
    fetch() {
      return Promise.resolve([
        "dts",
        "min",
        "dist",
        "meta",
      ]);
    },
  },
};

export const skypack = new Registry("cdn.skypack.dev", {
  intellisense: {
    version: 1,
    registries: [{
      schema:
        `/:module(${npm.packageName})@:range(\\W)?:version/:path*{\\?:query}?`,
      variables: [
        npm.module,
        npm.range,
        npm.version,
        npm.path,
        skypackQueryParams,
      ],
    }, {
      schema: `/:module(${npm.packageName})/:path*{\\?:query}?`,
      variables: [npm.module, npm.versionlessPath, skypackQueryParams],
    }],
  },
});

export const jspm = new Registry("jspm.dev", {
  intellisense: {
    version: 1,
    registries: [{
      schema:
        `/(npm\\:)?:module(${npm.packageName})@:range(\\W)?:version/:path*`,
      variables: [npm.module, npm.version, npm.range, npm.path],
    }, {
      schema: `/:module(${npm.packageName})/:path*`,
      variables: [npm.module, npm.versionlessPath],
    }],
  },
});

/* github based intellisense */
export const github = new Registry("raw.githubusercontent.com", {
  intellisense: {
    version: 1,
    registries: [{
      schema:
        `/:author(${gh.namingRules})/:module(${gh.namingRules})/:version/:path+`,
      variables: [gh.author, gh.module, gh.version, gh.path],
    }],
  },
});

export const denopkg = new Registry("denopkg.com", {
  intellisense: {
    version: 1,
    registries: [{
      schema:
        `/:author(${gh.namingRules})/:module(${gh.namingRules})@:version/:path+`,
      variables: [gh.author, gh.module, gh.version, gh.path],
    }, {
      schema: `/:author(${gh.namingRules})/:module(${gh.namingRules})/:path+`,
      variables: [gh.author, gh.module, gh.versionlessPath],
    }],
  },
});

/* github & npm based intellisense */
function jsdelivrMinify(paths: string[]): string[] {
  const jsCss = paths.filter((path) => {
    const parts = path.split(".");
    const ext = parts.pop() ?? "";
    const min = parts.pop() ?? "";
    return ["js", "css"].includes(ext) && min !== "min";
  });
  paths.push(...jsCss);
  return paths;
}

export const jsdelivr = new Registry("cdn.jsdelivr.net", {
  intellisense: {
    version: 1,
    registries: [{
      schema: `/npm/:module(${npm.packageName})@:range(\\W)?:version/:path*`,
      variables: [npm.module, npm.version, npm.range, {
        ...npm.path,
        compatibilityLayer: {
          async transform(res: Response) {
            const paths = await npm.path.compatibilityLayer!.transform!(res);
            return jsdelivrMinify(paths);
          },
        },
      }],
    }, {
      schema: `/npm/:module(${npm.packageName})/:path*`,
      variables: [npm.module, {
        ...npm.versionlessPath,
        compatibilityLayer: {
          async transform(res: Response) {
            const paths = await npm.versionlessPath.compatibilityLayer!
              .transform!(res);
            return jsdelivrMinify(paths);
          },
        },
      }],
    }, {
      schema:
        `/gh/:author(${gh.namingRules})/:module(${gh.namingRules})@:version/:path*`,
      variables: [gh.author, gh.module, gh.version, {
        ...gh.path,
        compatibilityLayer: {
          async fetch(...variables) {
            const paths = await gh.path.compatibilityLayer!.fetch!(
              ...variables,
            );
            return jsdelivrMinify(paths);
          },
        },
      }],
    }, {
      schema:
        `/gh/:author(${gh.namingRules})/:module(${gh.namingRules})/:path*`,
      variables: [gh.author, npm.module, {
        ...gh.versionlessPath,
        compatibilityLayer: {
          async fetch(...variables) {
            const paths = await gh.versionlessPath.compatibilityLayer!.fetch!(
              ...variables,
            );
            return jsdelivrMinify(paths);
          },
        },
      }],
    }],
  },
});
