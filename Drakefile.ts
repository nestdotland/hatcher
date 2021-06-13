import { desc, run, sh, task } from "https://x.nest.land/drake@1.4.4/mod.ts";
import { version } from "./lib/version.ts";
import { join } from "./deps.ts";

const encoder = new TextEncoder();

desc("Install eggs.");
task("install-eggs", [], async function () {
  await sh(
    `deno install -Af --unstable https://x.nest.land/eggs@0.3.7/eggs.ts`,
  );
});

desc("Run tests.");
task("test", [], async function () {
  await sh(
    `deno test -A --unstable`,
  );
});

desc("Format source files.");
task("format", [], async function () {
  await sh(
    `deno fmt`,
  );
});

desc("Format source files.");
task("check-format", [], async function () {
  await sh(
    `deno fmt --check`,
  );
});

desc("Lint source files.");
task("lint", [], async function () {
  await sh(
    `deno lint --unstable`,
  );
});

desc("Links the nest.land API key.");
task("link", [], async function () {
  await sh(
    `eggs link ${Deno.env.get("NESTAPIKEY") ||
      "null"} -do`,
  );
});

desc("Reports the details of what would have been published.");
task("dry-publish", [], async function () {
  await sh(
    `eggs publish hatcher -doY --no-check --check-installation --version ${version}-dev --dry-run`,
  );
});

desc("Publishes hatcher to the nest.land registry.");
task("publish", [], async function () {
  await sh(
    `eggs publish hatcher -doY --no-check --check-installation --version ${version}`,
  );
});

desc("Reports the details of what would have been shipped.");
task("dry-ship", ["link", "dry-publish"]);

desc("Ship hatcher to nest.land.");
task("ship", ["link", "publish"]);

task("get-version", [], async function () {
  console.log(`Hatcher version: ${version}`);
  const env = encoder.encode(`\nHATCHER_VERSION=${version}\n`);
  const GITHUB_ENV = Deno.env.get("GITHUB_ENV");
  if (!GITHUB_ENV) throw new Error("Unable to get Github env");
  await Deno.writeFile(GITHUB_ENV, env, { append: true });
});

task("setup-github-actions", [], async function () {
  const process = Deno.run({
    cmd: ["deno", "install", "-A", "-n", "drake", "Drakefile.ts"],
  });
  await process.status();
  process.close();
  // https://github.com/denoland/setup-deno/issues/5
  const home = Deno.env.get("HOME") ?? // for linux / mac
    Deno.env.get("USERPROFILE") ?? // for windows
    "/";
  const path = encoder.encode(join(home, ".deno", "bin"));
  const GITHUB_PATH = Deno.env.get("GITHUB_PATH");
  if (!GITHUB_PATH) throw new Error("Unable to get Github path");
  await Deno.writeFile(GITHUB_PATH, path, { append: true });
});

desc("Development tools. Should ideally be run before each commit.");
task("dev", ["format", "lint", "test", "dry-publish"]);

run();
