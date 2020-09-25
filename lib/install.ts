import { parseURL, getLatestVersion } from "./registries.ts";
import type { ProcessedURL } from "./registries.ts";
import { installPrefix } from "./utilities/utils.ts";
import { semver, colors, log } from "../deps.ts";
import { version } from "./version.ts";

export async function install(args = [...Deno.args]) {
  const indexOfURL = args.findIndex((arg) => arg.match(/https:\/\//));
  const indexOfName = args.indexOf("-n");

  if (indexOfURL < 0) {
    log.warning("The specified module is local, updates cannot be retrieved.");
    installModuleWithoutUpdates(args);
    return;
  }

  const url = args[indexOfURL];
  let processedURL: ProcessedURL;

  try {
    processedURL = parseURL(url);
  } catch (err) {
    if (err.message.match(/^Unsupported registry:/)) {
      log.warning("Unsupported registry, updates cannot be retrieved.");
    } else {
      log.critical(err);
    }
    installModuleWithoutUpdates(args);
    return;
  }
  const { name, parsedURL, registry, owner, version } = processedURL;
  let alias: string;

  log.debug("Module info: ", name, parsedURL, registry, owner, version);

  const currentVersion = semver.valid(version) ??
    await getLatestVersion(registry, name, owner);

  if (!currentVersion || !semver.valid(currentVersion)) {
    log.warning(`Could not find the latest version of ${name}.`);
    await installModuleWithoutUpdates(args);
    return;
  }

  /** If no exec name is given, provide one */
  if (indexOfName < 0) {
    args.splice(indexOfURL, 0, installPrefix + name);
    args.splice(indexOfURL, 0, "-n");
    alias = name;
  } else {
    alias = args[indexOfName + 1];
    args[indexOfName + 1] = installPrefix + alias;
  }

  const executable = installPrefix + alias;

  await installModuleHandler(args);

  /** After installation, the URL is ready to be updated */
  args[args.findIndex((arg) => arg.match(/https:\/\//))] = parsedURL;
  await installUpdateHandler(alias, executable, name, owner, registry, version);

  log.info(`Successfully installed ${colors.bold(name)} !`);
}

async function installModuleWithoutUpdates(args: string[]): Promise<void> {
  const installation = Deno.run({
    cmd: [
      "deno",
      "install",
      ...args,
    ],
  });

  const status = await installation.status();
  installation.close();

  if (status.success === false || status.code !== 0) {
    throw new Error("Module installation failed.");
  }
}

export async function installModuleHandler(args: string[]): Promise<void> {
  const installation = Deno.run({
    cmd: [
      "deno",
      "install",
      ...args,
    ],
  });

  const status = await installation.status();
  installation.close();

  if (status.success === false || status.code !== 0) {
    throw new Error("Module handler installation failed.");
  }
}

/** Install update handler cli to check for updates and notify user */
export async function installUpdateHandler(
  module: string,
  executable: string,
  name: string,
  owner: string,
  registry: string,
  version: string,
) {
  const installation = Deno.run({
    cmd: [
      "deno",
      "install",
      "--unstable",
      "-fAq",
      "-n",
      module,
      `https://x.nest.land/hatcher@${version}/lib/cli.ts`,
      executable,
      name,
      owner || "_",
      registry,
      version,
    ],
  });

  const status = await installation.status();
  installation.close();

  if (status.success === false || status.code !== 0) {
    throw new Error("Update handler installation failed.");
  }
}
