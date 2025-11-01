import { type LogData, Logger, type LogLevel } from '../base.ts';

export interface ComboLoggerOptions {
    loggers: Iterable<Logger>;
}

export class ComboLogger extends Logger {
    #loggers: Set<Logger>;

    constructor(options: ComboLoggerOptions) {
        super();

        this.#loggers = new Set(options.loggers);
    }

    override child(context: string): ComboLogger {
        return new ComboLogger({
            loggers: [...this.#loggers].map((logger) => logger.child(context)),
        });
    }

    override log(level: LogLevel, message: string, data?: LogData): void {
        for (const logger of this.#loggers) {
            logger.log(level, message, data);
        }
    }
}
