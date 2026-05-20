import assert from 'node:assert/strict';
import { beforeEach, mock, suite, test } from 'node:test';
import { GatewayDispatchEvents } from '@discordjs/core';
import { RESTEvents } from '@discordjs/rest';
import { WebSocketShardEvents } from '@discordjs/ws';
import { MockLogger } from '@internal/common';
import { MockRepositories, type Repositories } from '@internal/data';
import { BotCache } from './cache/index.ts';
import { type BotClient, createBotClient } from './client.ts';
import { BotFeatureHandler } from './features.ts';

suite('BotFeatureHandler', () => {
    const log = mock.fn();
    const logger = new MockLogger({ info: log });
    let client: BotClient;
    let db: Repositories;
    let handler: BotFeatureHandler;

    beforeEach(() => {
        log.mock.resetCalls();
        client = createBotClient();
        db = new MockRepositories();
        handler = new BotFeatureHandler({
            logger,
            client,
            cache: new BotCache({ client }),
            db,
        });
    });

    suite('enable()', () => {
        test('Registers event listeners', () => {
            handler.register({
                name: 'test',
                events: {
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
                },
            });

            handler.enable('test');

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
            handler.register({
                name: 'test',
                events: {
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
                },
            });

            handler.enable('test');
            handler.disable('test');

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
