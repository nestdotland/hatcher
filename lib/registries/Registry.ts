import { latest, latestStable } from "../utilities/utils.ts";
import { HatcherError } from "../utilities/error.ts";
import { Err, Ok, Result } from "./error.ts";
import { Key, pathToRegexp } from "../../deps.ts";
import { BaseModule, Module } from "./Module.ts";

export interface RegistrySpecifier {
  schema: string;
  variables: {
    key: string;
    url: string;
  }[];
}

export interface Intellisense {
  version: number;
  registries: RegistrySpecifier[];
}

export interface Cache {
  readonly preventRefresh: boolean;
  intellisense?: Intellisense;
}

export interface VariableMap {
  module: string;
  author: string;
  version: string;
  path: string;
}

interface RegistryOptions_ {
  intellisense: Intellisense;
  intellisensePath?: string;
  protocol?: string;
  variables?: Partial<VariableMap>;
}

export type RegistryOptions =
  | Omit<RegistryOptions_, "intellisense">
  | Omit<RegistryOptions_, "intellisensePath">;

export interface IntellisenseError {
  reason: string;
  registry: Registry;
}

export class Registry {
  protected cache: Cache;
  readonly intellisensePath?: string;
  readonly protocol: string;
  public variables: VariableMap;

  static registries: Registry[] = [];

  constructor(readonly host: string, options: RegistryOptions = {}) {
    if ("intellisense" in options) {
      this.cache = { preventRefresh: true, intellisense: options.intellisense };
    } else {
      this.cache = { preventRefresh: false };
      this.intellisensePath = options.intellisensePath ??
        "/.well-known/deno-import-intellisense.json";
    }

    if (Registry.registries.every((r) => r.host !== this.host)) {
      Registry.registries.push(this);
    }
    this.protocol = options.protocol ?? "https:";
    this.variables = {
      module: "module",
      author: "author",
      version: "version",
      path: "path",
      ...options.variables,
    };
  }

  clearCache() {
    if (!this.cache.preventRefresh) {
      this.cache.intellisense = undefined;
    }
  }

  async cacheIntellisense() {
    if (!this.cache.preventRefresh) {
      const result = await fetch(
        `${this.protocol}${this.host}${this.intellisensePath}`,
      );
      if (!result.ok) {
        throw new HatcherError(
          `Error while fetching intellisense for ${this.host}: ${result.statusText}`,
        );
      }
      this.cache.intellisense = await result.json();
      if (this.cache.intellisense?.version !== 1) {
        throw new HatcherError(
          `${this.host} intellisense version is not currently supported. Please submit an issue.`,
        );
      }
    }
  }

  static async cacheIntellisense(): Promise<IntellisenseError[]> {
    const result = await Promise.allSettled(
      Registry.registries.map((registry) => registry.cacheIntellisense()),
    );
    const errors: IntellisenseError[] = [];
    for (let i = 0; i < result.length; i++) {
      const settled = result[i];
      if (settled.status === "rejected") {
        errors.push({
          registry: Registry.registries[i],
          reason: settled.reason,
        });
      }
    }
    return errors;
  }

  get intellisense(): Intellisense {
    if (this.cache.intellisense === undefined) {
      throw new HatcherError(
        "Intellisense was not cached, please call cacheIntellisense() first.",
      );
    }
    return this.cache.intellisense;
  }

  match(url: URL): RegistrySpecifier | null {
    for (const specifier of this.intellisense.registries) {
      const regexp = pathToRegexp(specifier.schema);
      if (url.pathname.match(regexp)) return specifier;
    }
    return null;
  }

  static get(host: string, protocol = "https:"): Registry | null {
    return Registry.registries.find((registry) =>
      registry.host === host && registry.protocol === protocol
    ) ?? null;
  }

  from(variables: Partial<VariableMap>): PartialModule {
    return new PartialModule(this, variables);
  }
}

export class PartialModule {
  protected reverseVariables: Map<string, keyof VariableMap>;
  protected variables: Map<string, string | undefined>;

  constructor(
    protected registry: Registry,
    variables: Partial<VariableMap>,
  ) {
    this.reverseVariables = new Map();
    for (const key in registry.variables) {
      this.reverseVariables.set(
        registry.variables[key as keyof VariableMap],
        key as keyof VariableMap,
      );
    }
    this.variables = new Map(Object.entries(variables));
  }

  protected matchSpecifier(varName: keyof VariableMap): Result<string[]> {
    const varNameMapped = this.registry.variables[varName];
    const specifier = this.registry.intellisense.registries.find((registry) => {
      const variable = registry.variables.find((v) => v.key === varNameMapped);
      if (variable === undefined) return false;
      const variables = variable.url.matchAll(/\${(\w+)}|\${{(\w+)}}/g);
      return [...variables].every((v) => {
        const mappedName = this.reverseVariables.get(v[1]);
        if (mappedName === undefined) return false;
        return this.variables.has(mappedName);
      });
    });
    if (specifier === undefined) {
      return Promise.resolve([null, {
        reason:
          `No schema found with the ${varName} key with the given variables.`,
        code: 0,
      }]);
    }
    return new BaseModule(
      this.registry,
      specifier,
      this.variables,
    )[`${varName}s` as `${keyof VariableMap}s`];
  }

  get versions(): Result<string[]> {
    return this.matchSpecifier("version");
  }

  get modules(): Result<string[]> {
    return this.matchSpecifier("module");
  }

  get paths(): Result<string[]> {
    return this.matchSpecifier("path");
  }

  get authors(): Result<string[]> {
    return this.matchSpecifier("author");
  }
}
