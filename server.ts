// bun --hot run server.ts
// Importing index.ts to make hot-reload work
import "./index.ts";
import "./build.ts";

declare global {
  var count: number;
}

globalThis.count ??= 0;
console.log(`Reloaded ${globalThis.count} times`);
globalThis.count++;

const server = Bun.serve({
  fetch(req) {
    const url = new URL(req.url);

    if (url.pathname === "/index.js") return new Response(Bun.file('./build/index.js'))
    if (url.pathname === "/") return new Response(Bun.file("./index.html"))

    return new Response(`Nothing at path ${url.pathname}`, { status: 404 });
  }
});

console.log(`Server started on port ${server.port}`);

