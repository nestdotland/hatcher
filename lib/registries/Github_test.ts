import { assert, assertEquals } from "../../deps.ts";
import { Github } from "./Github.ts";

Deno.test("Registries | Github | Parse raw.githubusercontent.com URL", () => {
  const module = Github.parseURL(
    "https://raw.githubusercontent.com/[OWNER]/[NAME]/[VERSION]/[.../...].ts",
  );

  assertEquals(module, {
    name: "[NAME]",
    owner: "[OWNER]",
    version: "[VERSION]",
    parsedURL:
      "https://raw.githubusercontent.com/[OWNER]/[NAME]/${version}/[.../...].ts",
    relativePath: "[.../...].ts",
  });
});

Deno.test("Registries | Github | Get sorted versions", async () => {
  const sorted = await Github.sortedVersions("deno", "denoland");
  assert(sorted.length > 0);
});
