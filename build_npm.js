import { build, emptyDir } from "jsr:@deno/dnt";

await emptyDir("./npm");

await build({
  entryPoints: ["./src/midi-player.js"],
  outDir: "./npm",
  shims: {
    deno: true,
  },
  package: {
    name: "@marmooo/midi-player",
    version: "0.0.6",
    description: "<midi-player> HTML elements powered by Midy.",
    license: "Apache-2.0",
    repository: {
      type: "git",
      url: "git+https://github.com/marmooo/midi-player.git",
    },
    bugs: {
      url: "https://github.com/marmooo/midi-player/issues",
    },
  },
  postBuild() {
    Deno.copyFileSync("LICENSE", "npm/LICENSE");
    Deno.copyFileSync("README.md", "npm/README.md");
  },
});
