import assert from 'node:assert/strict';
import { beforeEach, suite, test } from 'node:test';
import { PGlite } from '@electric-sql/pglite';
import { MockLogger } from '@internal/logger';
import type { PgDatabase, PgQueryResultHKT } from 'drizzle-orm/pg-core';
import { MockDrizzleRepositories } from '../mock.ts';
// biome-ignore lint/performance/noNamespaceImport: we need all the schemas
import * as schema from '../schema/index.ts';
import { DrizzleReadonlyRepository } from './readonly.ts';

type Schema = typeof schema;
type Database = PgDatabase<PgQueryResultHKT, Schema>;
type Table = typeof schema.ticketTypesTable;

suite('DrizzleReadonlyRepository', () => {
    const logger = new MockLogger();
    let db: Database;
    let repository: DrizzleReadonlyRepository<
        Schema,
        Database,
        Table['_']['config'],
        Table,
        keyof Schema,
        'id'
    >;

    beforeEach(async () => {
        const repos = new MockDrizzleRepositories({
            client: new PGlite(),
            logger,
        });

        await repos.applyMigrations();

        db = repos.db;
        repository = new DrizzleReadonlyRepository({
            db,
            table: schema.ticketTypesTable,
            query: db.query.ticketTypesTable,
            idColumn: 'id',
        });

        await db.insert(schema.ticketTypesTable).values([
            {
                guildId: '123',
                emoji: '🐛',
                name: 'Bug',
                description: 'bug',
                channelId: '123',
            },
            {
                guildId: '123',
                emoji: '⭐',
                name: 'Idea',
                description: 'idea',
                channelId: '123',
            },
        ]);
    });

    suite('getAll()', () => {
        test('Returns all objects in database', async () => {
            const response = await repository.getAll();

            assert.deepStrictEqual(response, [
                {
                    id: 1,
                    guildId: '123',
                    emoji: '🐛',
                    name: 'Bug',
                    description: 'bug',
                    channelId: '123',
                },
                {
                    id: 2,
                    guildId: '123',
                    emoji: '⭐',
                    name: 'Idea',
                    description: 'idea',
                    channelId: '123',
                },
            ]);
        });
    });

    suite('findById()', () => {
        test('Returns the object in database by the given ID', async () => {
            const response = await repository.findById(2);

            assert.deepStrictEqual(response, {
                id: 2,
                guildId: '123',
                emoji: '⭐',
                name: 'Idea',
                description: 'idea',
                channelId: '123',
            });
        });
    });
});
