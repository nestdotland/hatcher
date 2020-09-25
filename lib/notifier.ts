import type { Registry } from "./registries/Registry.ts";
import { readJson, writeJson } from "./utilities/json.ts";
import { box } from "./utilities/box.ts";
import { envHOMEDIR } from "./utilities/environment.ts";
import { join, exists, semver, colors } from "../deps.ts";

interface ModuleInfo {
  lastUpdateCheck: number;
}

interface Options {
  name: string;
  registry: typeof Registry;
  currentVersion: string | semver.SemVer;
  owner?: string;
  updateCheckInterval?: number;
}

export const ONE_DAY = 1000 * 60 * 60 * 24;

export class UpdateNotifier {
  public name: string;
  public registry: typeof Registry;
  public currentVersion: string | semver.SemVer;
  public owner?: string;
  public updateCheckInterval: number;
  public lastUpdateCheck = Date.now();
  public availableUpdate = ["", ""];

  constructor(
    { name, registry, currentVersion, owner, updateCheckInterval = ONE_DAY }:
      Options,
  ) {
    this.name = name;
    this.registry = registry;
    this.currentVersion = currentVersion;
    this.owner = owner;
    this.updateCheckInterval = updateCheckInterval;
  }

  async checkForUpdates(
    configDir = join(envHOMEDIR(), ".deno/hatcher/"),
  ): Promise<boolean> {
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
      let latestVersion: string;
      try {
        latestVersion = await this.registry.getLatestVersion(
          this.name,
          this.owner,
        );
      } catch {
        // user offline
        return false;
      }

      if (!latestVersion || !semver.valid(latestVersion)) {
        return false;
      }

      const current = semver.coerce(this.currentVersion) || "0.0.0";
      const latest = semver.coerce(latestVersion) || "0.0.0";

      if (semver.lt(current, latest)) {
        const from = (typeof current === "string" ? current : current.version);
        const to = (typeof latest === "string" ? latest : latest.version);
        this.availableUpdate = [from, to];
        return true;
      }

      this.lastUpdateCheck = Date.now();
      await writeJson(configPath, {
        lastUpdateCheck: this.lastUpdateCheck,
      });
    }
    return false;
  }

  needsChecking() {
    return Date.now() - this.lastUpdateCheck > this.updateCheckInterval;
  }

  notify(command?: string, overwrite = false) {
    const [from, to] = this.availableUpdate;
    if (from && to) {
      const header = `Update available ${colors.gray(from)} → ${
        colors.green(to)
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
