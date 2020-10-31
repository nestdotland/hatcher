import { Registry } from "./Registry.ts";
import {
  fetchTimeout,
  latest,
  parseModule,
  sortVersions,
  versionSubstitute,
} from "../utilities/utils.ts";

export class DenoLand extends Registry {
  static domain = "deno.land";

  /** Get the sorted versions of a module on https://deno.land */
  static async sortedVersions(
    module: string,
    owner?: string,
  ): Promise<string[]> {
    const res = await fetch(
      `https://cdn.deno.land/${module}/meta/versions.json`,
    );
    const { versions } = await res.json();
    return sortVersions(versions);
  }

  /** Analyzes deno.land url
   * https://deno.land/std@[VERSION]/[...].ts
   * https://deno.land/x/[NAME]@[VERSION]/[...].ts */
  static parseURL(url: string) {
    const tmpSplit = url.split("/");
    const owner = "";
    const { name: xOrStd } = parseModule(tmpSplit[3]);
    if (xOrStd === "x") {
      const { name, version } = parseModule(tmpSplit[4]);
      tmpSplit[4] = `${name}@${versionSubstitute}`;
      const parsedURL = tmpSplit.join("/");
      const relativePath = tmpSplit.slice(5).join("/");
      return { name, version, parsedURL, relativePath, owner };
    }
    if (xOrStd === "std") {
      const { version } = parseModule(tmpSplit[3]);
      tmpSplit[3] = `std@${versionSubstitute}`;
      const parsedURL = tmpSplit.join("/");
      const name = "std";
      const relativePath = tmpSplit.slice(4).join("/");
      return { name, version, parsedURL, relativePath, owner };
    }
    throw new Error(`Unable to parse deno.land url: ${tmpSplit.join("/")}`);
  }
}
