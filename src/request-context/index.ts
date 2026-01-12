import { randomUUID } from "crypto";
import type { Logger } from "../logger/index.js";

export type RequestContext = {
  traceId: string;
  tenantId?: string;
  userId?: string;
};

export function createRequestContextPlugin(opts: { logger: Logger }) {
  return async function requestContextPlugin(app: any) {
    app.decorateRequest("ctx", null);

    app.addHook("onRequest", async (req: any) => {
      const traceId = String(req.headers["x-trace-id"] ?? randomUUID());
      const tenantId = req.headers["x-tenant-id"] ? String(req.headers["x-tenant-id"]) : undefined;

      req.ctx = { traceId, tenantId } as RequestContext;

      // ensure downstream calls receive trace headers
      req.headers["x-trace-id"] = traceId;

      opts.logger.debug("request_context", { traceId, tenantId, method: req.method, url: req.url });
    });
  };
}
