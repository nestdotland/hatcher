import { Registry } from "./Registry.ts";
import { parseModule, versionSubstitute } from "../utilities/utils.ts";
import { Github } from "./Github.ts";

export class Denopkg extends Registry {
  static domain = "denopkg.com";

  /** Get the sorted versions of a module on https://denopkg.com */
  static async sortedVersions(
    module: string,
    owner: string,
  ): Promise<string[]> {
    return Github.sortedVersions(module, owner);
  }

  /** Analyzes denopkg url
   * https://denopkg.com/[OWNER]/[NAME]@[VERSION]/[...].ts */
  static parseURL(url: string) {
    const tmpSplit = url.split("/");
    const { name, version } = parseModule(tmpSplit[4]);
    tmpSplit[4] = `${name}@${versionSubstitute}`;
    const parsedURL = tmpSplit.join("/");
    const owner = tmpSplit[3];
    const relativePath = tmpSplit.slice(5).join("/");
    return { name, version, parsedURL, owner, relativePath };
  }
}
