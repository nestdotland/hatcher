import { path, readJson, writeJson } from "../deps.ts";

export type GlobalModuleConfig = {
  [key: string]: GlobalModule;
};

export interface GlobalModule {
  name: string;
  alias: string;
  owner: string;
  version: string;
  registry: string;
  arguments: string[];
  lastUpdateCheck: number;
}

let GLOBAL_MODULES_CONFIG_PATH = "";

function homedir() {
  return Deno.env.get("HOME") || Deno.env.get("HOMEPATH") ||
    Deno.env.get("USERPROFILE") || "/";
}

export function globalModulesConfigPath() {
  if (GLOBAL_MODULES_CONFIG_PATH) return GLOBAL_MODULES_CONFIG_PATH;
  GLOBAL_MODULES_CONFIG_PATH = path.join(
    homedir(),
    "/.eggs-global-modules.json",
  );
  return GLOBAL_MODULES_CONFIG_PATH;
}

export async function readGlobalModuleConfig(): Promise<GlobalModuleConfig> {
  try {
    return await readJson(globalModulesConfigPath()) as GlobalModuleConfig;
  } catch {
    throw new Error("Config file doesn't exist.");
  }
}

export async function writeGlobalModuleConfig(
  config: GlobalModuleConfig,
): Promise<void> {
  await writeJson(globalModulesConfigPath(), config, { spaces: 2 });
}
