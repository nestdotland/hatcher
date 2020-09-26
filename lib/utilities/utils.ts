import { semver } from "../../deps.ts";

export const versionSubstitute = "${version}";
export const installPrefix = "hatcher--";

export function parseModule(text: string) {
  const tmpSplit = text.split("@");
  return { name: tmpSplit[0], version: tmpSplit[1] || "" };
}

export function fetchTimeout(url: string | Request | URL, ms: number) {
  const controller = new AbortController();
  const promise = fetch(url, { signal: controller.signal });
  const timeout = setTimeout(() => controller.abort(), ms);
  return promise.finally(() => clearTimeout(timeout));
}

export function sortVersions(list: Array<string | semver.SemVer | null>) {
  const valid = list
    .map((version) => semver.valid(version))
    .filter((version) => version !== null);
  return semver.sort(valid as string[]);
}

export function latest<T>(list: T[]) {
  return list[list.length - 1];
}
