import assert from 'node:assert/strict';
import { beforeEach, mock, suite, test } from 'node:test';
import { mockDb } from '@internal/data';
import { MockLogger } from '@internal/logger';
import { BotCache } from './cache.ts';
import { createBotClient } from './client.ts';
import { BotEventHandler } from './events/handler.ts';
import { BotFeatureHandler } from './features.ts';
import { BotInteractionHandler } from './interactions/handler.ts';

suite('BotFeatureHandler', () => {
    const logger = new MockLogger();
    const db = mockDb();
    const client = createBotClient();
    const cache = new BotCache({ client });
    const events = new BotEventHandler({ logger, client, cache, db });
    const interactions = new BotInteractionHandler({
        logger,
        client,
        cache,
        db,
    });
    let handler: BotFeatureHandler;

    beforeEach(() => {
        handler = new BotFeatureHandler({ events, interactions });
    });

    suite('register()', () => {
        test('Registers events', () => {
            const register = mock.method(events, 'register');

            handler.register({});

            assert.strictEqual(register.mock.callCount(), 1);
        });

        test('Registers interaction', () => {
            const register = mock.method(interactions, 'register');

            handler.register({});

            assert.strictEqual(register.mock.callCount(), 1);
        });
    });
});
