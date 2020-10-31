import { HatcherError } from "../utilities/error.ts";
import { Registry } from "./Registry.ts";
import { sortVersions } from "../utilities/utils.ts";

export class Npm extends Registry {
  static domain = "npmjs.com";

  /** Get sorted versions of a module on https://www.npmjs.com */
  static async sortedVersions(
    module: string,
    owner?: string,
  ): Promise<string[]> {
    const res = await fetch("https://registry.npmjs.org/" + module);
    const json: Package = await res.json();
    if (!json.versions) {
      throw new HatcherError(
        `Unable to get latest version: ${module} ${owner}`,
      );
    }
    return sortVersions(Object.keys(json.versions));
  }
}

interface Package {
  versions: Record<string, unknown>;
}
