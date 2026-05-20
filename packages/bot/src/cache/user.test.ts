import assert from 'node:assert/strict';
import { once } from 'node:events';
import { beforeEach, suite, test } from 'node:test';
import {
    GatewayDispatchEvents,
    type GatewayReadyDispatchData,
    type GatewayUserUpdateDispatchData,
    type ToEventProps,
} from '@discordjs/core';
import { type BotClient, createBotClient } from '../client.ts';
import { BotUserCache } from './user.ts';

suite('BotUserCache', () => {
    let client: BotClient;
    let cache: BotUserCache;

    beforeEach(() => {
        client = createBotClient();
        cache = new BotUserCache(client);
        cache.setup();
    });

    suite('get()', () => {
        test('Returns user after bot is ready', async () => {
            const first = once(client, GatewayDispatchEvents.Ready);
            client.emit(GatewayDispatchEvents.Ready, {
                data: {
                    user: {
                        id: '123',
                    },
                },
            } as ToEventProps<GatewayReadyDispatchData>);
            await first;

            const user = cache.get();

            assert.strictEqual(user?.id, '123');
        });

        test('Returns updated user after UserUpdate event', async () => {
            const first = once(client, GatewayDispatchEvents.Ready);
            client.emit(GatewayDispatchEvents.Ready, {
                data: {
                    user: {
                        id: '123',
                    },
                },
            } as ToEventProps<GatewayReadyDispatchData>);
            await first;

            const second = once(client, GatewayDispatchEvents.UserUpdate);
            client.emit(GatewayDispatchEvents.UserUpdate, {
                data: {
                    id: '456',
                },
            } as ToEventProps<GatewayUserUpdateDispatchData>);
            await second;

            const user = cache.get();

            assert.strictEqual(user?.id, '456');
        });

        test('Returns undefined when user is not known yet', () => {
            const user = cache.get();

            assert.strictEqual(user, undefined);
        });
    });
});
