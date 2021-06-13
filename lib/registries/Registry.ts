import { latest, latestStable } from "../utilities/utils.ts";

export interface URLData {
  name: string;
  owner: string;
  version: string;
  parsedURL: string;
  relativePath: string;
}

export abstract class Registry {
  static domain: string;

  /** Get the latest release version of a module */
  static async latestVersion(
    module: string,
    owner?: string,
  ): Promise<string | undefined> {
    const sorted = await this.sortedVersions(module, owner);
    return latest(sorted);
  }

  /** Get the latest stable version of a module */
  static async latestStableVersion(
    module: string,
    owner?: string,
  ): Promise<string | undefined> {
    const sorted = await this.sortedVersions(module, owner);
    return latestStable(sorted);
  }

  static async sortedVersions(module: string, owner: string): Promise<string[]>;
  static async sortedVersions(
    module: string,
    owner?: string,
  ): Promise<string[]>;
  static sortedVersions(_module: string): Promise<string[]> {
    return Promise.resolve([]);
  }

  static parseURL(_url: string): URLData {
    return {
      name: "",
      owner: "",
      version: "",
      parsedURL: "",
      relativePath: "",
    };
  }
}
