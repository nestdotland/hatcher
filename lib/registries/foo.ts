import { Registry } from "./Registry.ts";
import { Module } from "./Module.ts";

const deno = new Registry("deno.land");

await deno.cacheIntellisense();

// const mod = new Module("https://deno.land/x/oak@v7.7.0/buf_reader_test.ts");

// console.log(await mod.versions);
// console.log(await mod.modules);
// console.log(await mod.paths);
// console.log(await mod.authors);
// console.log(mod.version, mod.module, mod.path, mod.author);

const oak = deno.from({
  module: "oak",
});

console.log(await oak.versions);
console.log(await oak.paths);
