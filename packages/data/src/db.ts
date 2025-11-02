import { stat } from 'node:fs/promises';
import { join } from 'node:path';
import { cwd } from 'node:process';
import type { Logger } from '@internal/logger';
import { drizzle, type NodePgDatabase } from 'drizzle-orm/node-postgres';
import { migrate } from 'drizzle-orm/node-postgres/migrator';

export type Database = NodePgDatabase;

export async function prepareDb(
    logger: Logger,
    url: string,
): Promise<Database> {
    logger.info('preparing database...');
    const db = drizzle(url, {
        logger: {
            logQuery(query, params) {
                logger.trace('running query', {
                    query,
                    params,
                });
            },
        },
    });

    logger.info('applying migrations...');
    await migrate(db, {
        migrationsFolder: await getMigrationsDir(),
    });

    return db;
}

export function mockDb(): Database {
    return drizzle.mock();
}

async function getMigrationsDir() {
    const path = join(cwd(), 'drizzle');

    return await stat(path)
        .then(() => path)
        .catch(() => join(import.meta.dirname, '..', 'drizzle'));
}
