import {
  versionSubstitute,
  parseModule,
} from "../utils.ts";
import { Github } from "./github.ts";

export class Denopkg {
  /** Get the latest version of a denopkg module */
  static async getLatestVersion(
    module: string,
    owner: string,
  ): Promise<string> {
    return Github.getLatestVersion(module, owner);
  }

  /** Analyzes denopkg url
   * https://denopkg.com/[OWNER]/[NAME]@[VERSION]/[...].ts */
  static parseURL(url: string) {
    const tmpSplit = url.split("/");
    const { name, version } = parseModule(tmpSplit[4]);
    tmpSplit[5] = versionSubstitute;
    const parsedURL = tmpSplit.join("/");
    const owner = tmpSplit[3];
    return { name, version, parsedURL, owner };
  }
}
