import config from "../config/config.js";

export type LogLevels = "ERROR" | "WARN" | "INFO" | "DEBUG";

export const LOG_LEVELS: Record<LogLevels, number> = {
  ERROR: 0,
  WARN: 1,
  INFO: 2,
  DEBUG: 3,
};

/**
 * Resolve the numeric log level from configuration, defaulting to INFO.
 */
const getLogLevel = (): number => {
  const level = config.logLevel.toUpperCase() as LogLevels;
  return LOG_LEVELS[level] || LOG_LEVELS.INFO;
};

const currentLogLevel = getLogLevel();

const colors = {
  reset: "\x1b[0m",
  bright: "\x1b[1m",
  red: "\x1b[31m",
  green: "\x1b[32m",
  yellow: "\x1b[33m",
  blue: "\x1b[34m",
  magenta: "\x1b[35m",
  cyan: "\x1b[36m",
  gray: "\x1b[90m",
} as const;

const getTimestamp = (): string => new Date().toISOString();

/**
 * Format a log entry with consistent colouring and optional structured payload.
 */
const formatMessage = (
  level: LogLevels,
  message: string,
  data: unknown = null,
): string => {
  const timestamp = getTimestamp();
  const levelUpper = level.toUpperCase();

  let formattedMessage = `${colors.gray}[${timestamp}]${colors.reset} ${colors.bright}${levelUpper}${colors.reset}`;

  if (data && typeof data === "object") {
    formattedMessage += ` ${message} ${colors.cyan}${JSON.stringify(data, null, 2)}${colors.reset}`;
  } else {
    formattedMessage += ` ${message}`;
  }

  return formattedMessage;
};

/**
 * Structured console logger with log-level gating and coloured output.
 */
class Logger {
  name: string;

  constructor(name = "API") {
    this.name = name;
  }

  /** Log an error-level message. Always shown regardless of LOG_LEVEL. */
  error(message: string, data: unknown = null): void {
    console.error(formatMessage("ERROR", `[${this.name}] ${message}`, data));
  }

  /** Log a warning. Shown when LOG_LEVEL >= WARN. */
  warn(message: string, data: unknown = null): void {
    if (currentLogLevel >= LOG_LEVELS.WARN) {
      console.warn(formatMessage("WARN", `[${this.name}] ${message}`, data));
    }
  }

  /** Log informational context. Shown when LOG_LEVEL >= INFO. */
  info(message: string, data: unknown = null): void {
    if (currentLogLevel >= LOG_LEVELS.INFO) {
      console.log(formatMessage("INFO", `[${this.name}] ${message}`, data));
    }
  }

  /** Emit debugging statements. Shown when LOG_LEVEL >= DEBUG. */
  debug(message: string, data: unknown = null): void {
    if (currentLogLevel >= LOG_LEVELS.DEBUG) {
      console.log(formatMessage("DEBUG", `[${this.name}] ${message}`, data));
    }
  }

  /**
   * Convenience helper for structured HTTP request logs, including latency.
   */
  http(
    method: string,
    path: string,
    statusCode: number,
    responseTime: number | null = null,
  ): void {
    if (currentLogLevel >= LOG_LEVELS.DEBUG) {
      const statusColor =
        statusCode >= 400
          ? colors.red
          : statusCode >= 300
            ? colors.yellow
            : colors.green;

      const timestamp = getTimestamp();
      let message = `${colors.gray}[${timestamp}]${colors.reset} ${colors.bright}HTTP${colors.reset} ${method} ${path} ${statusColor}${statusCode}${colors.reset}`;

      if (responseTime) {
        message += ` ${colors.cyan}${responseTime}ms${colors.reset}`;
      }

      console.log(message);
    }
  }

  /**
   * Log raw SQL queries alongside parameters and query duration.
   */
  query(
    sql: string,
    params: unknown = null,
    duration: number | null = null,
  ): void {
    if (currentLogLevel >= LOG_LEVELS.DEBUG) {
      const timestamp = getTimestamp();
      let message = `${colors.gray}[${timestamp}]${colors.reset} ${colors.bright}QUERY${colors.reset} ${sql}`;

      if (params) {
        message += ` ${colors.cyan}Params: ${JSON.stringify(params)}${colors.reset}`;
      }

      if (duration) {
        message += ` ${colors.yellow}${duration}ms${colors.reset}`;
      }

      console.log(message);
    }
  }

  /** Create a namespaced logger that inherits the global configuration. */
  createLogger(name: string): Logger {
    return new Logger(name);
  }
}

const defaultLogger = new Logger("API");

/**
 * Factory for creating ad-hoc logger instances with custom prefixes.
 */
export const createLogger = (name: string): Logger => new Logger(name);
export default defaultLogger;
