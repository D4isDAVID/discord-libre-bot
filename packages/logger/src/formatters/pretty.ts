import { LogLevel } from '../base.ts';
import type { LogPayload } from '../strategies/stream.ts';

const logLevelToString: Record<LogLevel, string> = {
    [LogLevel.Trace]: 'trace',
    [LogLevel.Debug]: 'debug',
    [LogLevel.Info]: 'info',
    [LogLevel.Warn]: 'warn',
    [LogLevel.Error]: 'error',
    [LogLevel.Fatal]: 'fatal',
};

export function prettyFormatter({
    timestamp,
    level,
    context,
    message,
    data,
}: LogPayload): string {
    const dataString =
        typeof data === 'undefined' ? '' : ` ${JSON.stringify(data)}`;
    return `${timestamp.toISOString()} [${context}] ${logLevelToString[level]}: ${message}${dataString}\n`;
}
