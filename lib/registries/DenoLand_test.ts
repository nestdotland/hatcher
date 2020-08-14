import { assert, assertEquals, semver } from "../../deps.ts";
import { DenoLand } from "./DenoLand.ts";

Deno.test("Registries | DenoLand | Parse deno.land/std URL", () => {
  const module = DenoLand.parseURL(
    "https://deno.land/std@[VERSION]/[.../...].ts",
  );

  assertEquals(module, {
    name: "std",
    version: "[VERSION]",
    parsedURL: "https://deno.land/std@${version}/[.../...].ts",
    relativePath: "[.../...].ts",
  });
});

Deno.test("Registries | DenoLand | Parse deno.land/x URL", () => {
  const module = DenoLand.parseURL(
    "https://deno.land/x/[NAME]@[VERSION]/[.../...].ts",
  );

  assertEquals(module, {
    name: "[NAME]",
    version: "[VERSION]",
    parsedURL: "https://deno.land/x/[NAME]@${version}/[.../...].ts",
    relativePath: "[.../...].ts",
  });
});

Deno.test("Registries | DenoLand | Get latest std version", async () => {
  const latest = await DenoLand.getLatestVersion("std");

  assert(semver.lte("0.65.0", latest));
});

Deno.test("Registries | DenoLand | Get latest x version", async () => {
  const latest = await DenoLand.getLatestVersion("deno");

  assert(semver.lte("1.3.0", latest));
});
