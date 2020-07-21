const oneDay = 1000 * 60 * 60 * 24;

/** Install update handler cli to check for updates and notify user */
export * from "./lib/config.ts";

export async function installUpdateHandler(
  module: string,
  executable: string,
  updateCheckInterval: number = oneDay,
  log?: Logger,
) {
  const installation = Deno.run({
    cmd: [
      "deno",
      "install",
      "--unstable",
      "-f",
      "-A",
      "-n",
      module,
      "https://x.nest.land/hatcher@0.7.0/cli.ts",
      executable,
      updateCheckInterval.toString(),
    ],
  });

  const status = await installation.status();
  installation.close();

  const stdout = new TextDecoder("utf-8").decode(await installation.output());
  const stderr = new TextDecoder("utf-8").decode(
    await installation.stderrOutput(),
  );

  log?.debug("stdout: ", stdout);
  log?.debug("stderr: ", stderr);

  if (status.success === false || status.code !== 0) {
    throw new Error("Update handler installation failed.");
  }
}

type Logger = {
  debug: <T>(msg: T, ...args: unknown[]) => T | undefined;
};
