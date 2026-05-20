import type { LogData, Logger } from './base.ts';

export interface MockLoggerOptions {
    data?: LogData;
    fatal?(message: string, data?: LogData): void;
    error?(message: string, data?: LogData): void;
    warn?(message: string, data?: LogData): void;
    info?(message: string, data?: LogData): void;
    debug?(message: string, data?: LogData): void;
    trace?(message: string, data?: LogData): void;
}

function noop() {
    return;
}

export class MockLogger implements Logger {
    readonly #data: LogData;
    readonly #fatal: (message: string, data?: LogData) => void;
    readonly #error: (message: string, data?: LogData) => void;
    readonly #warn: (message: string, data?: LogData) => void;
    readonly #info: (message: string, data?: LogData) => void;
    readonly #debug: (message: string, data?: LogData) => void;
    readonly #trace: (message: string, data?: LogData) => void;

    constructor({
        data = {},
        fatal = noop,
        error = noop,
        warn = noop,
        info = noop,
        debug = noop,
        trace = noop,
    }: MockLoggerOptions = {}) {
        this.#data = data;
        this.#fatal = fatal;
        this.#error = error;
        this.#warn = warn;
        this.#info = info;
        this.#debug = debug;
        this.#trace = trace;
    }

    child(data: LogData): Logger {
        return new MockLogger({
            data: { ...this.#data, ...data },
            fatal: this.#fatal,
            error: this.#error,
            warn: this.#warn,
            info: this.#info,
            debug: this.#debug,
            trace: this.#trace,
        });
    }

    #getData(data: LogData = {}) {
        return { ...this.#data, ...data };
    }

    fatal(message: string, data?: LogData): void {
        this.#fatal(message, this.#getData(data));
    }

    error(message: string, data?: LogData): void {
        this.#error(message, this.#getData(data));
    }

    warn(message: string, data?: LogData): void {
        this.#warn(message, this.#getData(data));
    }

    info(message: string, data?: LogData): void {
        this.#info(message, this.#getData(data));
    }

    debug(message: string, data?: LogData): void {
        this.#debug(message, this.#getData(data));
    }

    trace(message: string, data?: LogData): void {
        this.#trace(message, this.#getData(data));
    }
}
