import { stat } from 'node:fs/promises';
import { join } from 'node:path';
import { cwd } from 'node:process';
import type { Logger } from '@internal/logger';
import type { DrizzleConfig } from 'drizzle-orm';
import type { MigrationConfig } from 'drizzle-orm/migrator';
import type { PgDatabase, PgQueryResultHKT } from 'drizzle-orm/pg-core';
import type { Repositories } from '../repositories/index.ts';
import type { TicketTypesRepository } from '../repositories/tickets.ts';
import { DrizzleReadWriteRepository } from './base/readwrite.ts';
// biome-ignore lint/performance/noNamespaceImport: we need all the schemas
import * as schema from './schema/index.ts';

type Schema = typeof schema;
type Database = PgDatabase<PgQueryResultHKT, Schema>;

export interface BaseDrizzleRepositoriesOptions {
    drizzle(config: DrizzleConfig<Schema>): Database;
    migrate(db: Database, config: MigrationConfig): Promise<void>;
    logger: Logger;
}

export class BaseDrizzleRepositories implements Repositories {
    static async #getMigrationsDir() {
        const path = join(cwd(), 'drizzle');

        return await stat(path)
            .then(() => path)
            .catch(() => join(import.meta.dirname, '..', '..', 'drizzle'));
    }

    readonly #logger: Logger;
    readonly db: Database;
    readonly #migrate: BaseDrizzleRepositoriesOptions['migrate'];

    readonly ticketTypes: TicketTypesRepository;

    constructor({ drizzle, migrate, logger }: BaseDrizzleRepositoriesOptions) {
        this.#logger = logger;
        this.db = drizzle({
            schema,
            logger: {
                logQuery(query, params) {
                    logger.trace('running query', {
                        query,
                        params,
                    });
                },
            },
        });
        this.#migrate = migrate;

        this.ticketTypes = new DrizzleReadWriteRepository({
            db: this.db,
            table: schema.ticketTypesTable,
            query: this.db.query.ticketTypesTable,
            idColumn: 'id',
        });
    }

    async applyMigrations(): Promise<void> {
        this.#logger.info('applying migrations...');

        await this.#migrate(this.db, {
            migrationsFolder: await BaseDrizzleRepositories.#getMigrationsDir(),
        });
    }
}
