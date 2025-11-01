export enum LogLevel {
    Trace = 'TRACE',
    Debug = 'DEBUG',
    Info = 'INFO',
    Warn = 'WARN',
    Error = 'ERROR',
    Fatal = 'FATAL',
}

export type LogData = Record<string, unknown>;

export abstract class Logger {
    abstract child(context: string): Logger;
    abstract log(level: LogLevel, message: string, data?: LogData): void;

    trace(message: string, data?: LogData) {
        this.log(LogLevel.Trace, message, data);
    }
    debug(message: string, data?: LogData) {
        this.log(LogLevel.Debug, message, data);
    }
    info(message: string, data?: LogData) {
        this.log(LogLevel.Info, message, data);
    }
    warn(message: string, data?: LogData) {
        this.log(LogLevel.Warn, message, data);
    }
    error(message: string, data?: LogData) {
        this.log(LogLevel.Error, message, data);
    }
    fatal(message: string, data?: LogData) {
        this.log(LogLevel.Fatal, message, data);
    }
}
