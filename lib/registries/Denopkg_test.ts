import { assert, assertEquals, semver } from "../../deps.ts";
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

Deno.test({
  name: "Registries | Denopkg | Get latest version",
  ignore: Deno.build.os === "darwin",
  async fn() {
    const latest = await Denopkg.getLatestVersion("deno", "denoland");

    assert(semver.lte("1.3.0", latest));
  },
});
