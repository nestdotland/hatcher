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

export function sortVersions(
  list: Array<string | semver.SemVer | null>,
): string[] {
  const valid = list
    .map((version) => semver.valid(version))
    .filter((version) => version !== null);
  return semver.sort(valid as string[]);
}

export function latest(versions: string[]): string | undefined {
  return versions[versions.length - 1];
}

/** Assumes that the versions are already sorted */
export function latestStable(versions: string[]): string | undefined {
  for (let i = versions.length - 1; i > -1; i--) {
    if (isVersionStable(versions[i])) {
      return versions[i];
    }
  }
}

export function isVersionUnstable(v: string): boolean {
  return (semver.major(v) === 0) || (!!semver.prerelease(v));
}

export function isVersionStable(v: string): boolean {
  return !isVersionUnstable(v);
}
