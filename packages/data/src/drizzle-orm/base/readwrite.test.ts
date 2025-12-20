import assert from 'node:assert/strict';
import { beforeEach, suite, test } from 'node:test';
import { PGlite } from '@electric-sql/pglite';
import { MockLogger } from '@internal/logger';
import type { PgDatabase, PgQueryResultHKT } from 'drizzle-orm/pg-core';
import { MockDrizzleRepositories } from '../mock.ts';
// biome-ignore lint/performance/noNamespaceImport: we need all the schemas
import * as schema from '../schema/index.ts';
import { DrizzleReadWriteRepository } from './readwrite.ts';

type Schema = typeof schema;
type Database = PgDatabase<PgQueryResultHKT, Schema>;
type Table = typeof schema.ticketTypesTable;

suite('DrizzleReadonlyRepository', () => {
    const logger = new MockLogger();
    let db: Database;
    let repository: DrizzleReadWriteRepository<
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
        repository = new DrizzleReadWriteRepository({
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

    suite('create()', () => {
        test('Creates the given object in database', async () => {
            const response = await repository.create({
                guildId: '123',
                emoji: '🚨',
                name: 'New',
                description: 'new',
                channelId: '123',
            });

            const findResponse = await repository.findById(3);

            assert.deepStrictEqual(response, findResponse);
            assert.deepStrictEqual(response, {
                id: 3,
                guildId: '123',
                emoji: '🚨',
                name: 'New',
                description: 'new',
                channelId: '123',
            });
        });
    });

    suite('update()', () => {
        test('Updates the given object in database by the given ID', async () => {
            const response = await repository.update(1, {
                description: 'updated',
            });

            const findUpdatedResponse = await repository.findById(1);

            assert.deepStrictEqual(response, findUpdatedResponse);
            assert.strictEqual(findUpdatedResponse?.description, 'updated');
        });
    });

    suite('delete()', () => {
        test('Deletes an object from database by the given ID', async () => {
            const findResponse = await repository.findById(1);

            const response = await repository.delete(1);

            const findDeletedResponse = await repository.findById(1);

            assert.deepStrictEqual(response, findResponse);
            assert.strictEqual(findDeletedResponse, undefined);
        });
    });
});
