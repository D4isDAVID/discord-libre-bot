import { env } from 'node:process';
import {
    ComboLogger,
    ConsoleLogger,
    formatters,
    LogLevel,
} from '@internal/logger';

const LOGGER_CONTEXT = 'bot';

export function getDatabaseUrl(): string {
    return env.DATABASE_URL ?? '';
}

export function getEnvToken(): string {
    return env.BOT_TOKEN ?? '';
}

export function getEnvLogger(): ComboLogger {
    return new ComboLogger({ loggers: [getEnvConsoleLogger()] });
}

function getEnvConsoleLogger(): ConsoleLogger {
    const levelRaw = env.LOGGER_CONSOLE_LEVEL ?? '';
    const level =
        levelRaw in LogLevel
            ? LogLevel[levelRaw as keyof typeof LogLevel]
            : LogLevel.Info;

    const formatterRaw = env.LOGGER_CONSOLE_FORMATTER ?? '';
    const formatter =
        formatterRaw in formatters
            ? formatters[formatterRaw as keyof typeof formatters]
            : formatters.prettyColored;

    return new ConsoleLogger({
        context: LOGGER_CONTEXT,
        level,
        formatter,
    });
}
