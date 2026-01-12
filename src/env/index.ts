export type RuntimeEnv = {
  SERVICE_NAME: string;
  PORT: number;

  POLICY_URL?: string;

  REQUIRE_AUTH: boolean;
  JWT_ISSUER?: string;
  JWT_AUDIENCE?: string;
  JWKS_URL?: string; // optional (future)
};

function parseIntStrict(name: string, raw: string | undefined, fallback: number): number {
  const v = raw ?? String(fallback);
  const n = Number.parseInt(v, 10);
  if (!Number.isFinite(n)) throw new Error(`Invalid int env ${name}="${v}"`);
  return n;
}

function parseBool(raw: string | undefined, fallback: boolean): boolean {
  if (raw === undefined) return fallback;
  return ["1", "true", "yes", "on"].includes(raw.toLowerCase());
}

export function load(opts: { serviceName: string; portDefault: number; required?: string[] }): RuntimeEnv {
  const required = opts.required ?? [];
  for (const k of required) {
    if (!process.env[k]) throw new Error(`Missing required env: ${k}`);
  }

  return {
    SERVICE_NAME: process.env.SERVICE_NAME ?? opts.serviceName,
    PORT: parseIntStrict("PORT", process.env.PORT, opts.portDefault),

    POLICY_URL: process.env.POLICY_URL,

    REQUIRE_AUTH: parseBool(process.env.REQUIRE_AUTH, true),
    JWT_ISSUER: process.env.JWT_ISSUER,
    JWT_AUDIENCE: process.env.JWT_AUDIENCE,
    JWKS_URL: process.env.JWKS_URL
  };
}
