import { Registry } from "./Registry.ts";
import {
  fetchTimeout,
  sortVersions,
  versionSubstitute,
} from "../utilities/utils.ts";

export class Github extends Registry {
  static domain = "raw.githubusercontent.com";

  /** Get the sorted release/tag of a GitHub repository */
  static async sortedVersions(
    module: string,
    owner: string,
  ): Promise<string[]> {
    const res = await fetchTimeout(
      `https://api.github.com/repos/${owner}/${module}/releases`,
      5000,
    );
    const json: Release[] = await res.json();
    if (!Array.isArray(json)) {
      throw new Error(`${Deno.inspect(json)} is not an array`);
    }
    const versions: string[] = json.map((release: Release) => release.tag_name);
    const sorted = sortVersions(versions);
    if (sorted.length === 0) {
      const res = await fetch(
        `https://api.github.com/repos/${owner}/${module}/tags`,
      );
      const json: Tag[] = await res.json();
      const versions: string[] = json.map((tag: Tag) => tag.name);
      return sortVersions(versions);
    }
    return sorted;
  }

  /** Parse raw.githubusercontent url
   * https://raw.githubusercontent.com/[OWNER]/[NAME]/[VERSION]/[...].ts */
  static parseURL(url: string) {
    const tmpSplit = url.split("/");
    const name = tmpSplit[4];
    const version = tmpSplit[5];
    tmpSplit[5] = versionSubstitute;
    const parsedURL = tmpSplit.join("/");
    const owner = tmpSplit[3];
    const relativePath = tmpSplit.slice(6).join("/");
    return { name, version, parsedURL, owner, relativePath };
  }
}

interface Release {
  "tag_name": string;
}

interface Tag {
  name: string;
}
