import { Deno } from "./registries/deno.ts";
import { Denopkg } from "./registries/denopkg.ts";
import { Github } from "./registries/github.ts";
import { Nest } from "./registries/nest.ts";

interface IURLdata {
  name: string;
  version: string;
  parsedURL: string;
  registry: string;
  owner: string;
}

/** Get latest version from supported registries */
export async function getLatestVersion(
  registry: string,
  module?: string,
  owner?: string,
): Promise<string> {
  module = module ?? "";
  owner = owner ?? "";
  switch (registry) {
    case "x.nest.land":
      return Nest.getLatestVersion(module);

    case "deno.land/x":
      return Deno.getLatestXVersion(module);

    case "deno.land/std":
      return Deno.getLatestStdVersion();

    case "raw.githubusercontent.com":
    case "denopkg.com":
      return Github.getLatestVersion(module, owner);

    default:
      throw new Error(`Unsupported registry: ${registry}`);
  }
}

/** Parse an URL from supported registries */
export function parseURL(url: string): IURLdata {
  const tmpSplit = url.split("/");
  let registry = tmpSplit[2];
  let owner = "";

  switch (registry) {
    case "x.nest.land":
      return { registry, owner, ...Nest.parseURL(url) };

    case "deno.land":
      return { owner, ...Deno.parseURL(url) };

    case "raw.githubusercontent.com":
      return { registry, ...Github.parseURL(url) };

    case "denopkg.com":
      return { registry, ...Denopkg.parseURL(url) };

    default:
      throw new Error(`Unsupported registry: ${registry}`);
  }
}
