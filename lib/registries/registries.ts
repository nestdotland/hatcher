import {
  Json,
  Registry,
  RegistryOptions,
  RegistrySpecifier,
} from "./registry.ts";
import { Untar } from "../../deps.ts";
import { version } from "../version.ts";

/* built-in intellisense */
export const deno = new Registry("deno.land");
export const nest = new Registry("x.nest.land");
export const crux = new Registry("crux.land");

//TODO: module name: include . etc.

export const esm = new Registry("esm.sh", {
  intellisense: {
    version: 1,
    registries: [{
      schema:
        "/:module([a-z0-9_]+|@[a-z0-9_]+/[a-z0-9_]+)@:range(\\W)?:version/:path*{\\?:query}?",
      variables: [
        {
          key: "module",
          url: "https://replicate.npmjs.com/_all_docs",
          compatibilityLayer: {
            transform: async (res: Response) => {
              const json = await res.json();
              return json?.rows?.map((row: { key: string }) => row.key) ?? [];
            },
          },
        },
        {
          key: "version",
          url: "https://registry.npmjs.org/${module}",
          compatibilityLayer: {
            headers: new Headers({
              Accept:
                "application/vnd.npm.install-v1+json; q=1.0, application/json; q=0.8, */*",
            }),
            transform: async (res: Response) => {
              const json = await res.json();
              return Object.keys(json?.["dist-tags"] ?? {})
                .concat(Object.keys(json?.versions ?? {}));
            },
          },
        },
        {
          key: "path",
          url: "https://cdn.skypack.dev/${module}@${{version}}?meta",
          compatibilityLayer: {
            transform: async (res: Response) => {
              const json = await res.json();
              return Object.keys(json?.packageExports ?? {})
                .map((path) => path.substring(2)) ?? [];
            },
          },
        },
        {
          key: "query",
          url: "",
          compatibilityLayer: {
            constant: [
              "bundle",
              "dev",
              "deps",
              "css",
              "target",
              "no-check",
            ],
          },
        },
        {
          key: "range",
          url: "",
          compatibilityLayer: {
            constant: [
              "~",
              "^",
            ],
          },
        },
      ],
    }, {
      schema: "/:module([a-z0-9_]+|@[a-z0-9_]+/[a-z0-9_]+)/:path*{\\?:query}?",
      variables: [
        {
          key: "module",
          url: "https://replicate.npmjs.com/_all_docs",
          compatibilityLayer: {
            transform: async (res: Response) => {
              const json = await res.json();
              return json?.rows?.map((row: { key: string }) => row.key) ?? [];
            },
          },
        },
        {
          key: "path",
          url: "https://cdn.skypack.dev/${module}?meta",
          compatibilityLayer: {
            transform: async (res: Response) => {
              const json = await res.json();
              return Object.keys(json?.packageExports ?? {})
                .map((path) => path.substring(2)) ?? [];
            },
          },
        },
        {
          key: "query",
          url: "",
          compatibilityLayer: {
            constant: [
              "bundle",
              "dev",
              "deps",
              "css",
              "target",
              "no-check",
            ],
          },
        },
      ],
    }],
  },
});

