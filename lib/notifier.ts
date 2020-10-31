import type { Registry } from "./registries/Registry.ts";
import { readJson, writeJson } from "./utilities/json.ts";
import { box } from "./utilities/box.ts";
import { envHOMEDIR } from "./utilities/environment.ts";
import { colors, exists, join, semver } from "../deps.ts";

export interface ModuleInfo {
  lastUpdateCheck: number;
}

export interface Options {
  name: string;
  registry: typeof Registry;
  currentVersion: string | semver.SemVer;
  owner?: string;
  updateCheckInterval?: number;
}

export interface Update {
  latest: string;
  current: string;
  type: semver.ReleaseType | null;
  name: string;
  owner: string;
  registry: string;
}

export const ONE_DAY = 1000 * 60 * 60 * 24;

export class UpdateNotifier {
  public name: string;
  public registry: typeof Registry;
  public currentVersion: string | semver.SemVer;
  public owner: string;
  public updateCheckInterval: number;
  public lastUpdateCheck = Date.now();
  public availableUpdate: Update | undefined = undefined;

  constructor(
    {
      name,
      registry,
      currentVersion,
      owner = "_",
      updateCheckInterval = ONE_DAY,
    }: Options,
  ) {
    this.name = name;
    this.registry = registry;
    this.currentVersion = currentVersion;
    this.owner = owner;
    this.updateCheckInterval = updateCheckInterval;
  }

  async checkForUpdates(
    configDir = join(envHOMEDIR(), ".deno/hatcher/"),
  ): Promise<Update | undefined> {
    if (!await exists(configDir)) {
      await Deno.mkdir(configDir, { recursive: true });
    }

    const configPath = join(
      configDir,
      `${this.registry.domain}-${this.name}${
        this.owner ? `-${this.owner}` : ""
      }.json`,
    );

    const configExists = await exists(configPath);

    if (configExists) {
      try {
        const module = await readJson(configPath) as ModuleInfo;
        this.lastUpdateCheck = module.lastUpdateCheck;
      } catch (err) {
        throw new Error(`JSON file contains errors (${configPath}): ${err}`);
      }
    } else {
      await writeJson(configPath, {
        lastUpdateCheck: this.lastUpdateCheck,
      });
    }

    if (this.needsChecking()) {
      let latestVersion: string | semver.SemVer | undefined;
      try {
        latestVersion = await this.registry.latestVersion(
          this.name,
          this.owner,
        );
      } catch {
        // user offline
        return;
      }

      if (!latestVersion || !semver.valid(latestVersion)) {
        return;
      }

      latestVersion = semver.coerce(latestVersion) || "0.0.0";
      const currentVersion = semver.coerce(this.currentVersion) || "0.0.0";

      if (semver.lt(currentVersion, latestVersion)) {
        const current = (typeof currentVersion === "string"
          ? currentVersion
          : currentVersion.version);
        const latest = (typeof latestVersion === "string"
          ? latestVersion
          : latestVersion.version);
        this.availableUpdate = {
          current,
          latest,
          type: semver.diff(current, latest),
          name: this.name,
          owner: this.owner,
          registry: this.registry.domain,
        };
      }

      this.lastUpdateCheck = Date.now();
      await writeJson(configPath, {
        lastUpdateCheck: this.lastUpdateCheck,
      });

      return this.availableUpdate;
    }
    return;
  }

  needsChecking(): boolean {
    return Date.now() - this.lastUpdateCheck > this.updateCheckInterval;
  }

  notify(command?: string, overwrite = false): void {
    const update = this.availableUpdate;
    if (update) {
      const header = `Update available ${colors.gray(update.current)} → ${
        colors.green(update.latest)
      }\n`;
      const body = (command
        ? (overwrite
          ? command
          : `Run ${colors.cyan(command)} to update`)
        : `Go to ${
          colors.cyan(this.registry.domain)
        } and check out the updates of ${this.name}!`);

      box(header + body);
    }
  }
}
