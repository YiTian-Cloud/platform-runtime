import { request } from "undici";

export type HttpOptions = {
  timeoutMs?: number;
  headers?: Record<string, string>;
};

export async function postJson<T>(url: string, body: unknown, opts: HttpOptions = {}) {
  const timeoutMs = opts.timeoutMs ?? 10_000;

  const res = await request(url, {
    method: "POST",
    headers: { "content-type": "application/json", ...(opts.headers ?? {}) },
    body: JSON.stringify(body),
    headersTimeout: timeoutMs,
    bodyTimeout: timeoutMs
  });

  const json = (await res.body.json()) as T;
  return { status: res.statusCode, json };
}

export async function getJson<T>(url: string, opts: HttpOptions = {}) {
  const timeoutMs = opts.timeoutMs ?? 10_000;

  const res = await request(url, {
    method: "GET",
    headers: { ...(opts.headers ?? {}) },
    headersTimeout: timeoutMs,
    bodyTimeout: timeoutMs
  });

  const json = (await res.body.json()) as T;
  return { status: res.statusCode, json };
}
