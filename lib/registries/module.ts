import { Registry, RegistrySpecifier, VariableMap } from "./Registry.ts";
import { HatcherError } from "../utilities/error.ts";
import { Key, pathToRegexp } from "../../deps.ts";
import { Err, Ok, Result } from "./error.ts";

function toURL(url: URL | string): URL {
  return typeof url === "string" ? new URL(url) : url;
}

export class BaseModule {
  constructor(
    readonly registry: Registry,
    readonly specifier: RegistrySpecifier,
    protected variables: Map<string, string | undefined>,
  ) {}

  protected fillURL(url: string): string | null {
    try {
      return url.replace(
        /\${(\w+)}/g,
        (_substring: string, varName: string) => {
          const variable = this.variables.get(varName);
          if (variable === undefined) throw "";
          return variable;
        },
      ).replace(
        /\${{(\w+)}}/g,
        (_substring: string, varName: string) => {
          const variable = this.variables.get(varName);
          if (variable === undefined) throw "";
          return encodeURIComponent(variable);
        },
      );
    } catch {
      return null;
    }
  }

  protected async getEndpointResponse(endpoint: string): Result<string[]> {
    const url = this.fillURL(endpoint);
    if (url === null) return Err("Some variables couldn't be filled out.", 0);
    const result = await fetch(url);
    if (!result.ok) Err("Error while fetching endpoint url", 0);
    const json = await result.json();
    if (!Array.isArray(json)) Err("Endpoint response is not an array.", 0);
    return Ok(json);
  }

  protected async getCompletion(varName: keyof VariableMap): Result<string[]> {
    const variable = this.specifier.variables.find((v) =>
      v.key === this.registry.variables[varName]
    );
    if (variable === undefined) {
      return Err(`No ${varName} variable with this url`, 0);
    }
    return this.getEndpointResponse(variable.url);
  }

  protected getVariable(varName: keyof VariableMap): string | null {
    return this.variables.get(this.registry.variables[varName]) ?? null;
  }

  get version(): string | null {
    return this.getVariable("version");
  }

  get module(): string | null {
    return this.getVariable("module");
  }

  get path(): string | null {
    return this.getVariable("path");
  }

  get author(): string | null {
    return this.getVariable("author");
  }

  /* --- */

  get versions(): Result<string[]> {
    return this.getCompletion("version");
  }

  get modules(): Result<string[]> {
    return this.getCompletion("module");
  }

  get paths(): Result<string[]> {
    return this.getCompletion("path");
  }

  get authors(): Result<string[]> {
    return this.getCompletion("author");
  }
}

export class Module extends BaseModule {
  readonly url: URL;

  constructor(url: URL | string) {
    const url_ = toURL(url);

    const registry = Registry.get(url_.host);
    if (registry === null) {
      throw new HatcherError(`${url_.host} registry was not found.`);
    }
    const matched = registry.match(url_);
    if (matched === null) {
      throw new HatcherError(`${url_.href} did not match any schema.`);
    }

    super(registry, matched, new Map());
    this.url = url_;

    const keys: Key[] = [];
    const groups = pathToRegexp(this.specifier.schema, keys)
      .exec(this.url.pathname) ?? [];
    for (let i = 0; i < keys.length; i++) {
      this.variables.set(
        keys[i].name.toString(),
        groups[i + 1],
      );
    }
  }

  static async create(url: URL | string): Promise<Module | null> {
    const url_ = toURL(url);

    const registry = Registry.get(url_.host, url_.protocol);
    if (registry === null) {
      const registry = new Registry(url_.host, { protocol: url_.protocol });
      try {
        await registry.cacheIntellisense();
      } catch (err) {
        if (err.message.match(/Error while fetching intellisense/)) return null;
        throw err;
      }
    }
    return new Module(url_);
  }
}
