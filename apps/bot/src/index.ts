import { Bot } from '@internal/bot';
import { DrizzleRepositories } from '@internal/data';
import { botFeatures } from '@internal/features';
import { getDatabaseUrl, getEnvLogger, getEnvToken } from './env.ts';

const logger = getEnvLogger();
const db = new DrizzleRepositories({
    connection: getDatabaseUrl(),
    logger: logger.child('db'),
});
const bot = new Bot({
    logger,
    client: { token: getEnvToken() },
    db,
});

for (const feature of botFeatures) {
    bot.features.register(feature);
}

await db.applyMigrations();
await bot.start();
