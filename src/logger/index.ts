export type LogLevel = "debug" | "info" | "warn" | "error";

export type LogFields = Record<string, unknown>;

export type Logger = {
  debug: (msg: string, fields?: LogFields) => void;
  info: (msg: string, fields?: LogFields) => void;
  warn: (msg: string, fields?: LogFields) => void;
  error: (msg: string, fields?: LogFields) => void;
};

function nowIso() {
  return new Date().toISOString();
}

export function createLogger(opts: { service: string }): Logger {
  const base = { service: opts.service };

  function emit(level: LogLevel, msg: string, fields?: LogFields) {
    // Structured JSON logs (OCI Logging / ELK friendly)
    // eslint-disable-next-line no-console
    console.log(JSON.stringify({ ts: nowIso(), level, msg, ...base, ...(fields ?? {}) }));
  }

  return {
    debug: (m, f) => emit("debug", m, f),
    info: (m, f) => emit("info", m, f),
    warn: (m, f) => emit("warn", m, f),
    error: (m, f) => emit("error", m, f)
  };
}
