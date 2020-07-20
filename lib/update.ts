import {
  readGlobalModuleConfig,
  writeGlobalModuleConfig,
  GlobalModuleConfig,
} from "./config.ts";
import { semver, colors } from "../deps.ts";
import { getLatestVersion } from "./registries.ts";
import { box } from "./utils.ts";

export class UpdateNotifier {
  public name = "";
  public alias = "";
  public owner = "";
  public currentVersion = "";
  public registry = "";
  public arguments: string[] = [];
  public lastUpdateCheck = Date.now();
  public config: GlobalModuleConfig = {};

  constructor(
    public executable: string,
    public updateCheckInterval: number,
  ) {}

  async init() {
    let config: GlobalModuleConfig;
    try {
      config = await readGlobalModuleConfig();
    } catch (err) {
      box(`${colors.red("Error")} ${err}`);
      Deno.exit(1);
    }
    this.config = config;
    const module = config[this.executable];

    if (module) {
      this.name = module.name;
      this.alias = module.alias;
      this.owner = module.owner;
      this.currentVersion = module.version;
      this.registry = module.registry;
      this.arguments = module.arguments;
      this.lastUpdateCheck = module.lastUpdateCheck;
    } else {
      box(
        `${
          colors.red("Error")
        } ${this.executable} is missing in the global config file.`,
      );
      Deno.exit(1);
    }
  }

  async checkForUpdate() {
    if (this.needCheck()) {
      let latestVersion: string;
      try {
        latestVersion = await getLatestVersion(
          this.registry,
          this.name,
          this.owner,
        );
      } catch {
        // Unsupported registry or user offline
        return;
      }

      if (!latestVersion || !semver.valid(latestVersion)) {
        return;
      }

      const current = semver.coerce(this.currentVersion) || "0.0.1";
      const latest = semver.coerce(latestVersion) || "0.0.1";

      if (semver.lt(current, latest)) {
        const from = (typeof current === "string" ? current : current.version);
        const to = (typeof latest === "string" ? latest : latest.version);
        this.notify(from, to);
      }

      this.config[this.executable].lastUpdateCheck = Date.now();
      writeGlobalModuleConfig(this.config);
    }
  }

  notify(from: string, to: string) {
    const notification = `New version of ${colors.red(this.name)} available! ${
      colors.yellow(from)
    } → ${colors.green(to)}\nRegistry ${colors.cyan(this.registry)}\nRun ${
      colors.magenta("eggs update -g " + this.alias)
    } to update`;

    box(notification);
  }

  needCheck() {
    return Date.now() - this.lastUpdateCheck > this.updateCheckInterval;
  }
}
