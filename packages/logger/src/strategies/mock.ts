import { type LogData, Logger, type LogLevel } from '../base.ts';

export class MockLogger extends Logger {
    #log: ((level: LogLevel) => void) | null = null;

    constructor(log: ((log: LogLevel) => void) | null = null) {
        super();

        this.#log = log;
    }

    override child(_context: string): MockLogger {
        return new MockLogger(this.#log);
    }

    override log(level: LogLevel, _message: string, _data?: LogData): void {
        this.#log?.(level);
    }
}
