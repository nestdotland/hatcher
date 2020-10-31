import { Registry } from "./Registry.ts";
import { Npm } from "./Npm.ts";
import {
  fetchTimeout,
  parseModule,
  sortVersions,
  versionSubstitute,
} from "../utilities/utils.ts";

export class Skypack extends Registry {
  static domain = "cdn.skypack.dev";

  /** Get sorted versions of a module on https://cdn.skypack.dev */
  static async sortedVersions(
    module: string,
    owner?: string,
  ): Promise<string[]> {
    return Npm.sortedVersions(module, owner);
  }

  /** Parse cdn.skypack.dev url
   * https://cdn.skypack.dev/[NAME]@[VERSION] */
  static parseURL(url: string) {
    const tmpSplit = url.split("/");
    const [module, params] = tmpSplit[3].split("?");
    const { name, version } = parseModule(module);
    tmpSplit[3] = `${name}@${versionSubstitute}`;
    const parsedURL = `${tmpSplit.join("/")}${params ? `?${params}` : ""}`;
    const relativePath = "";
    const owner = "";
    return { name, version, parsedURL, relativePath, owner };
  }
}
