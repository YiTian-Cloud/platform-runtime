import { postJson } from "../http/index.js";

export type PolicyDecision = { allow: boolean; reason?: string | null };

export function createPolicyClient(opts: { baseUrl: string }) {
  async function check(args: {
    tenantId: string;
    principal: { userId: string; roles: string[]; groups?: string[] };
    action: string;
    resource?: string | null;
    traceId: string;
  }): Promise<PolicyDecision> {
    const { status, json } = await postJson<any>(
      `${opts.baseUrl}/check`,
      {
        tenantId: args.tenantId,
        user: args.principal,
        action: args.action,
        resource: args.resource ?? null,
        traceId: args.traceId
      },
      {
        headers: { "x-trace-id": args.traceId, "x-tenant-id": args.tenantId }
      }
    );

    if (status >= 400) return { allow: false, reason: "policy_service_error" };
    return json as PolicyDecision;
  }

  return { check };
}
