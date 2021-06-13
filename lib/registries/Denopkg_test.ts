import { assert, assertEquals } from "../../deps.ts";
import { Denopkg } from "./Denopkg.ts";

Deno.test("Registries | Denopkg | Parse denopkg.com URL", () => {
  const module = Denopkg.parseURL(
    "https://denopkg.com/[OWNER]/[NAME]@[VERSION]/[.../...].ts",
  );

  assertEquals(module, {
    name: "[NAME]",
    owner: "[OWNER]",
    version: "[VERSION]",
    parsedURL: "https://denopkg.com/[OWNER]/[NAME]@${version}/[.../...].ts",
    relativePath: "[.../...].ts",
  });
});

Deno.test("Registries | Denopkg | Get sorted versions", async () => {
  const sorted = await Denopkg.sortedVersions("deno", "denoland");
  assert(sorted.length > 0);
});
