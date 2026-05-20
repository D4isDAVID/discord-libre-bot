import assert from 'node:assert/strict';
import { once } from 'node:events';
import { beforeEach, mock, suite, test } from 'node:test';
import {
    GatewayDispatchEvents,
    GatewayIntentBits,
    type GatewayMessageCreateDispatchData,
    type ToEventProps,
} from '@discordjs/core';
import { RESTEvents } from '@discordjs/rest';
import { WebSocketShardEvents } from '@discordjs/ws';
import { MockLogger } from '@internal/common';
import { MockRepositories, type Repositories } from '@internal/data';
import { BotCache } from '../cache/index.ts';
import { type BotClient, createBotClient } from '../client.ts';
import type { BotFeatureHandler } from '../features.ts';
import { BotLogic } from '../logic/index.ts';
import type { BotIntentBasedGatewayDispatchEvent } from './event.ts';
import { BotEventHandler } from './handler.ts';
import { CombinedIntentBits } from './intent-data.ts';

suite('BotEventHandler', () => {
    const log = mock.fn();
    const logger = new MockLogger({ info: log });
    let client: BotClient;
    let cache: BotCache;
    let db: Repositories;
    let handler: BotEventHandler;

    beforeEach(() => {
        log.mock.resetCalls();
        client = createBotClient();
        cache = new BotCache({ client });
        db = new MockRepositories();
        handler = new BotEventHandler({
            logger,
            client,
            cache,
            db,
            features: {} as BotFeatureHandler,
            logic: new BotLogic({
                logger,
                db,
                features: {} as BotFeatureHandler,
            }),
        });
    });

    suite('bind()', () => {
        test('Binds event listeners', () => {
            const bound = handler.bind({
                rest: [
                    {
                        name: RESTEvents.Response,
                        handler() {
                            this.logger.info('test');
                        },
                    },
                ],
                ws: [
                    {
                        name: WebSocketShardEvents.Ready,
                        handler() {
                            this.logger.info('test');
                        },
                    },
                ],
                gatewayDispatch: [
                    {
                        name: GatewayDispatchEvents.Ready,
                        handler() {
                            this.logger.info('test');
                        },
                    },
                ],
            });

            bound.rest[0]?.listener();
            bound.ws[0]?.listener();
            bound.gatewayDispatch[0]?.listener();

            assert.strictEqual(log.mock.callCount(), 3);
        });

        test('Calculates intents', () => {
            handler.bind({
                gatewayDispatch: [
                    {
                        name: GatewayDispatchEvents.MessageCreate,
                        intents: CombinedIntentBits.GuildMessageContent,
                        handler() {
                            return;
                        },
                    } as BotIntentBasedGatewayDispatchEvent<
                        GatewayDispatchEvents.MessageCreate,
                        CombinedIntentBits.GuildMessageContent
                    >,
                    {
                        name: GatewayDispatchEvents.GuildCreate,
                        handler() {
                            return;
                        },
                    },
                ],
            });

            assert.strictEqual(
                handler.intents,
                CombinedIntentBits.GuildMessageContent
                    | GatewayIntentBits.Guilds,
            );
        });

        test('Applies intent-based predicates', async () => {
            const bound = handler.bind({
                gatewayDispatch: [
                    {
                        name: GatewayDispatchEvents.MessageCreate,
                        intents: CombinedIntentBits.GuildMessageContent,
                        handler() {
                            this.logger.info('test');
                        },
                    } as BotIntentBasedGatewayDispatchEvent<
                        GatewayDispatchEvents.MessageCreate,
                        CombinedIntentBits.GuildMessageContent
                    >,
                ],
            });

            handler.enable(bound);

            const first = once(client, GatewayDispatchEvents.MessageCreate);

            client.emit(GatewayDispatchEvents.MessageCreate, {
                data: { guild_id: '123' },
            } as ToEventProps<GatewayMessageCreateDispatchData>);

            await first;
            const second = once(client, GatewayDispatchEvents.MessageCreate);

            client.emit(GatewayDispatchEvents.MessageCreate, {
                data: {},
            } as ToEventProps<GatewayMessageCreateDispatchData>);

            await second;
            assert.strictEqual(log.mock.callCount(), 1);
        });
    });

    suite('enable()', () => {
        test('Registers event listeners', () => {
            const bound = handler.bind({
                rest: [
                    {
                        name: RESTEvents.Response,
                        handler() {
                            this.logger.info('test');
                        },
                    },
                ],
                ws: [
                    {
                        name: WebSocketShardEvents.Ready,
                        handler() {
                            this.logger.info('test');
                        },
                    },
                ],
                gatewayDispatch: [
                    {
                        name: GatewayDispatchEvents.Ready,
                        handler() {
                            this.logger.info('test');
                        },
                    },
                ],
            });

            handler.enable(bound);

            assert.strictEqual(
                client.rest.listenerCount(RESTEvents.Response),
                1,
            );
            assert.strictEqual(
                client.gateway.listenerCount(WebSocketShardEvents.Ready),
                1,
            );
            assert.strictEqual(
                client.listenerCount(GatewayDispatchEvents.Ready),
                1,
            );
        });
    });

    suite('disable()', () => {
        test('Unregisters event listeners', () => {
            const bound = handler.bind({
                rest: [
                    {
                        name: RESTEvents.Response,
                        handler() {
                            this.logger.info('test');
                        },
                    },
                ],
                ws: [
                    {
                        name: WebSocketShardEvents.Ready,
                        handler() {
                            this.logger.info('test');
                        },
                    },
                ],
                gatewayDispatch: [
                    {
                        name: GatewayDispatchEvents.Ready,
                        handler() {
                            this.logger.info('test');
                        },
                    },
                ],
            });

            handler.enable(bound);
            handler.disable(bound);

            assert.strictEqual(
                client.rest.listenerCount(RESTEvents.Response),
                0,
            );
            assert.strictEqual(
                client.gateway.listenerCount(WebSocketShardEvents.Ready),
                0,
            );
            assert.strictEqual(
                client.listenerCount(GatewayDispatchEvents.Ready),
                0,
            );
        });
    });
});
