import { assert, assertEquals } from "../../deps.ts";
import { NestLand } from "./NestLand.ts";

Deno.test("Registries | NestLand | Parse x.nest.land URL", () => {
  const module = NestLand.parseURL(
    "https://x.nest.land/[NAME]@[VERSION]/[.../...].ts",
  );

  assertEquals(module, {
    name: "[NAME]",
    owner: "",
    version: "[VERSION]",
    parsedURL: "https://x.nest.land/[NAME]@${version}/[.../...].ts",
    relativePath: "[.../...].ts",
  });
});

Deno.test("Registries | NestLand | Parse unversioned x.nest.land URL", () => {
  const module = NestLand.parseURL(
    "https://x.nest.land/[NAME]/[.../...].ts",
  );

  assertEquals(module, {
    name: "[NAME]",
    owner: "",
    version: "",
    parsedURL: "https://x.nest.land/[NAME]@${version}/[.../...].ts",
    relativePath: "[.../...].ts",
  });
});

Deno.test("Registries | NestLand | Get sorted versions", async () => {
  const sorted = await NestLand.sortedVersions("std");
  assert(sorted.length > 0);
});
