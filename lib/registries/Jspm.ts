import { Registry } from "./Registry.ts";
import { Npm } from "./Npm.ts";
import { parseModule, versionSubstitute } from "../utilities/utils.ts";

export class Jspm extends Registry {
  static domain = "jspm.dev";

  /** Get sorted versions of a module on https://jspm.dev */
  static sortedVersions(
    module: string,
    owner?: string,
  ): Promise<string[]> {
    if (module.startsWith("npm:")) module = module.substring(4);
    return Npm.sortedVersions(module, owner);
  }

  /** Parse jspm.dev url
   * https://jspm.dev/[NAME]@[VERSION] */
  static parseURL(url: string) {
    const tmpSplit = url.split("/");
    const { name, version } = parseModule(tmpSplit[3]);
    tmpSplit[3] = `${name}@${versionSubstitute}`;
    const parsedURL = tmpSplit.join("/");
    const relativePath = "";
    const owner = "";
    return { name, version, parsedURL, relativePath, owner };
  }
}
