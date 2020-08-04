import { DenoLand } from "./registries/DenoLand.ts";
import { Denopkg } from "./registries/Denopkg.ts";
import { Github } from "./registries/Github.ts";
import { NestLand } from "./registries/NestLand.ts";

interface IURLdata {
  name: string;
  version: string;
  parsedURL: string;
  registry: string;
  owner: string;
  relativePath: string;
}

/** Get latest version from supported registries */
export async function getLatestVersion(
  registry: string,
  module: string = "",
  owner: string = "",
): Promise<string> {
  switch (registry) {
    case "x.nest.land":
      return NestLand.getLatestVersion(module);

    case "deno.land":
      return DenoLand.getLatestVersion(module);

    case "raw.githubusercontent.com":
    case "denopkg.com":
      return Github.getLatestVersion(module, owner);

    default:
      throw new Error(`Unsupported registry: ${registry}`);
  }
}

/** Parse an URL from supported registries */
export function parseURL(url: string): IURLdata {
  let registry = url.split("/")[2];

  switch (registry) {
    case "x.nest.land":
      return { registry, owner: "", ...NestLand.parseURL(url) };

    case "deno.land":
      return { registry, owner: "", ...DenoLand.parseURL(url) };

    case "raw.githubusercontent.com":
      return { registry, ...Github.parseURL(url) };

    case "denopkg.com":
      return { registry, ...Denopkg.parseURL(url) };

    default:
      throw new Error(`Unsupported registry: ${registry}`);
  }
}
