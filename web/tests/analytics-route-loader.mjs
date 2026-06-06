import { existsSync } from "node:fs";
import { dirname, extname, resolve as resolvePath } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const nextServerModule = `
export class NextRequest extends Request {}
export class NextResponse extends Response {
  static json(body, init = {}) {
    const headers = new Headers(init.headers || {});
    if (!headers.has("content-type")) {
      headers.set("content-type", "application/json");
    }
    return new Response(JSON.stringify(body), { ...init, headers });
  }
}
`;

function tsFallback(specifier, parentURL) {
  if (!parentURL || extname(specifier)) return null;
  if (!specifier.startsWith(".") && !specifier.startsWith("/")) return null;
  const parentDir = dirname(fileURLToPath(parentURL));
  const candidate = resolvePath(parentDir, specifier) + ".ts";
  return existsSync(candidate) ? pathToFileURL(candidate).href : null;
}

export async function resolve(specifier, context, nextResolve) {
  if (specifier === "next/server") {
    return {
      url: `data:text/javascript,${encodeURIComponent(nextServerModule)}`,
      shortCircuit: true,
    };
  }

  const fallbackURL = tsFallback(specifier, context.parentURL);
  if (fallbackURL) {
    return { url: fallbackURL, shortCircuit: true };
  }

  return nextResolve(specifier, context);
}
