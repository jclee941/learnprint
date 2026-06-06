import { createReadStream, existsSync, statSync } from "node:fs";
import { isAbsolute, join, normalize, relative, resolve } from "node:path";
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
  const root = resolve(distDir);
  const indexPath = join(root, "index.html");

  let decodedPath: string;
  try {
    decodedPath = decodeURIComponent(url.pathname);
  } catch {
    // 잘못된 퍼센트 이스케이프는 핸들러를 중단시키지 않고 SPA 인덱스로 폴백한다.
    decodedPath = "";
  }

  const requested = normalize(decodedPath).replace(/^\/+/, "");
  let filePath = resolve(join(root, requested));

  // root 밖으로 벗어나는 경로(상위/형제 디렉터리 포함)는 거부하고 index.html로 폴백.
  const within = filePath === root || (() => {
    const rel = relative(root, filePath);
    return rel !== "" && !rel.startsWith("..") && !isAbsolute(rel);
  })();

  if (!within || !existsSync(filePath) || statSync(filePath).isDirectory()) {
    filePath = indexPath;
  }

  if (!existsSync(filePath)) {
    res.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" });
    res.end("Not found");
    return;
  }

  res.writeHead(200, { "Content-Type": contentType(filePath) });
  createReadStream(filePath).pipe(res);
}
