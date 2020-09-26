export interface URLData {
  name: string;
  owner: string;
  version: string;
  parsedURL: string;
  relativePath: string;
}

export abstract class Registry {
  static domain: string;

  static async getLatestVersion(module: string, owner: string): Promise<string>;
  static async getLatestVersion(
    module: string,
    owner?: string,
  ): Promise<string>;
  static async getLatestVersion(module: string): Promise<string> {
    return "";
  }

  static parseURL(url: string): URLData {
    return {
      name: "",
      owner: "",
      version: "",
      parsedURL: "",
      relativePath: "",
    };
  }
}
