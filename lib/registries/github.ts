import {
  fetchTimeout,
  versionSubstitute,
  sortVersions,
  latest,
} from "../utilities.ts";

export class Github {
  /** Get the latest release/tag of a GitHub repository */
  static async getLatestVersion(
    module: string,
    owner: string,
  ): Promise<string> {
    const res = await fetchTimeout(
      `https://api.github.com/repos${owner}/${module}/releases`,
      5000,
    );
    const json = await res.json();
    const versions: string[] = json.map((release: Release) => release.tag_name);
    const sorted = sortVersions(versions);
    if (sorted.length === 0) {
      const res = await fetchTimeout(
        `https://api.github.com/repos${owner}/${module}/tags`,
        5000,
      );
      const json = await res.json();
      const versions: string[] = json.map((tag: Tag) => tag.name);
      const sorted = sortVersions(versions);
      return latest(sorted);
    }
    return latest(sorted);
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
    return { name, version, parsedURL, owner };
  }
}

type Release = {
  tag_name: string;
};

type Tag = {
  name: string;
};
