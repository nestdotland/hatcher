import { HatcherError } from "./utilities/error.ts";
import { DenoLand } from "./registries/DenoLand.ts";
import { Denopkg } from "./registries/Denopkg.ts";
import { Github } from "./registries/Github.ts";
import { Jspm } from "./registries/Jspm.ts";
import { NestLand } from "./registries/NestLand.ts";
import { Skypack } from "./registries/Skypack.ts";
import type { URLData } from "./registries/Registry.ts";
import type { Registry } from "./registries/Registry.ts";

export interface ProcessedURL extends URLData {
  registry: string;
}

export const registries: typeof Registry[] = [
  DenoLand,
  Denopkg,
  Github,
  Jspm,
  NestLand,
  Skypack,
];

/** Get registry object from web domain */
export function getRegistry(registryName: string) {
  for (const registry of registries) {
    if (registryName === registry.domain) {
      return registry;
    }
  }
  throw new HatcherError(`Unsupported registry: ${registryName}`);
}

/** Get latest release version from supported registries */
export async function latestVersion(
  registryName: string,
  module: string,
  owner = "_",
): Promise<string | undefined> {
  for (const registry of registries) {
    if (registryName === registry.domain) {
      return registry.latestVersion(module, owner);
    }
  }
  throw new HatcherError(`Unsupported registry: ${registryName}`);
}

/** Get latest stable version from supported registries */
export async function latestStableVersion(
  registryName: string,
  module: string,
  owner = "_",
): Promise<string | undefined> {
  for (const registry of registries) {
    if (registryName === registry.domain) {
      return registry.latestStableVersion(module, owner);
    }
  }
  throw new HatcherError(`Unsupported registry: ${registryName}`);
}

/** Get sorted versions from supported registries */
export async function sortedVersions(
  registryName: string,
  module: string,
  owner = "_",
): Promise<string[]> {
  for (const registry of registries) {
    if (registryName === registry.domain) {
      return registry.sortedVersions(module, owner);
    }
  }
  throw new HatcherError(`Unsupported registry: ${registryName}`);
}

/** Parse an URL from supported registries */
export function parseURL(url: string): ProcessedURL {
  const registryName = url.split("/")[2];

  for (const registry of registries) {
    if (registryName === registry.domain) {
      return {
        registry: registryName,
        ...registry.parseURL(url),
      };
    }
  }
  throw new HatcherError(`Unsupported registry: ${registryName}`);
}