export const skypack = new Registry("cdn.skypack.dev", {
  intellisense: {
    version: 1,
    registries: [{
      schema:
        "/:module([a-z0-9_]+|@[a-z0-9_]+/[a-z0-9_]+)@:range(\\W)?:version/:path*{\\?:query}?",
      variables: [
        {
          key: "module",
          url: "https://replicate.npmjs.com/_all_docs",
          compatibilityLayer: {
            transform: async (res: Response) => {
              const json = await res.json();
              return json?.rows?.map((row: { key: string }) => row.key) ?? [];
            },
          },
        },
        {
          key: "version",
          url: "https://registry.npmjs.org/${module}",
          compatibilityLayer: {
            headers: new Headers({
              Accept:
                "application/vnd.npm.install-v1+json; q=1.0, application/json; q=0.8, */*",
            }),
            transform: async (res: Response) => {
              const json = await res.json();
              return Object.keys(json?.["dist-tags"] ?? {})
                .concat(Object.keys(json?.versions ?? {}));
            },
          },
        },
        {
          key: "path",
          url: "https://cdn.skypack.dev/${module}@${{version}}?meta",
          compatibilityLayer: {
            transform: async (res: Response) => {
              const json = await res.json();
              return Object.keys(json?.packageExports ?? {})
                .map((path) => path.substring(2)) ?? [];
            },
          },
        },
        {
          key: "query",
          url: "",
          compatibilityLayer: {
            constant: [
              "bundle",
              "dev",
              "deps",
              "css",
              "target",
              "no-check",
            ],
          },
        },
        {
          key: "range",
          url: "",
          compatibilityLayer: {
            constant: [
              "~",
              "^",
            ],
          },
        },
      ],
    }, {
      schema: "/:module([a-z0-9_]+|@[a-z0-9_]+/[a-z0-9_]+)/:path*{\\?:query}?",
      variables: [
        {
          key: "module",
          url: "https://replicate.npmjs.com/_all_docs",
          compatibilityLayer: {
            transform: async (res: Response) => {
              const json = await res.json();
              return json?.rows?.map((row: { key: string }) => row.key) ?? [];
            },
          },
        },
        {
          key: "path",
          url: "https://cdn.skypack.dev/${module}?meta",
          compatibilityLayer: {
            transform: async (res: Response) => {
              const json = await res.json();
              return Object.keys(json?.packageExports ?? {})
                .map((path) => path.substring(2)) ?? [];
            },
          },
        },
        {
          key: "query",
          url: "",
          compatibilityLayer: {
            constant: [
              "dts",
              "min",
              "dist",
              "meta",
            ],
          },
        },
      ],
    }],
  },
});

export const jspm = new Registry("jspm.dev", {
  intellisense: {
    version: 1,
    registries: [{
      schema:
        "/(npm\\:)?:module([a-z0-9_]+|@[a-z0-9_]+/[a-z0-9_]+)@:range(\\W)?:version/:path*{\\?:query}?",
      variables: [
        {
          key: "module",
          url: "https://replicate.npmjs.com/_all_docs",
          compatibilityLayer: {
            transform: async (res: Response) => {
              const json = await res.json();
              return json?.rows?.map((row: { key: string }) => row.key) ?? [];
            },
          },
        },
        {
          key: "version",
          url: "https://registry.npmjs.org/${module}",
          compatibilityLayer: {
            headers: new Headers({
              Accept:
                "application/vnd.npm.install-v1+json; q=1.0, application/json; q=0.8, */*",
            }),
            transform: async (res: Response) => {
              const json = await res.json();
              return Object.keys(json?.["dist-tags"] ?? {})
                .concat(Object.keys(json?.versions ?? {}));
            },
          },
        },
        {
          key: "path",
          url: "https://cdn.skypack.dev/${module}@${{version}}?meta",
          compatibilityLayer: {
            transform: async (res: Response) => {
              const json = await res.json();
              return Object.keys(json?.packageExports ?? {})
                .map((path) => path.substring(2)) ?? [];
            },
          },
        },
        {
          key: "query",
          url: "",
          compatibilityLayer: {
            constant: [
              "bundle",
              "dev",
              "deps",
              "css",
              "target",
              "no-check",
            ],
          },
        },
        {
          key: "range",
          url: "",
          compatibilityLayer: {
            constant: [
              "~",
              "^",
            ],
          },
        },
      ],
    }, {
      schema: "/:module([a-z0-9_]+|@[a-z0-9_]+/[a-z0-9_]+)/:path*{\\?:query}?",
      variables: [
        {
          key: "module",
          url: "https://replicate.npmjs.com/_all_docs",
          compatibilityLayer: {
            transform: async (res: Response) => {
              const json = await res.json();
              return json?.rows?.map((row: { key: string }) => row.key) ?? [];
            },
          },
        },
        {
          key: "path",
          url: "https://cdn.skypack.dev/${module}?meta",
          compatibilityLayer: {
            transform: async (res: Response) => {
              const json = await res.json();
              return Object.keys(json?.packageExports ?? {})
                .map((path) => path.substring(2)) ?? [];
            },
          },
        },
        {
          key: "query",
          url: "",
          compatibilityLayer: {
            constant: [
              "dts",
              "min",
              "dist",
              "meta",
            ],
          },
        },
      ],
    }],
  },
});

/* github based intellisense */
export const github = new Registry("raw.githubusercontent.com");
export const denopkg = new Registry("denopkg.com");

/* github & npm based intellisense */
export const jsdelivr = new Registry("cdn.jsdelivr.net");
