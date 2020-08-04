import { assert, assertEquals, semver } from "../../deps.ts";
import { Github } from "./Github.ts";

Deno.test("Registries | Github | Parse raw.githubusercontent.com URL", () => {
  const module = Github.parseURL(
    "https://raw.githubusercontent.com/[OWNER]/[NAME]/[VERSION]/[.../...].ts",
  );

  assertEquals(module, {
    name: "[NAME]",
    owner: "[OWNER]",
    version: "[VERSION]",
    parsedURL: "https://raw.githubusercontent.com/[OWNER]/[NAME]/${version}/[.../...].ts",
    relativePath: "[.../...].ts",
  });
});

Deno.test("Registries | Github | Get latest version", async () => {
  const latest = await Github.getLatestVersion("deno", "denoland");

  assert(semver.gte("1.2.2", latest));
});