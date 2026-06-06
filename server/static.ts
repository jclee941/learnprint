import { createReadStream, existsSync, statSync } from "node:fs";
import { join, normalize, resolve } from "node:path";
import type { IncomingMessage, ServerResponse } from "node:http";

const contentTypes: Record<string, string> = {
  ".css": "text/css; charset=utf-8",
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".svg": "image/svg+xml",
};

function contentType(pathname: string): string {
  const extension = pathname.slice(pathname.lastIndexOf("."));
  return contentTypes[extension] ?? "application/octet-stream";
}

export function serveStatic(
  req: IncomingMessage,
  res: ServerResponse,
  distDir: string,
): void {
  const url = new URL(req.url ?? "/", "http://localhost");
  const requested = normalize(decodeURIComponent(url.pathname)).replace(/^\/+/, "");
  const root = resolve(distDir);
  let filePath = resolve(join(root, requested));

  if (!filePath.startsWith(root) || !existsSync(filePath) || statSync(filePath).isDirectory()) {
    filePath = join(root, "index.html");
  }

  if (!existsSync(filePath)) {
    res.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" });
    res.end("Not found");
    return;
  }

  res.writeHead(200, { "Content-Type": contentType(filePath) });
  createReadStream(filePath).pipe(res);
}
