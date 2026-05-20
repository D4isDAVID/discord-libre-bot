import assert from 'node:assert/strict';
import { once } from 'node:events';
import { beforeEach, type Mock, mock, suite, test } from 'node:test';
import {
    ButtonStyle,
    ComponentType,
    GatewayDispatchEvents,
    type GatewayInteractionCreateDispatchData,
    InteractionType,
    type ToEventProps,
} from '@discordjs/core';
import { MockLogger } from '@internal/common';
import { MockRepositories, type Repositories } from '@internal/data';
import { BotCache } from '../cache/index.ts';
import { type BotClient, createBotClient } from '../client.ts';
import type { BotEventContainer } from '../events/event.ts';
import type { BotFeatureHandler } from '../features.ts';
import { BotLogic } from '../logic/index.ts';
import { BotInteractionHandler } from './handler.ts';
import { stringSerializer } from './stateful/serializers.ts';
import { createStatefulInteraction } from './stateful/stateful.ts';

suite('BotInteractionHandler', () => {
    const log = mock.fn();
    const logger = new MockLogger({ info: log });
    let client: BotClient;
    let cache: BotCache;
    let db: Repositories;
    let handler: BotInteractionHandler;
    let interactionsReply: Mock<typeof client.api.interactions.reply>;

    beforeEach(() => {
        log.mock.resetCalls();
        client = createBotClient();
        interactionsReply = mock.method(
            client.api.interactions,
            'reply',
            (async () =>
                undefined) as unknown as typeof client.api.interactions.reply,
        );
        cache = new BotCache({ client });
        db = new MockRepositories();
        handler = new BotInteractionHandler({
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

    suite('setup()', () => {
        test('Registers InteractionCreate listener', () => {
            handler.setup();

            assert.strictEqual(
                client.listenerCount(GatewayDispatchEvents.InteractionCreate),
                1,
            );
        });
    });

    suite('deployCommands()', () => {
        let bulkOverwrite: Mock<
            typeof client.api.applicationCommands.bulkOverwriteGlobalCommands
        >;

        beforeEach(() => {
            mock.method(client.api.applications, 'getCurrent', async () => ({
                id: '123',
            }));
            mock.method(
                client.api.applicationCommands,
                'getGlobalCommands',
                async () => [],
            );
            bulkOverwrite = mock.method(
                client.api.applicationCommands,
                'bulkOverwriteGlobalCommands',
                async () => [],
            );
        });

        test('Deploys commands when changed', async () => {
            handler.bind({
                commands: [
                    {
                        data: {
                            name: 'testcmd',
                            description: 'test',
                        },
                        handler(this: BotEventContainer) {
                            this.logger.info('test');
                        },
                    },
                ],
            });

            await handler.deployCommands();

            assert.strictEqual(bulkOverwrite.mock.callCount(), 1);
        });

        test('Does not deploy commands when unchanged', async () => {
            await handler.deployCommands();

            assert.strictEqual(bulkOverwrite.mock.callCount(), 0);
        });
    });

    suite('bind()', () => {
        test('Binds interaction handlers', async () => {
            const bound = handler.bind({
                commands: [
                    {
                        data: {
                            name: 'testcmd',
                            description: 'test',
                        },
                        handler(this: BotEventContainer) {
                            this.logger.info('test');
                        },
                    },
                ],
                messageComponents: [
                    {
                        data: {
                            custom_id: 'testcomp',
                            type: ComponentType.Button,
                            style: ButtonStyle.Primary,
                        },
                        handler(this: BotEventContainer) {
                            this.logger.info('test');
                        },
                    },
                ],
                modals: [
                    {
                        data: {
                            custom_id: 'testmod',
                            title: 'test',
                            components: [],
                        },
                        handler(this: BotEventContainer) {
                            this.logger.info('test');
                        },
                    },
                ],
            });

            handler.enable(bound);
            handler.setup();

            const first = once(client, GatewayDispatchEvents.InteractionCreate);
            client.emit(GatewayDispatchEvents.InteractionCreate, {
                data: {
                    type: InteractionType.ApplicationCommand,
                    data: {
                        name: 'testcmd',
                    },
                },
            } as ToEventProps<GatewayInteractionCreateDispatchData>);
            await first;

            const second = once(
                client,
                GatewayDispatchEvents.InteractionCreate,
            );
            client.emit(GatewayDispatchEvents.InteractionCreate, {
                data: {
                    type: InteractionType.MessageComponent,
                    data: {
                        custom_id: 'testcomp',
                    },
                },
            } as ToEventProps<GatewayInteractionCreateDispatchData>);
            await second;

            const third = once(client, GatewayDispatchEvents.InteractionCreate);
            client.emit(GatewayDispatchEvents.InteractionCreate, {
                data: {
                    type: InteractionType.ModalSubmit,
                    data: {
                        custom_id: 'testmod',
                    },
                },
            } as ToEventProps<GatewayInteractionCreateDispatchData>);
            await third;

            assert.strictEqual(log.mock.callCount(), 3);
        });

        test('Handles stateful interactions', async () => {
            const bound = handler.bind({
                messageComponents: [
                    createStatefulInteraction(stringSerializer, {
                        data: {
                            custom_id: 'testcomp',
                            type: ComponentType.Button,
                            style: ButtonStyle.Primary,
                        },
                        handler(this: BotEventContainer) {
                            this.logger.info('test');
                        },
                    }),
                ],
                modals: [
                    createStatefulInteraction(stringSerializer, {
                        data: {
                            custom_id: 'testmod',
                            title: 'test',
                            components: [],
                        },
                        handler(this: BotEventContainer) {
                            this.logger.info('test');
                        },
                    }),
                ],
            });

            handler.enable(bound);
            handler.setup();

            const first = once(client, GatewayDispatchEvents.InteractionCreate);
            client.emit(GatewayDispatchEvents.InteractionCreate, {
                data: {
                    type: InteractionType.MessageComponent,
                    data: {
                        custom_id: 'testcomp123',
                    },
                },
            } as ToEventProps<GatewayInteractionCreateDispatchData>);
            await first;

            const second = once(
                client,
                GatewayDispatchEvents.InteractionCreate,
            );
            client.emit(GatewayDispatchEvents.InteractionCreate, {
                data: {
                    type: InteractionType.ModalSubmit,
                    data: {
                        custom_id: 'testmod123',
                    },
                },
            } as ToEventProps<GatewayInteractionCreateDispatchData>);
            await second;

            assert.strictEqual(log.mock.callCount(), 2);
        });
    });

    suite('enable()', () => {
        test('Enables specific interactions', async () => {
            const bound = handler.bind({
                commands: [
                    {
                        data: {
                            name: 'testcmd',
                            description: 'test',
                        },
                        handler(this: BotEventContainer) {
                            this.logger.info('test');
                        },
                    },
                ],
            });

            handler.bind({
                messageComponents: [
                    {
                        data: {
                            custom_id: 'testcomp',
                            type: ComponentType.Button,
                            style: ButtonStyle.Primary,
                        },
                        handler(this: BotEventContainer) {
                            this.logger.info('test');
                        },
                    },
                ],
            });

            handler.enable(bound);
            handler.setup();

            const first = once(client, GatewayDispatchEvents.InteractionCreate);
            client.emit(GatewayDispatchEvents.InteractionCreate, {
                data: {
                    type: InteractionType.ApplicationCommand,
                    data: {
                        name: 'testcmd',
                    },
                },
            } as ToEventProps<GatewayInteractionCreateDispatchData>);
            await first;

            const second = once(
                client,
                GatewayDispatchEvents.InteractionCreate,
            );
            client.emit(GatewayDispatchEvents.InteractionCreate, {
                data: {
                    type: InteractionType.MessageComponent,
                    data: {
                        custom_id: 'testcomp',
                    },
                },
            } as ToEventProps<GatewayInteractionCreateDispatchData>);
            await second;

            assert.strictEqual(log.mock.callCount(), 1);
            assert.strictEqual(interactionsReply.mock.callCount(), 1);
        });
    });

    suite('disable()', () => {
        test('Disables specific interactions', async () => {
            const bound = handler.bind({
                commands: [
                    {
                        data: {
                            name: 'testcmd',
                            description: 'test',
                        },
                        handler(this: BotEventContainer) {
                            this.logger.info('test');
                        },
                    },
                ],
            });

            const other = handler.bind({
                messageComponents: [
                    {
                        data: {
                            custom_id: 'testcomp',
                            type: ComponentType.Button,
                            style: ButtonStyle.Primary,
                        },
                        handler(this: BotEventContainer) {
                            this.logger.info('test');
                        },
                    },
                ],
            });

            handler.enable(bound);
            handler.enable(other);
            handler.disable(bound);
            handler.setup();

            const first = once(client, GatewayDispatchEvents.InteractionCreate);
            client.emit(GatewayDispatchEvents.InteractionCreate, {
                data: {
                    type: InteractionType.ApplicationCommand,
                    data: {
                        name: 'testcmd',
                    },
                },
            } as ToEventProps<GatewayInteractionCreateDispatchData>);
            await first;

            const second = once(
                client,
                GatewayDispatchEvents.InteractionCreate,
            );
            client.emit(GatewayDispatchEvents.InteractionCreate, {
                data: {
                    type: InteractionType.MessageComponent,
                    data: {
                        custom_id: 'testcomp',
                    },
                },
            } as ToEventProps<GatewayInteractionCreateDispatchData>);
            await second;

            assert.strictEqual(log.mock.callCount(), 1);
            assert.strictEqual(interactionsReply.mock.callCount(), 1);
        });
    });
});
