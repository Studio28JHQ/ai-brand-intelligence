export type LogLevel = 'debug' | 'info' | 'warn' | 'error';

export interface LogContext {
  correlationId?: string;
  [key: string]: unknown;
}

const LEVEL_RANK: Record<LogLevel, number> = { debug: 0, info: 1, warn: 2, error: 3 };

let minLevel: LogLevel = 'debug';

/** Sets the minimum level actually written; lower-severity calls become no-ops. Defaults to 'debug' (everything logged) until the app explicitly configures it at bootstrap. */
export function setLogLevel(level: LogLevel): void {
  minLevel = level;
}

function write(level: LogLevel, message: string, context?: LogContext): void {
  if (LEVEL_RANK[level] < LEVEL_RANK[minLevel]) {
    return;
  }

  const entry = {
    timestamp: new Date().toISOString(),
    level,
    message,
    ...context,
  };
  const line = JSON.stringify(entry);

  if (level === 'error') {
    console.error(line);
  } else if (level === 'warn') {
    console.warn(line);
  } else {
    console.log(line);
  }
}

export const logger = {
  debug: (message: string, context?: LogContext) => write('debug', message, context),
  info: (message: string, context?: LogContext) => write('info', message, context),
  warn: (message: string, context?: LogContext) => write('warn', message, context),
  error: (message: string, context?: LogContext) => write('error', message, context),
};
