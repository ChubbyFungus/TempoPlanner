export function createLogger(context: string) {
  return {
    debug: (...args: any[]) => console.debug(`[${context}]`, ...args),
    info: (...args: any[]) => console.info(`[${context}]`, ...args),
    warn: (...args: any[]) => console.warn(`[${context}]`, ...args),
    error: (...args: any[]) => console.error(`[${context}]`, ...args)
  };
} 