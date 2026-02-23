type LogLevel = "debug" | "info" | "warn" | "error";

const LEVEL_WEIGHT: Record<LogLevel, number> = {
  debug: 10,
  info: 20,
  warn: 30,
  error: 40,
};

const envLevel = (process.env.NEXT_PUBLIC_LOG_LEVEL as LogLevel | undefined) ?? "warn";
const devLogsEnabled = String(process.env.NEXT_PUBLIC_DEV_LOGS ?? "true") === "true";

const canLog = (level: LogLevel) => {
  if (!devLogsEnabled) return false;
  return LEVEL_WEIGHT[level] >= LEVEL_WEIGHT[envLevel];
};

const emit = (level: LogLevel, scope: string, message: string, payload?: Record<string, unknown>) => {
  if (!canLog(level)) return;
  const row = {
    ts: new Date().toISOString(),
    level,
    scope,
    message,
    ...(payload ?? {}),
  };
  if (level === "error") {
    console.error(row);
    return;
  }
  if (level === "warn") {
    console.warn(row);
    return;
  }
  if (level === "info") {
    console.info(row);
    return;
  }
  console.debug(row);
};

export const appLogger = {
  debug: (scope: string, message: string, payload?: Record<string, unknown>) =>
    emit("debug", scope, message, payload),
  info: (scope: string, message: string, payload?: Record<string, unknown>) =>
    emit("info", scope, message, payload),
  warn: (scope: string, message: string, payload?: Record<string, unknown>) =>
    emit("warn", scope, message, payload),
  error: (scope: string, message: string, payload?: Record<string, unknown>) =>
    emit("error", scope, message, payload),
};
