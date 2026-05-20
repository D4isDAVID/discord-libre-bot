import assert from 'node:assert/strict';
import { once } from 'node:events';
import { nextTick } from 'node:process';
import { beforeEach, suite, test } from 'node:test';
import { WebSocketShardEvents } from '@discordjs/ws';
import { type BotClient, createBotClient } from '../client.ts';
import { BotPingCache } from './ping.ts';

suite('BotPingCache', () => {
    let client: BotClient;
    let cache: BotPingCache;

    beforeEach(() => {
        client = createBotClient();
        cache = new BotPingCache(client);
        cache.setup();
    });

    suite('get()', () => {
        test('Returns ping when already set', async () => {
            const first = once(
                client.gateway,
                WebSocketShardEvents.HeartbeatComplete,
            );

            client.gateway.emit(
                WebSocketShardEvents.HeartbeatComplete,
                {
                    latency: 123,
                    ackAt: 123,
                    heartbeatAt: 123,
                },
                0,
            );

            await first;
            const second = once(
                client.gateway,
                WebSocketShardEvents.HeartbeatComplete,
            );

            client.gateway.emit(
                WebSocketShardEvents.HeartbeatComplete,
                {
                    latency: 456,
                    ackAt: 456,
                    heartbeatAt: 456,
                },
                1,
            );

            await second;

            const firstPing = cache.get(0);
            const secondPing = cache.get(1);

            assert.strictEqual(firstPing, 123);
            assert.strictEqual(secondPing, 456);
        });

        test('Returns promise when not known yet', async () => {
            nextTick(() => {
                client.gateway.emit(
                    WebSocketShardEvents.HeartbeatComplete,
                    {
                        latency: 123,
                        ackAt: 123,
                        heartbeatAt: 123,
                    },
                    0,
                );

                client.gateway.emit(
                    WebSocketShardEvents.HeartbeatComplete,
                    {
                        latency: 456,
                        ackAt: 456,
                        heartbeatAt: 456,
                    },
                    1,
                );
            });

            const firstPing = await cache.get(0);
            const secondPing = await cache.get(1);

            assert.strictEqual(firstPing, 123);
            assert.strictEqual(secondPing, 456);
        });
    });
});
