const result = await Bun.build({
  entrypoints: ["./index.ts"],
  // outdir: "./build",
  format: "esm",
  target: "browser",
  splitting: false,
  // sourcemap: "external",
  minify: {
    whitespace: true,
    syntax: true,
    identifiers: false,
  },
});

if (!result.success) {
  throw new AggregateError(result.logs, "Build failed");
}

for (const output of result.outputs) {
  const outputText = await output.text();
  const outputWithoutExport = outputText.slice(0, outputText.indexOf("export"));
  const size = await Bun.write(`./build/${output.path}`, outputWithoutExport);

  console.log(`Wrote file ${output.path} with a size of ${size} bytes`)
}

console.log("Project built !")
