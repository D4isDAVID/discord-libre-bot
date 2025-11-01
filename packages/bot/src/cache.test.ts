import assert from 'node:assert/strict';
import { nextTick } from 'node:process';
import { beforeEach, suite, test } from 'node:test';
import { WebSocketShardEvents } from '@discordjs/ws';
import { BotCache } from './cache.ts';
import { createBotClient } from './client.ts';

suite('BotCache', () => {
    const client = createBotClient();
    let cache: BotCache;

    beforeEach(() => {
        cache = new BotCache({ client });
    });

    suite('ping', () => {
        test('Returns promise when ping is not known', async () => {
            const pingPromise = cache.ping;

            nextTick(() => {
                client.gateway.emit(
                    WebSocketShardEvents.HeartbeatComplete,
                    {
                        latency: 123,
                        ackAt: 345,
                        heartbeatAt: 567,
                    },
                    789,
                );
            });

            const ping = await pingPromise;

            assert(pingPromise instanceof Promise);
            assert.strictEqual(ping, 123);
        });

        test('Returns ping when ping is set', () => {
            cache.ping = 123;

            const ping = cache.ping;

            assert.strictEqual(ping, 123);
        });
    });
});
