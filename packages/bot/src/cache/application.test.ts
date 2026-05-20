import assert from 'node:assert/strict';
import { beforeEach, type Mock, mock, suite, test } from 'node:test';
import type { APIApplication, ApplicationsAPI } from '@discordjs/core';
import { type BotClient, createBotClient } from '../client.ts';
import { BotApplicationCache } from './application.ts';

suite('BotApplicationCache', () => {
    let client: BotClient;
    let cache: BotApplicationCache;
    let getCurrent: Mock<ApplicationsAPI['getCurrent']>;

    beforeEach(() => {
        client = createBotClient();
        cache = new BotApplicationCache(client);
        getCurrent = mock.method(
            client.api.applications,
            'getCurrent',
            async () => ({ id: '123' }) as APIApplication,
        );
    });

    suite('update()', () => {
        test('Fetches application', async () => {
            await cache.update();

            assert.strictEqual(getCurrent.mock.callCount(), 1);
        });
    });

    suite('get()', () => {
        test('Returns application when already set', async () => {
            await cache.update();

            const application = cache.get();

            assert.strict(!(application instanceof Promise));
            assert.strictEqual(application.id, '123');
        });

        test('Returns promise when not known yet', async () => {
            const application = cache.get();

            assert.strict(application instanceof Promise);
            assert.strictEqual((await application).id, '123');
        });
    });
});
