import { access, copyFile, cp, mkdir, readFile, rm, writeFile } from "node:fs/promises";

const worker = `export default {
  async fetch(request, env) {
    if (!env.ASSETS) {
      return new Response("Static asset binding unavailable", { status: 500 });
    }

    const url = new URL(request.url);
    if ((url.pathname === "/shop" || url.pathname === "/shop/") && request.method === "GET") {
      const shopUrl = new URL("/shop/index.html", request.url);
      return env.ASSETS.fetch(new Request(shopUrl, request));
    }

    const response = await env.ASSETS.fetch(request);
    if (response.status !== 404 || request.method !== "GET") {
      return response;
    }

    const acceptsHtml = request.headers.get("accept")?.includes("text/html");
    if (!acceptsHtml) {
      return response;
    }

    const indexUrl = new URL("/index.html", request.url);
    return env.ASSETS.fetch(new Request(indexUrl, request));
  },
};
`;

await rm("dist", { recursive: true, force: true });
await mkdir("dist/client/_next", { recursive: true });
await mkdir("dist/client/shop", { recursive: true });
await mkdir("dist/server", { recursive: true });
await mkdir("dist/.openai", { recursive: true });

await cp(".next/static", "dist/client/_next/static", { recursive: true });
await cp("public", "dist/client", { recursive: true });
await copyFile(".next/server/app/index.html", "dist/client/index.html");
const shopCandidates = [
  ".next/server/app/shop.html",
  ".next/server/app/shop/index.html",
];
let shopHtmlPath;
for (const candidate of shopCandidates) {
  try {
    await access(candidate);
    shopHtmlPath = candidate;
    break;
  } catch {
    // Try the next static route location.
  }
}
if (!shopHtmlPath) {
  throw new Error("Static /shop HTML was not generated.");
}
await copyFile(shopHtmlPath, "dist/client/shop/index.html");
await copyFile("app/icon.svg", "dist/client/icon.svg");
await copyFile(".openai/hosting.json", "dist/.openai/hosting.json");
await writeFile("dist/server/index.js", worker, "utf8");

const html = await readFile("dist/client/index.html", "utf8");
const shopHtml = await readFile("dist/client/shop/index.html", "utf8");
if (!html.includes("Wandering Wizard Wares")) {
  throw new Error("Static storefront HTML was not generated correctly.");
}
if (!shopHtml.includes("Peruse the")) {
  throw new Error("Static shop HTML was not generated correctly.");
}

console.log("Prepared static Sites build.");
