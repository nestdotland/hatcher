import { assert, assertEquals, semver } from "../../deps.ts";
import { NestLand } from "./NestLand.ts";

Deno.test("Registries | NestLand | Parse x.nest.land URL", () => {
  const module = NestLand.parseURL(
    "https://x.nest.land/[NAME]@[VERSION]/[.../...].ts",
  );

  assertEquals(module, {
    name: "[NAME]",
    version: "[VERSION]",
    parsedURL: "https://x.nest.land/[NAME]@${version}/[.../...].ts",
    relativePath: "[.../...].ts",
  });
});

Deno.test("Registries | NestLand | Get latest version", async () => {
  const latest = await NestLand.getLatestVersion("std");

  assert(semver.lte("0.65.0", latest));
});
