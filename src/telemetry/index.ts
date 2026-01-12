export async function withTracing<T>(ctx: { traceId: string }, fn: () => Promise<T>): Promise<T> {
  // Later: start span, set traceId, propagate, record duration/errors.
  return await fn();
}
