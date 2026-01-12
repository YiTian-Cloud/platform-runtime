import jwt from "jsonwebtoken";
import type { Logger } from "../logger/index.js";

export type Principal = {
  userId: string;
  roles: string[];
  groups?: string[];
};

export function createAuthPlugin(opts: {
  logger: Logger;
  requireAuth: boolean;
  issuer?: string;
  audience?: string;
  publicKeyPem?: string; // optional
}) {
  return async function authPlugin(app: any) {
    app.decorateRequest("principal", null);

    app.addHook("preHandler", async (req: any, reply: any) => {
      if (!opts.requireAuth) return;

      const auth = req.headers.authorization;
      if (!auth?.startsWith("Bearer ")) {
        reply.code(401);
        return reply.send({ error: "missing_bearer_token" });
      }
      const token = auth.slice("Bearer ".length);

      let payload: any;
      try {
        payload = opts.publicKeyPem
          ? jwt.verify(token, opts.publicKeyPem, { issuer: opts.issuer, audience: opts.audience })
          : jwt.decode(token);
      } catch (e: any) {
        opts.logger.warn("jwt_failed", { traceId: req.ctx?.traceId, err: e?.message });
        reply.code(401);
        return reply.send({ error: "invalid_token" });
      }

      const userId = String(payload?.sub ?? payload?.userId ?? "");
      const roles = Array.isArray(payload?.roles) ? payload.roles.map(String) : [];
      const groups = Array.isArray(payload?.groups) ? payload.groups.map(String) : undefined;

      if (!userId) {
        reply.code(401);
        return reply.send({ error: "invalid_principal" });
      }

      req.principal = { userId, roles, groups } as Principal;

      // propagate into ctx
      if (req.ctx) req.ctx.userId = userId;
      // allow tenantId in JWT as fallback
      if (req.ctx && !req.ctx.tenantId && payload?.tenantId) req.ctx.tenantId = String(payload.tenantId);
    });
  };
}
