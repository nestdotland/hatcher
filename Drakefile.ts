import { desc, run, sh, task } from "https://x.nest.land/drake@1.4.4/mod.ts";
import { version } from "./lib/version.ts";

desc("Install eggs.");
task("install-eggs", [], async function () {
  await sh(
    `deno install -Af --unstable https://x.nest.land/eggs@0.3.1/eggs.ts`,
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

task("get-version", [], function () {
  console.log(`Hatcher version: ${version}`);
  console.log(`::set-env name=HATCHER_VERSION::${version}`);
});

task("setup-github-actions", [], async function () {
  const process = Deno.run({
    cmd: ["deno", "install", "-A", "-n", "drake", "Drakefile.ts"],
  });
  await process.status();
  process.close();

  switch (Deno.build.os) {
    case "windows":
      console.log("::add-path::C:\\Users\\runneradmin\\.deno\\bin");
      break;
    case "linux":
      console.log("::add-path::/home/runner/.deno/bin");
      console.log("::set-env name=SHELL::/bin/bash");
      break;
    case "darwin":
      console.log("::add-path::/Users/runner/.deno/bin");
      break;
    default:
      break;
  }
});

desc("Development tools. Should ideally be run before each commit.");
task("dev", ["format", "lint", "test", "dry-publish"]);

run();
