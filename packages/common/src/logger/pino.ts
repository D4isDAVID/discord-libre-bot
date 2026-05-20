// biome-ignore lint/correctness/noUnresolvedImports: this exists
import type { Logger as Pino } from 'pino';
import type { LogData, Logger } from './base.ts';

export class PinoLogger implements Logger {
    readonly #pino: Pino;

    constructor(pino: Pino) {
        this.#pino = pino;
    }

    child(data: LogData): Logger {
        return new PinoLogger(this.#pino.child(data));
    }

    fatal(message: string, data?: LogData): void {
        this.#pino.fatal(data, message);
    }

    error(message: string, data?: LogData): void {
        this.#pino.error(data, message);
    }

    warn(message: string, data?: LogData): void {
        this.#pino.warn(data, message);
    }

    info(message: string, data?: LogData): void {
        this.#pino.info(data, message);
    }

    debug(message: string, data?: LogData): void {
        this.#pino.debug(data, message);
    }

    trace(message: string, data?: LogData): void {
        this.#pino.trace(data, message);
    }
}
