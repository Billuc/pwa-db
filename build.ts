const result = await Bun.build({
  entrypoints: ["./index.ts"],
  // outdir: "./build",
  format: "esm",
  target: "browser",
  splitting: false,
  // sourcemap: "external",
  minify: false,
});

if (!result.success) {
  throw new AggregateError(result.logs, "Build failed");
}

for (const output of result.outputs) {
  const outputText = await output.text();
  const outputWithoutExport = outputText.slice(0, outputText.indexOf("export"));
  await Bun.write("./build/index.js", outputWithoutExport);
}

console.log("Project built !")
