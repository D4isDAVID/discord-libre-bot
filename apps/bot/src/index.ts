import { Bot } from '@internal/bot';
import { PinoLogger } from '@internal/common';
import { DrizzleRepositories } from '@internal/data';
import pino from 'pino';
import { coreFeature } from './core/index.ts';
import { getEnvBotToken, getEnvDbConnection, getEnvLogLevel } from './env.ts';

const features = [coreFeature];

const logger = new PinoLogger(pino({ level: getEnvLogLevel() }));
const db = new DrizzleRepositories({
    logger,
    connection: getEnvDbConnection(),
});
const bot = new Bot({
    logger,
    db,
    client: {
        rest: { version: '10' },
        token: getEnvBotToken(),
    },
});

for (const feature of features) {
    bot.features.register(feature);
}

if (await db.applyMigrations()) {
    bot.features.enable(coreFeature.name);

    const globalConfig = (await db.config.findByGuildId(null, { limit: 1 }))[0];
    for (const featureName of globalConfig?.features ?? []) {
        bot.features.enable(featureName);
    }

    await bot.start();
}
