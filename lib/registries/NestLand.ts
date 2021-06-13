import { Registry } from "./Registry.ts";
import {
  parseModule,
  sortVersions,
  versionSubstitute,
} from "../utilities/utils.ts";
import { HatcherError } from "../utilities/error.ts";

export class NestLand extends Registry {
  static domain = "x.nest.land";

  /** Get sorted versions of a module on https://x.nest.land */
  static async sortedVersions(
    module: string,
    _owner?: string,
  ): Promise<string[]> {
    const res = await fetch(`https://x.nest.land/api/package/${module}`);
    const json: Module = await res.json();
    if (!json.packageUploadNames) {
      throw new HatcherError(`Invalid response for ${module}: ${json}`);
    }
    const versions = json.packageUploadNames.map((module: string) =>
      parseModule(module).version
    );
    return sortVersions(versions);
  }

  /** Parse x.nest.land url
   * https://x.nest.land/[NAME]@[VERSION]/[...].ts */
  static parseURL(url: string) {
    const tmpSplit = url.split("/");
    const { name, version } = parseModule(tmpSplit[3]);
    tmpSplit[3] = `${name}@${versionSubstitute}`;
    const parsedURL = tmpSplit.join("/");
    const relativePath = tmpSplit.slice(4).join("/");
    const owner = "";
    return { name, version, parsedURL, relativePath, owner };
  }
}

interface Module {
  packageUploadNames: string[];
}
