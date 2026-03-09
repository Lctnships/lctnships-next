type LogLevel = "info" | "warn" | "error";

interface LogContext {
  [key: string]: unknown;
}

interface LogEntry {
  timestamp: string;
  level: LogLevel;
  message: string;
  context?: LogContext;
}

const isProduction = process.env.NODE_ENV === "production";

function formatError(err: unknown): Record<string, unknown> {
  if (err instanceof Error) {
    return {
      name: err.name,
      message: err.message,
      stack: err.stack,
    };
  }
  return { value: err };
}

function serialize(entry: LogEntry): string {
  return JSON.stringify(entry);
}

function logDev(level: LogLevel, message: string, context?: LogContext): void {
  const timestamp = new Date().toISOString();
  const prefix = `[${timestamp}]`;

  const levelLabels: Record<LogLevel, string> = {
    info: "\x1b[36mINFO\x1b[0m",
    warn: "\x1b[33mWARN\x1b[0m",
    error: "\x1b[31mERROR\x1b[0m",
  };

  const label = levelLabels[level];
  const consoleFn =
    level === "error"
      ? console.error
      : level === "warn"
        ? console.warn
        : console.info;

  if (context) {
    consoleFn(`${prefix} ${label} ${message}`, context);
  } else {
    consoleFn(`${prefix} ${label} ${message}`);
  }
}

function logProd(level: LogLevel, message: string, context?: LogContext): void {
  const entry: LogEntry = {
    timestamp: new Date().toISOString(),
    level,
    message,
  };

  if (context) {
    entry.context = context;
  }

  const consoleFn =
    level === "error"
      ? console.error
      : level === "warn"
        ? console.warn
        : console.info;

  consoleFn(serialize(entry));
}

function log(level: LogLevel, message: string, context?: LogContext): void {
  if (isProduction) {
    logProd(level, message, context);
  } else {
    logDev(level, message, context);
  }
}

export const logger = {
  info(message: string, context?: LogContext): void {
    log("info", message, context);
  },

  warn(message: string, context?: LogContext): void {
    log("warn", message, context);
  },

  error(message: string, error?: unknown, context?: LogContext): void {
    const errorContext: LogContext = {
      ...context,
      ...(error !== undefined ? { error: formatError(error) } : {}),
    };

    log(
      "error",
      message,
      Object.keys(errorContext).length > 0 ? errorContext : undefined
    );
  },
};
