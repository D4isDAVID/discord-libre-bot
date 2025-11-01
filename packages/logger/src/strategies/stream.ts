import type { Writable } from 'node:stream';
import { type LogData, Logger, type LogLevel } from '../base.ts';

export interface LogPayload {
    timestamp: Date;
    level: LogLevel;
    context: string;
    message: string;
    data: LogData | undefined;
}

export type LogFormatter = (log: LogPayload) => string;

export interface StreamLoggerOptions {
    context: string;
    streams: Partial<Record<LogLevel, Writable>>;
    formatter: LogFormatter;
}

export class StreamLogger extends Logger {
    #context: string;
    #streams: Partial<Record<LogLevel, Writable>>;
    #formatter: LogFormatter;

    constructor(options: StreamLoggerOptions) {
        super();

        this.#context = options.context;
        this.#streams = options.streams;
        this.#formatter = options.formatter;
    }

    override child(context: string): StreamLogger {
        return new StreamLogger({
            context: `${this.#context}/${context}`,
            streams: this.#streams,
            formatter: this.#formatter,
        });
    }

    override log(level: LogLevel, message: string, data?: LogData): void {
        const stream = this.#streams[level];
        const log = this.#formatter({
            timestamp: new Date(),
            level,
            context: this.#context,
            message,
            data,
        });

        stream?.write(log);
    }
}
