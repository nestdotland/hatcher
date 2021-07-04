import { HatcherError } from "../utilities/error.ts";
import { Result } from "./error.ts";
import { compilePath, pathToRegexp } from "../../deps.ts";
import { BaseModule } from "./module.ts";

export interface CompatibilityLayer {
  transform?: (res: Response) => Promise<string[]>;
  fetch?: (...variables: string[]) => Promise<string[]>;
}

export interface Variable {
  key: string;
  url: string;
  compatibilityLayer?: CompatibilityLayer;
}

export interface RegistrySpecifier {
  schema: string;
  variables: Variable[];
}

export interface Intellisense {
  version: number;
  registries: RegistrySpecifier[];
}

export interface Cache {
  readonly preventRefresh: boolean;
  intellisense?: Intellisense;
}

interface RegistryOptions_ {
  intellisense: Intellisense;
  intellisensePath?: string;
  protocol?: string;
  variableMapping?: Map<string, string>;
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
  public variableMapping: Map<string, string>;

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
    this.variableMapping = options.variableMapping ?? new Map();
  }

  static get(host: string, protocol = "https:"): Registry | null {
    return Registry.registries.find((registry) =>
      registry.host === host && registry.protocol === protocol
    ) ?? null;
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

  mapVariable(variable: string): string {
    return this.variableMapping.get(variable) ?? variable;
  }

  mapVariables(variables: Map<string, string>): Map<string, string> {
    const res = new Map<string, string>();
    for (const [key, value] of variables) {
      res.set(this.mapVariable(key), value);
    }
    return res;
  }

  get reverseVariableMapping(): Map<string, string> {
    const res = new Map<string, string>();
    for (const [key, value] of this.variableMapping) {
      res.set(value, key);
    }
    return res;
  }

  from(variables: Record<string, string>): PartialModule {
    return new PartialModule(this, variables);
  }
}

export class PartialModule {
  protected variables: Map<string, string>;

  constructor(
    protected registry: Registry,
    variables: Record<string, string> | Map<string, string>,
  ) {
    this.variables = variables instanceof Map
      ? variables
      : new Map(Object.entries(variables));
  }

  getEvery(varName: string): Result<string[]> {
    const reverseVariableMapping = this.registry.reverseVariableMapping;
    const varNameMapped = this.registry.mapVariable(varName);
    const specifier = this.registry.intellisense.registries.find((registry) => {
      const variable = registry.variables.find((v) => v.key === varNameMapped);
      if (variable === undefined) return false;
      const variables = variable.url.matchAll(/\${(\w+)}|\${{(\w+)}}/g);
      return [...variables].every((v) => {
        return this.variables.has(reverseVariableMapping.get(v[1]) ?? v[1]);
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
    ).getEvery(varNameMapped);
  }

  versions(): Result<string[]> {
    return this.getEvery("version");
  }

  modules(): Result<string[]> {
    return this.getEvery("module");
  }

  paths(): Result<string[]> {
    return this.getEvery("path");
  }

  authors(): Result<string[]> {
    return this.getEvery("author");
  }

  toURL(): URL | null {
    const specifier = this.registry.intellisense.registries.find((registry) =>
      registry.variables.every((variable) => this.variables.has(variable.key))
    );
    if (specifier === undefined) return null;
    const toPath = compilePath(specifier.schema);
    return new URL(
      `${this.registry.protocol}${this.registry.host}${
        toPath(this.registry.mapVariables(this.variables))
      }`,
    );
  }

  toString(): string | null {
    return this.toURL()?.href ?? null;
  }
}
