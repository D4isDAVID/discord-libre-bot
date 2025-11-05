import assert from 'node:assert/strict';
import { beforeEach, mock, suite, test } from 'node:test';
import {
    type APIApplicationCommandAutocompleteInteraction,
    type APIApplicationCommandInteraction,
    type APIChatInputApplicationCommandInteraction,
    type APIMessageComponentButtonInteraction,
    type APIMessageComponentInteraction,
    type APIModalSubmitInteraction,
    ApplicationCommandType,
    ComponentType,
    GatewayDispatchEvents,
    InteractionType,
    type ToEventProps,
} from '@discordjs/core';
import { mockDb } from '@internal/data';
import { LogLevel, MockLogger } from '@internal/logger';
import { BotCache } from '../cache.ts';
import { type BotClient, createBotClient } from '../client.ts';
import type { InteractionData } from './data/index.ts';
import { createStatefulInteraction } from './extensions/stateful.ts';
import { BotInteractionHandler } from './handler.ts';
import type { BotInteraction } from './interaction.ts';
import { stringSerializer } from './utils/statefuls.ts';

suite('BotInteractionHandler', () => {
    const logFn = mock.fn();
    const logger = new MockLogger(logFn);
    const db = mockDb();
    let client: BotClient;
    let cache: BotCache;
    let handler: BotInteractionHandler;

    beforeEach(() => {
        logFn.mock.resetCalls();
        client = createBotClient();
        cache = new BotCache({ client });
        handler = new BotInteractionHandler({ logger, client, cache, db });
    });

    suite('registerInteractionCreateListener()', () => {
        test('Registers listener for interaction create', () => {
            handler.registerInteractionCreateListener();

            const listeners = client.listeners(
                GatewayDispatchEvents.InteractionCreate,
            );
            assert.strictEqual(listeners.length, 1);
        });
    });

    suite('register()', () => {
        const func = mock.fn();

        beforeEach(() => {
            func.mock.resetCalls();
            handler.registerInteractionCreateListener();
        });

        test('Handles chat input commands', () => {
            handler.register({
                commands: [
                    {
                        data: {
                            name: 'test',
                        } as InteractionData<APIChatInputApplicationCommandInteraction>,
                        handler: func,
                    },
                ],
            });

            client.emit(GatewayDispatchEvents.InteractionCreate, {
                data: {
                    type: InteractionType.ApplicationCommand,
                    data: {
                        type: ApplicationCommandType.ChatInput,
                        name: 'test',
                    },
                },
            } as ToEventProps<APIApplicationCommandInteraction>);

            assert.strictEqual(func.mock.callCount(), 1);
        });

        test('Handles message components', () => {
            handler.register({
                messageComponents: [
                    {
                        data: {
                            type: ComponentType.Button,
                            custom_id: 'test',
                        } as InteractionData<APIMessageComponentButtonInteraction>,
                        handler: func,
                    },
                ],
            });

            client.emit(GatewayDispatchEvents.InteractionCreate, {
                data: {
                    type: InteractionType.MessageComponent,
                    data: {
                        component_type: ComponentType.Button,
                        custom_id: 'test',
                    },
                },
            } as ToEventProps<APIMessageComponentInteraction>);

            assert.strictEqual(func.mock.callCount(), 1);
        });

        test('Handles chat input autocomplete', () => {
            handler.register({
                commands: [
                    {
                        data: {
                            name: 'test',
                            description: 'test',
                        },
                        handler() {
                            return;
                        },
                        autocomplete: func,
                    } as BotInteraction<APIChatInputApplicationCommandInteraction>,
                ],
            });

            client.emit(GatewayDispatchEvents.InteractionCreate, {
                data: {
                    type: InteractionType.ApplicationCommandAutocomplete,
                    data: {
                        type: ApplicationCommandType.ChatInput,
                        name: 'test',
                    },
                },
            } as ToEventProps<APIApplicationCommandAutocompleteInteraction>);

            assert.strictEqual(func.mock.callCount(), 1);
        });

        test('Handles modal submissions', () => {
            handler.register({
                modals: [
                    {
                        data: {
                            custom_id: 'test',
                        } as InteractionData<APIModalSubmitInteraction>,
                        handler: func,
                    },
                ],
            });

            client.emit(GatewayDispatchEvents.InteractionCreate, {
                data: {
                    type: InteractionType.ModalSubmit,
                    data: {
                        custom_id: 'test',
                    },
                },
            } as ToEventProps<APIModalSubmitInteraction>);

            assert.strictEqual(func.mock.callCount(), 1);
        });

        test('Handles stateful message components', () => {
            handler.register({
                messageComponents: [
                    createStatefulInteraction(stringSerializer, {
                        data: {
                            type: ComponentType.Button,
                            custom_id: 'test',
                        } as InteractionData<APIMessageComponentButtonInteraction>,
                        handler: func,
                    }),
                ],
            });

            client.emit(GatewayDispatchEvents.InteractionCreate, {
                data: {
                    type: InteractionType.MessageComponent,
                    data: {
                        component_type: ComponentType.Button,
                        custom_id: 'test123',
                    },
                },
            } as ToEventProps<APIMessageComponentInteraction>);

            assert.strictEqual(func.mock.callCount(), 1);
            assert.partialDeepStrictEqual(func.mock.calls[0]?.arguments[0], {
                state: '123',
            });
        });

        test('Handles stateful modal submissions', () => {
            handler.register({
                modals: [
                    createStatefulInteraction(stringSerializer, {
                        data: {
                            custom_id: 'test',
                        } as InteractionData<APIModalSubmitInteraction>,
                        handler: func,
                    }),
                ],
            });

            client.emit(GatewayDispatchEvents.InteractionCreate, {
                data: {
                    type: InteractionType.ModalSubmit,
                    data: {
                        custom_id: 'test123',
                    },
                },
            } as ToEventProps<APIModalSubmitInteraction>);

            assert.strictEqual(func.mock.callCount(), 1);
            assert.partialDeepStrictEqual(func.mock.calls[0]?.arguments[0], {
                state: '123',
            });
        });

        test('Prioritizes longer statefuls', () => {
            handler.register({
                messageComponents: [
                    createStatefulInteraction(stringSerializer, {
                        data: {
                            type: ComponentType.Button,
                            custom_id: 'test_blah',
                        } as InteractionData<APIMessageComponentButtonInteraction>,
                        handler: func,
                    }),
                    createStatefulInteraction(stringSerializer, {
                        data: {
                            type: ComponentType.Button,
                            custom_id: 'test',
                        } as InteractionData<APIMessageComponentButtonInteraction>,
                        handler: func,
                    }),
                ],
            });

            client.emit(GatewayDispatchEvents.InteractionCreate, {
                data: {
                    type: InteractionType.MessageComponent,
                    data: {
                        component_type: ComponentType.Button,
                        custom_id: 'test_blah123',
                    },
                },
            } as ToEventProps<APIMessageComponentInteraction>);

            assert.strictEqual(func.mock.callCount(), 1);
            assert.partialDeepStrictEqual(func.mock.calls[0]?.arguments[0], {
                state: '123',
            });
        });

        test('Prioritizes static interactions over statefuls', () => {
            handler.register({
                messageComponents: [
                    {
                        data: {
                            type: ComponentType.Button,
                            custom_id: 'test_blah',
                        } as InteractionData<APIMessageComponentButtonInteraction>,
                        handler: func,
                    },
                    createStatefulInteraction(stringSerializer, {
                        data: {
                            type: ComponentType.Button,
                            custom_id: 'test',
                        } as InteractionData<APIMessageComponentButtonInteraction>,
                        handler: func,
                    }),
                ],
            });

            client.emit(GatewayDispatchEvents.InteractionCreate, {
                data: {
                    type: InteractionType.MessageComponent,
                    data: {
                        component_type: ComponentType.Button,
                        custom_id: 'test_blah',
                    },
                },
            } as ToEventProps<APIMessageComponentInteraction>);

            const state = func.mock.calls[0]?.arguments[0].state;
            assert.strictEqual(func.mock.callCount(), 1);
            assert(typeof state === 'undefined');
        });

        test('Warns about duplicate interactions', () => {
            handler.register({
                messageComponents: [
                    {
                        data: {
                            type: ComponentType.Button,
                            custom_id: 'test_blah',
                        } as InteractionData<APIMessageComponentButtonInteraction>,
                        handler: func,
                    },
                    {
                        data: {
                            type: ComponentType.Button,
                            custom_id: 'test_blah',
                        } as InteractionData<APIMessageComponentButtonInteraction>,
                        handler: func,
                    },
                    createStatefulInteraction(stringSerializer, {
                        data: {
                            type: ComponentType.Button,
                            custom_id: 'test_blah',
                        } as InteractionData<APIMessageComponentButtonInteraction>,
                        handler: func,
                    }),
                ],
            });

            const warnCalls = logFn.mock.calls.filter(
                (c) => c.arguments[0] === LogLevel.Warn,
            );
            assert.strictEqual(warnCalls.length, 2);
        });
    });
});
