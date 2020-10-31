import { assert, assertEquals, semver } from "../../deps.ts";
import { isVersionUnstable, latestStable, sortVersions } from "./utils.ts";

Deno.test("Utilities | sortVersions", () => {
  const input = [
    "0.2.0",
    "0.1.0",
    "0.2.0-1",
    "2",
    "123-",
    "0.2.0-0",
    "0.123.56",
    "45.0",
    "1.0.0",
    "0.0.0",
    "foo",
  ];

  const expected = [
    "0.0.0",
    "0.1.0",
    "0.2.0-0",
    "0.2.0-1",
    "0.2.0",
    "0.123.56",
    "1.0.0",
  ];
  assertEquals(sortVersions(input), expected);
});

Deno.test("Utilities | isVersionUnstable", () => {
  assertEquals(isVersionUnstable("0.1.0"), true);
  assertEquals(isVersionUnstable("1.0.0-0"), true);
  assertEquals(isVersionUnstable("1.0.0-beta"), true);
  assertEquals(isVersionUnstable("0.1.0-0"), true);
  assertEquals(isVersionUnstable("0.0.0"), true);
  assertEquals(isVersionUnstable("1.0.0"), false);
});

Deno.test("Utilities | latestStable", () => {
  assertEquals(latestStable(["1.0.0", "2.0.0"]), "2.0.0");
  assertEquals(latestStable(["2.0.0", "1.0.0"]), "1.0.0");
  assertEquals(latestStable(["0.0.0", "0.1.0"]), undefined);
  assertEquals(latestStable(["2.0.0", "0.1.0"]), "2.0.0");
  assertEquals(latestStable(["2.0.0"]), "2.0.0");
});
