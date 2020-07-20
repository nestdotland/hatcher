import { fetchTimeout, parseModule, versionSubstitute } from "../utils.ts";
import { Github } from "./github.ts";

export class Deno {
  static XRegistry: Registry;

  /** Fetches the deno registry only if needed */
  static async getXRegistry() {
    if (this.XRegistry) return this.XRegistry;
    const denoDatabaseResponse = await fetchTimeout(
      "https://raw.githubusercontent.com/denoland/deno_website2/master/database.json",
      5000,
    );
    this.XRegistry = await denoDatabaseResponse.json();
    return this.XRegistry;
  }

  /** Get the latest release version of standard deno modules */
  static async getLatestStdVersion(): Promise<string> {
    const res = await fetchTimeout(
      "https://raw.githubusercontent.com/denoland/deno_website2/master/deno_std_versions.json",
      5000,
    );
    const versions = await res.json();
    const latestVersion = versions[0];
    return latestVersion;
  }

  /** Get the latest release version of third party modules */
  static async getLatestXVersion(
    dependencyName: string,
  ): Promise<string> {
    const denoRegistry = await this.getXRegistry();
    const owner = denoRegistry[dependencyName].owner;
    const repo = denoRegistry[dependencyName].repo;
    return Github.getLatestVersion(repo, owner);
  }

  /** Analyzes deno.land url
   * https://deno.land/std@[VERSION]/[...].ts
   * https://deno.land/x/[NAME]@[VERSION]/[...].ts */
  static async parseURL(url: string) {
    const tmpSplit = url.split("/");
    const { name: xOrStd } = parseModule(tmpSplit[3]);
    if (xOrStd === "x") {
      const { name, version } = parseModule(tmpSplit[4]);
      tmpSplit[4] = `${name}@${versionSubstitute}`;
      const parsedURL = tmpSplit.join("/");
      const registry = "deno.land/x";
      return { name, version, parsedURL, registry };
    }
    if (xOrStd === "std") {
      const { version } = parseModule(tmpSplit[3]);
      tmpSplit[3] = `std@${versionSubstitute}`;
      const parsedURL = tmpSplit.join("/");
      const registry = "deno.land/std";
      const name = tmpSplit[4];
      return { name, version, parsedURL, registry };
    }
    throw new Error(`Unable to parse deno.land url: ${tmpSplit.join("/")}`);
  }
}

type Registry = {
  [key: string]: {
    owner: string;
    repo: string;
  };
};
