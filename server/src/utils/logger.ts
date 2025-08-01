interface LogLevel {
  ERROR: number
  WARN: number
  INFO: number
  DEBUG: number
}

const LOG_LEVELS: LogLevel = {
  ERROR: 0,
  WARN: 1,
  INFO: 2,
  DEBUG: 3,
}

class Logger {
  private level: number
  private isDevelopment: boolean

  constructor() {
    this.isDevelopment = process.env.NODE_ENV === 'development'
    this.level = this.isDevelopment ? LOG_LEVELS.DEBUG : LOG_LEVELS.INFO
  }

  private formatMessage(level: string, message: string, ...args: any[]): string {
    const timestamp = new Date().toISOString()
    const formattedArgs = args.length > 0 ? JSON.stringify(args, null, 2) : ''
    return `[${timestamp}] ${level}: ${message} ${formattedArgs}`
  }

  private shouldLog(level: number): boolean {
    return level <= this.level
  }

  error(message: string, ...args: any[]): void {
    if (this.shouldLog(LOG_LEVELS.ERROR)) {
      console.error(this.formatMessage('ERROR', message, ...args))
    }
  }

  warn(message: string, ...args: any[]): void {
    if (this.shouldLog(LOG_LEVELS.WARN)) {
      console.warn(this.formatMessage('WARN', message, ...args))
    }
  }

  info(message: string, ...args: any[]): void {
    if (this.shouldLog(LOG_LEVELS.INFO)) {
      console.log(this.formatMessage('INFO', message, ...args))
    }
  }

  debug(message: string, ...args: any[]): void {
    if (this.shouldLog(LOG_LEVELS.DEBUG)) {
      console.log(this.formatMessage('DEBUG', message, ...args))
    }
  }
}

export const logger = new Logger() 