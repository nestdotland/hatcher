import { colors } from "./deps.ts";
import { UpdateNotifier } from "./lib/update.ts";
import { box } from "./lib/utils.ts";

const onWindows = Deno.build.os === "windows";
const [executable, updateCheckInterval, ...args] = Deno.args;

if (!executable || !updateCheckInterval) {
  box(`${colors.red("Error")} incorrect number of arguments.`);
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
  box(`${colors.red("Error")} ${executable} doesn't exist.`);
  Deno.exit(1);
}

const notifier = new UpdateNotifier(
  executable,
  Number.parseInt(updateCheckInterval),
);

await notifier.init();
await notifier.checkForUpdate();

Deno.exit(status.code);
