class Logger {
  /**
   * Log debug information
   */
  debug(message, ...args) {
    console.debug(`[DEBUG] ${message}`, ...args);
  }

  /**
   * Log general information
   */
  log(message, ...args) {
    console.log(`[LOG] ${message}`, ...args);
  }

  /**
   * Log warning messages
   */
  warn(message, ...args) {
    console.warn(`[WARN] ${message}`, ...args);
  }

  /**
   * Log error messages
   */
  error(message, ...args) {
    console.error(`[ERROR] ${message}`, ...args);
  }
}

export default new Logger();