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

const stripeModule = `
export default class Stripe {
  constructor(secretKey) {
    globalThis.__stripeConstructors = globalThis.__stripeConstructors || [];
    globalThis.__stripeConstructors.push({ secretKey });
    this.checkout = {
      sessions: {
        create: async (params) => {
          globalThis.__stripeCheckoutSessions = globalThis.__stripeCheckoutSessions || [];
          globalThis.__stripeCheckoutSessions.push(params);
          return { id: "cs_test_route", url: "https://checkout.stripe.test/session/cs_test_route" };
        },
      },
    };
    this.webhooks = {
      constructEvent: (rawBody, signature, secret) => {
        globalThis.__stripeConstructedEvents = globalThis.__stripeConstructedEvents || [];
        globalThis.__stripeConstructedEvents.push({ rawBody, signature, secret });
        return JSON.parse(rawBody);
      },
    };
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

  if (specifier === "stripe") {
    return {
      url: `data:text/javascript,${encodeURIComponent(stripeModule)}`,
      shortCircuit: true,
    };
  }

  const fallbackURL = tsFallback(specifier, context.parentURL);
  if (fallbackURL) {
    return { url: fallbackURL, shortCircuit: true };
  }

  return nextResolve(specifier, context);
}
