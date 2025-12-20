import assert from 'node:assert/strict';
import { beforeEach, mock, suite, test } from 'node:test';
import { MockRepositories } from '@internal/data';
import { MockLogger } from '@internal/logger';
import { Bot } from './bot.ts';

suite('Bot', () => {
    const logger = new MockLogger();
    const db = new MockRepositories();
    let bot: Bot;

    beforeEach(() => {
        bot = new Bot({ logger, client: {}, db });
    });

    suite('start()', () => {
        test('Registers interaction handler and connect Discord', async () => {
            const register = mock.method(
                bot.features.interactions,
                'registerInteractionCreateListener',
            );
            const deploy = mock.method(
                bot.features.interactions,
                'deployCommands',
                () => new Promise<void>((resolve) => resolve()),
            );
            const connect = mock.method(
                bot.client.gateway,
                'connect',
                () => new Promise<void>((resolve) => resolve()),
            );

            await bot.start();

            assert.strictEqual(register.mock.callCount(), 1);
            assert.strictEqual(deploy.mock.callCount(), 1);
            assert.strictEqual(connect.mock.callCount(), 1);
        });
    });
});
