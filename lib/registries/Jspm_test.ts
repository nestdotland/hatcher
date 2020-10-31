import { assert, assertEquals, semver } from "../../deps.ts";
import { Jspm } from "./Jspm.ts";

Deno.test("Registries | Jspm | Parse jspm.dev/pkg URL", () => {
  const module = Jspm.parseURL(
    "https://jspm.dev/[NAME]",
  );

  assertEquals(module, {
    name: "[NAME]",
    owner: "",
    version: "",
    parsedURL: "https://jspm.dev/[NAME]@${version}",
    relativePath: "",
  });
});

Deno.test("Registries | Jspm | Parse jspm.dev/pkg@version URL", () => {
  const module = Jspm.parseURL(
    "https://jspm.dev/[NAME]@[VERSION]",
  );

  assertEquals(module, {
    name: "[NAME]",
    owner: "",
    version: "[VERSION]",
    parsedURL: "https://jspm.dev/[NAME]@${version}",
    relativePath: "",
  });
});

Deno.test("Registries | Jspm | Parse jspm.dev/npm:pkg@version URL", () => {
  const module = Jspm.parseURL(
    "https://jspm.dev/npm:[NAME]@[VERSION]",
  );

  assertEquals(module, {
    name: "npm:[NAME]",
    owner: "",
    version: "[VERSION]",
    parsedURL: "https://jspm.dev/npm:[NAME]@${version}",
    relativePath: "",
  });
});

Deno.test("Registries | Jspm | Parse jspm.dev/pkg@ URL", () => {
  const module = Jspm.parseURL(
    "https://jspm.dev/[NAME]@",
  );

  assertEquals(module, {
    name: "[NAME]",
    owner: "",
    version: "",
    parsedURL: "https://jspm.dev/[NAME]@${version}",
    relativePath: "",
  });
});

Deno.test("Registries | Jspm | Get sorted versions", async () => {
  const sorted = await Jspm.sortedVersions("lodash");
  assert(sorted.length > 0);
});
