import { assert } from "../../deps.ts";
import { Npm } from "./Npm.ts";

Deno.test("Registries | Npm | Get sorted versions", async () => {
  const sorted = await Npm.sortedVersions("lodash");
  assert(sorted.length > 0);
});
