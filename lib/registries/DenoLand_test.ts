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

  assert(semver.gte("0.63.0", latest));
});

Deno.test("Registries | DenoLand | Get latest x version", async () => {
  const latest = await DenoLand.getLatestVersion("deno");

  assert(semver.gte("1.2.2", latest));
});
