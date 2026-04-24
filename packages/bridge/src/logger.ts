export interface Logger {
  debug(message: string, ...args: unknown[]): void;
  info(message: string, ...args: unknown[]): void;
  warn(message: string, ...args: unknown[]): void;
  error(message: string, ...args: unknown[]): void;
}

const NOOP_LOGGER: Logger = {
  debug: () => {},
  info: () => {},
  warn: () => {},
  error: () => {},
};

function buildPrefixedMessage(prefix: string, message: string): string {
  return prefix.length > 0 ? `[${prefix}] ${message}` : message;
}

export function createConsoleLogger(prefix: string): Logger {
  return {
    debug: (message: string, ...args: unknown[]) => {
      console.debug(buildPrefixedMessage(prefix, message), ...args);
    },
    info: (message: string, ...args: unknown[]) => {
      console.info(buildPrefixedMessage(prefix, message), ...args);
    },
    warn: (message: string, ...args: unknown[]) => {
      console.warn(buildPrefixedMessage(prefix, message), ...args);
    },
    error: (message: string, ...args: unknown[]) => {
      console.error(buildPrefixedMessage(prefix, message), ...args);
    },
  };
}

export function createNoopLogger(): Logger {
  return NOOP_LOGGER;
}
