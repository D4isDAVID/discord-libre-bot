import { stat } from 'node:fs/promises';
import { join } from 'node:path';
import type { Logger } from '@internal/common';
import type { DrizzleConfig } from 'drizzle-orm';
import type { MigrationConfig } from 'drizzle-orm/migrator';
import type { PgDatabase, PgQueryResultHKT } from 'drizzle-orm/pg-core';
import type { Repositories } from '../../interfaces/index.ts';
// biome-ignore lint/performance/noNamespaceImport: we need the full schema
import * as schema from '../schema/index.ts';
import { DrizzleConfigRepository } from './config.ts';
import { DrizzleStatusRepository } from './status.ts';

type Database = PgDatabase<PgQueryResultHKT, typeof schema>;

export interface BaseDrizzleRepositoriesOptions {
    logger: Logger;
    drizzle(config: DrizzleConfig<typeof schema>): Database;
    migrate(db: Database, config: MigrationConfig): Promise<void>;
}

async function getMigrationsPath() {
    const path = join(import.meta.dirname, 'drizzle');

    return await stat(path)
        .then(() => path)
        .catch(() => join(import.meta.dirname, '..', '..', '..', 'drizzle'));
}

export class BaseDrizzleRepositories implements Repositories {
    readonly #logger: Logger;
    readonly db: Database;
    readonly #migrate: BaseDrizzleRepositoriesOptions['migrate'];

    readonly config: DrizzleConfigRepository;
    readonly status: DrizzleStatusRepository;

    constructor({ logger, drizzle, migrate }: BaseDrizzleRepositoriesOptions) {
        this.#logger = logger;
        this.db = drizzle({
            schema,
            logger: {
                logQuery(query, params) {
                    logger.trace('running query', { query, params });
                },
            },
        });
        this.#migrate = migrate;

        this.config = new DrizzleConfigRepository({
            db: this.db,
            query: this.db.query.configTable,
        });
        this.status = new DrizzleStatusRepository({
            db: this.db,
            query: this.db.query.statusTable,
        });
    }

    async applyMigrations(): Promise<boolean> {
        this.#logger.info('applying migrations...');

        return await this.#migrate(this.db, {
            migrationsFolder: await getMigrationsPath(),
        })
            .then(() => {
                this.#logger.info('successfully applied migrations');

                return true;
            })
            .catch(() => {
                this.#logger.fatal('failed to apply migrations');

                return false;
            });
    }
}
