import { assert, assertEquals } from "../../deps.ts";
import { DenoLand } from "./DenoLand.ts";

Deno.test("Registries | DenoLand | Parse deno.land/std URL", () => {
  const module = DenoLand.parseURL(
    "https://deno.land/std@[VERSION]/[.../...].ts",
  );

  assertEquals(module, {
    name: "std",
    owner: "",
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
    owner: "",
    version: "[VERSION]",
    parsedURL: "https://deno.land/x/[NAME]@${version}/[.../...].ts",
    relativePath: "[.../...].ts",
  });
});

Deno.test("Registries | DenoLand | Parse unversioned deno.land/std URL", () => {
  const module = DenoLand.parseURL(
    "https://deno.land/std/[.../...].ts",
  );

  assertEquals(module, {
    name: "std",
    owner: "",
    version: "",
    parsedURL: "https://deno.land/std@${version}/[.../...].ts",
    relativePath: "[.../...].ts",
  });
});

Deno.test("Registries | DenoLand | Parse unversioned deno.land/x URL", () => {
  const module = DenoLand.parseURL(
    "https://deno.land/x/[NAME]/[.../...].ts",
  );

  assertEquals(module, {
    name: "[NAME]",
    owner: "",
    version: "",
    parsedURL: "https://deno.land/x/[NAME]@${version}/[.../...].ts",
    relativePath: "[.../...].ts",
  });
});

Deno.test("Registries | DenoLand | Get sorted std versions", async () => {
  const sorted = await DenoLand.sortedVersions("std");
  assert(sorted.length > 0);
});

Deno.test("Registries | DenoLand | Get sorted x versions", async () => {
  const sorted = await DenoLand.sortedVersions("deno");
  assert(sorted.length > 0);
});
