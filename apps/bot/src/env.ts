import { env } from 'node:process';

export function getEnvLogLevel() {
    return env.LOG_LEVEL || 'info';
}

export function getEnvDbConnection() {
    return env.DB_CONNECTION || '';
}

export function getEnvBotToken() {
    return env.BOT_TOKEN || '';
}
