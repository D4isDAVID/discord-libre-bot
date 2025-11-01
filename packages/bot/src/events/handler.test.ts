import assert from 'node:assert/strict';
import { beforeEach, suite, test } from 'node:test';
import { GatewayDispatchEvents, GatewayIntentBits } from '@discordjs/core';
import { RESTEvents } from '@discordjs/rest';
import { WebSocketShardEvents } from '@discordjs/ws';
import { mockDb } from '@internal/data';
import { MockLogger } from '@internal/logger';
import { BotCache } from '../cache.ts';
import { type BotClient, createBotClient } from '../client.ts';
import { BotEventHandler } from './handler.ts';
import { CombinedIntents } from './intent-based/types.ts';

suite('BotEventHandler', () => {
    const logger = new MockLogger();
    const db = mockDb();
    let client: BotClient;
    let cache: BotCache;
    let handler: BotEventHandler;

    beforeEach(() => {
        client = createBotClient();
        cache = new BotCache({ client });
        handler = new BotEventHandler({ logger, client, cache, db });
    });

    suite('register()', () => {
        test('Registers REST event listener', () => {
            handler.register({
                rest: [
                    {
                        name: RESTEvents.RateLimited,
                        handler() {
                            return;
                        },
                    },
                ],
            });

            const listeners = client.rest.listeners(RESTEvents.RateLimited);
            assert.equal(listeners.length, 1);
        });

        test('Registers WebSocket event listener', () => {
            handler.register({
                ws: [
                    {
                        name: WebSocketShardEvents.Hello,
                        handler() {
                            return;
                        },
                    },
                ],
            });

            const listeners = client.gateway.listeners(
                WebSocketShardEvents.Hello,
            );
            assert.equal(listeners.length, 1);
        });

        test('Registers Client event listener', () => {
            handler.register({
                gatewayDispatch: [
                    {
                        name: GatewayDispatchEvents.Ready,
                        handler() {
                            return;
                        },
                    },
                ],
            });

            const listeners = client.listeners(GatewayDispatchEvents.Ready);
            assert.equal(listeners.length, 1);
        });

        test('Calculates intents', () => {
            handler.register({
                gatewayDispatch: [
                    {
                        name: GatewayDispatchEvents.GuildCreate,
                        handler() {
                            return;
                        },
                    },
                    {
                        name: GatewayDispatchEvents.MessageCreate,
                        intents: CombinedIntents.MessageContent,
                        handler() {
                            return;
                        },
                    },
                ],
            });

            assert.equal(
                handler.intents,
                GatewayIntentBits.Guilds |
                    GatewayIntentBits.GuildMessages |
                    GatewayIntentBits.DirectMessages |
                    GatewayIntentBits.MessageContent,
            );
        });
    });
});
