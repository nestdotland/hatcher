import { colors } from "../deps.ts";
import { UpdateNotifier } from "./notifier.ts";
import type { Registry } from "./registries/Registry.ts";
import { getRegistry } from "./registries.ts";
import { box } from "./utilities/box.ts";

const onWindows = Deno.build.os === "windows";
const [executable, name, owner, registryName, currentVersion, ...args] =
  Deno.args;

if (!executable) {
  box(`${colors.red("hatcher error:")} incorrect number of arguments.`);
  Deno.exit(1);
}

let status: Deno.ProcessStatus;

try {
  const process = Deno.run({
    cmd: [
      executable + (onWindows ? ".cmd" : ""),
      ...args,
    ],
  });

  status = await process.status();
  process.close();
} catch {
  box(`${colors.red("hatcher error:")} ${executable} doesn't exist.`);
  Deno.exit(1);
}

let registry: typeof Registry;
try {
  registry = getRegistry(registryName);
} catch {
  box(`${colors.red("hatcher error:")} Unsupported registry.`);
  Deno.exit(1);
}

const notifier = new UpdateNotifier({
  name,
  owner,
  registry,
  currentVersion,
});

await notifier.checkForUpdates();
notifier.notify();

Deno.exit(status.code);
