import type { URLData } from "./registries/Registry.ts";
import { DenoLand } from "./registries/DenoLand.ts";
import { Denopkg } from "./registries/Denopkg.ts";
import { Github } from "./registries/Github.ts";
import { NestLand } from "./registries/NestLand.ts";
import type { Registry } from "./registries/Registry.ts";

export interface ProcessedURL extends URLData {
  registry: string;
}

export const registries: typeof Registry[] = [
  DenoLand,
  Denopkg,
  Github,
  NestLand,
];

/** Get registry object from web domain */
export function getRegistry(registryName: string) {
  for (const registry of registries) {
    if (registryName === registry.domain) {
      return registry;
    }
  }
  throw new Error(`Unsupported registry: ${registryName}`);
}

/** Get latest version from supported registries */
export async function getLatestVersion(
  registryName: string,
  module: string,
  owner = "_",
): Promise<string> {
  for (const registry of registries) {
    if (registryName === registry.domain) {
      return registry.getLatestVersion(module, owner);
    }
  }
  throw new Error(`Unsupported registry: ${registryName}`);
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
  throw new Error(`Unsupported registry: ${registryName}`);
}
