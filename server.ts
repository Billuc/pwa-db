// bun --hot run server.ts
// Importing index.ts to make hot-reload work
import "./index.ts";
import "./build.ts";

declare global {
  var count: number;
  var counter: number;
}

const PWA_DB_TOPIC = "PWA_DB_TOPIC";

globalThis.count ??= 0;
globalThis.counter ??= 1;
console.log(`Reloaded ${globalThis.count} times`);
globalThis.count++;

const server = Bun.serve({
  async fetch(req, server) {
    const url = new URL(req.url);

    if (url.pathname === "/index.js") return new Response(Bun.file('./build/index.js'))
    if (url.pathname === "/") return new Response(Bun.file("./index.html"))
    if (url.pathname === "/ws") {
      if (server.upgrade(req, { data: await req.text() })) return;
      return new Response("Upgrade failed", { status: 500 });
    }

    return new Response(`Nothing at path ${url.pathname}`, { status: 404 });
  },
  websocket: {
    open: (ws) => { ws.subscribe(PWA_DB_TOPIC) },
    close: (ws) => { ws.unsubscribe(PWA_DB_TOPIC) },
    message: (ws, message) => { console.log(ws.data, message) },
  },
  port: "3003"
});

setInterval(() => {
  server.publish(PWA_DB_TOPIC, `INSERT DATA IN STORE another WITH VALUE {"id": ${globalThis.counter}}`);
  globalThis.counter++;
}, 10000);

console.log(`Server started on port ${server.port}`);

