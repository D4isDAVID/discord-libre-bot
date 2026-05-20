export type LogData = Record<string, unknown>;

export interface Logger {
    child(data: LogData): Logger;

    fatal(message: string, data?: LogData): void;
    error(message: string, data?: LogData): void;
    warn(message: string, data?: LogData): void;
    info(message: string, data?: LogData): void;
    debug(message: string, data?: LogData): void;
    trace(message: string, data?: LogData): void;
}
