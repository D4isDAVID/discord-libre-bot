import assert from 'node:assert/strict';
import { beforeEach, mock, suite, test } from 'node:test';
import { MockRepositories } from '@internal/data';
import { MockLogger } from '@internal/logger';
import { BotCache } from './cache.ts';
import { createBotClient } from './client.ts';
import { BotEventHandler } from './events/handler.ts';
import { BotFeatureHandler } from './features.ts';
import { BotInteractionHandler } from './interactions/handler.ts';

suite('BotFeatureHandler', () => {
    const logger = new MockLogger();
    const db = new MockRepositories();
    const client = createBotClient();
    const cache = new BotCache({ client });
    const events = new BotEventHandler({ logger, db, client, cache });
    const interactions = new BotInteractionHandler({
        logger,
        db,
        client,
        cache,
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
