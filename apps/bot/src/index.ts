import { Bot } from '@internal/bot';
import { prepareDb } from '@internal/data';
import { botFeatures } from '@internal/features';
import { getDatabaseUrl, getEnvLogger, getEnvToken } from './env.ts';

const logger = getEnvLogger();
const db = await prepareDb(logger.child('db'), getDatabaseUrl());
const bot = new Bot({
    logger,
    client: { token: getEnvToken() },
    db,
});

for (const feature of botFeatures) {
    bot.features.register(feature);
}

await bot.start();
