import { stderr, stdout } from 'node:process';
import { LogLevel } from '../base.ts';
import { StreamLogger, type StreamLoggerOptions } from './stream.ts';

export type ConsoleLoggerOptions = Omit<StreamLoggerOptions, 'streams'> & {
    level: LogLevel;
};

const logLevelToNumber: Record<LogLevel, number> = {
    [LogLevel.Debug]: 0,
    [LogLevel.Trace]: 1,
    [LogLevel.Info]: 2,
    [LogLevel.Warn]: 3,
    [LogLevel.Error]: 4,
    [LogLevel.Fatal]: 5,
};
const warnLevelNumber = logLevelToNumber[LogLevel.Warn];

export class ConsoleLogger extends StreamLogger {
    constructor(options: ConsoleLoggerOptions) {
        const levelNumber = logLevelToNumber[options.level];
        const streams = Object.fromEntries(
            Object.entries(logLevelToNumber)
                .filter(([_level, number]) => number >= levelNumber)
                .map(([level, number]) => [
                    level,
                    number >= warnLevelNumber ? stderr : stdout,
                ]),
        );

        super({
            ...options,
            streams,
        });
    }
}
