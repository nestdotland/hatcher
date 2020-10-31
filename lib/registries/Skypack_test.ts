import { assert, assertEquals, semver } from "../../deps.ts";
import { Skypack } from "./Skypack.ts";

Deno.test("Registries | Skypack | Parse cdn.skypack.dev/pkg URL", () => {
  const module = Skypack.parseURL(
    "https://cdn.skypack.dev/[NAME]",
  );

  assertEquals(module, {
    name: "[NAME]",
    owner: "",
    version: "",
    parsedURL: "https://cdn.skypack.dev/[NAME]@${version}",
    relativePath: "",
  });
});
Deno.test("Registries | Skypack | Parse cdn.skypack.dev/pkg@version URL", () => {
  const module = Skypack.parseURL(
    "https://cdn.skypack.dev/[NAME]@[VERSION]",
  );

  assertEquals(module, {
    name: "[NAME]",
    owner: "",
    version: "[VERSION]",
    parsedURL: "https://cdn.skypack.dev/[NAME]@${version}",
    relativePath: "",
  });
});
Deno.test("Registries | Skypack | Parse cdn.skypack.dev/pkg?min URL", () => {
  const module = Skypack.parseURL(
    "https://cdn.skypack.dev/[NAME]?min",
  );

  assertEquals(module, {
    name: "[NAME]",
    owner: "",
    version: "",
    parsedURL: "https://cdn.skypack.dev/[NAME]@${version}?min",
    relativePath: "",
  });
});
Deno.test("Registries | Skypack | Parse cdn.skypack.dev/pkg@version?min URL", () => {
  const module = Skypack.parseURL(
    "https://cdn.skypack.dev/[NAME]@[VERSION]?min",
  );

  assertEquals(module, {
    name: "[NAME]",
    owner: "",
    version: "[VERSION]",
    parsedURL: "https://cdn.skypack.dev/[NAME]@${version}?min",
    relativePath: "",
  });
});

Deno.test("Registries | Skypack | Get sorted versions", async () => {
  const sorted = await Skypack.sortedVersions("deno", "denoland");
  assert(sorted.length > 0);
});
