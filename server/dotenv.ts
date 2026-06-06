import { existsSync, readFileSync } from "node:fs";

/**
 * Minimal .env loader. Reads `KEY=value` lines from the given file and fills
 * them into `env`, WITHOUT overriding values that are already set (so an
 * explicit `PORT=4173 npm run serve` still wins over the file). Lines that are
 * blank or start with `#` are ignored. Surrounding quotes are stripped.
 * Returns true when the file was read, false when it is absent.
 */
export function loadDotEnv(
  path: string,
  env: NodeJS.ProcessEnv | Record<string, string | undefined> = process.env,
): boolean {
  if (!existsSync(path)) return false;

  const content = readFileSync(path, "utf8");
  for (const rawLine of content.split(/\r?\n/)) {
    const line = rawLine.trim();
    if (!line || line.startsWith("#")) continue;

    const eq = line.indexOf("=");
    if (eq === -1) continue;

    const key = line.slice(0, eq).trim();
    if (!key || env[key] !== undefined) continue;

    let value = line.slice(eq + 1).trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    env[key] = value;
  }

  return true;
}
