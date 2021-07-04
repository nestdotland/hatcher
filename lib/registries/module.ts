import { Registry } from "./registry.ts";
import { HatcherError } from "../utilities/error.ts";
import { Key, pathToRegexp } from "../../deps.ts";
import { Err, Ok, Result } from "./error.ts";
import type { RegistrySpecifier, Variable } from "./registry.ts";

function toURL(url: URL | string): URL {
  return typeof url === "string" ? new URL(url) : url;
}

export class BaseModule {
  constructor(
    readonly registry: Registry,
    readonly specifier: RegistrySpecifier,
    protected variables: Map<string, string>,
  ) {}

  protected fillEndpoint(url: string): string | null {
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

  protected async getEndpointResponse(variable: Variable): Result<string[]> {
    const filled = this.fillEndpoint(variable.url);
    if (filled === null) {
      return Err("Some variables couldn't be filled out.", 0);
    }
    const url = new URL(filled);
    if (url.protocol === "hatcher:") {
      if (variable.compatibilityLayer?.fetch === undefined) {
        return Err("fetch function was not provided", 0);
      }
      return Ok(
        await variable.compatibilityLayer.fetch(...url.pathname.split("/")),
      );
    }
    const result = await fetch(filled);
    if (!result.ok) Err("Error while fetching endpoint url", 0);
    const json = variable.compatibilityLayer?.transform === undefined
      ? await result.json()
      : variable.compatibilityLayer.transform(result);
    if (!Array.isArray(json)) Err("Endpoint response is not an array.", 0);
    return Ok(json);
  }

  get(varName: string): string | null {
    return this.variables.get(varName) ?? null;
  }

  getEvery(varName: string): Result<string[]> {
    const variable = this.specifier.variables.find((v) => v.key === varName);
    if (variable === undefined) {
      return Err(`No ${varName} variable with this url`, 0);
    }
    return this.getEndpointResponse(variable);
  }

  protected _get(varName: string): string | null {
    return this.get(this.registry.mapVariable(varName));
  }

  protected _getEvery(varName: string): Result<string[]> {
    return this.getEvery(this.registry.mapVariable(varName));
  }

  /* --- */

  get version(): string | null {
    return this._get("version");
  }

  get module(): string | null {
    return this._get("module");
  }

  get path(): string | null {
    return this._get("path");
  }

  get author(): string | null {
    return this._get("author");
  }

  /* --- */

  versions(): Result<string[]> {
    return this._getEvery("version");
  }

  modules(): Result<string[]> {
    return this._getEvery("module");
  }

  paths(): Result<string[]> {
    return this._getEvery("path");
  }

  authors(): Result<string[]> {
    return this._getEvery("author");
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
