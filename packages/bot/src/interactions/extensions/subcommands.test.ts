import assert from 'node:assert/strict';
import { mock, suite, test } from 'node:test';
import {
    type APIApplicationCommandAutocompleteInteraction,
    type APIApplicationCommandInteractionDataSubcommandGroupOption,
    type APIApplicationCommandSubcommandGroupOption,
    type APIApplicationCommandSubcommandOption,
    type APIChatInputApplicationCommandInteraction,
    ApplicationCommandOptionType,
    type RESTPostAPIApplicationCommandsJSONBody,
    type ToEventProps,
} from '@discordjs/core';
import { MockLogger } from '@internal/logger';
import type { BotEventContainer } from '../../events/event.ts';
import {
    createSubcommandsCommand,
    createSubcommandsGroup,
} from './subcommands.ts';

const subcommandData: APIApplicationCommandSubcommandOption = {
    type: ApplicationCommandOptionType.Subcommand,
    name: 'stest',
    description: 'test',
};

const groupData: APIApplicationCommandSubcommandGroupOption = {
    type: ApplicationCommandOptionType.SubcommandGroup,
    name: 'gtest',
    description: 'test',
};

const commandData: RESTPostAPIApplicationCommandsJSONBody = {
    name: 'test',
    description: 'test',
};

suite('createSubcommandsGroup()', () => {
    const logger = new MockLogger();
    const container = { logger } as unknown as BotEventContainer;

    test('Handles subcommands', async () => {
        const groupHandler = mock.fn();
        const groupAutocomplete = mock.fn();
        const subcommandHandler = mock.fn();
        const subcommandAutocomplete = mock.fn();

        const group = createSubcommandsGroup(
            {
                data: groupData,
                handler: groupHandler,
                autocomplete: groupAutocomplete,
            },
            [
                {
                    data: subcommandData,
                    handler: subcommandHandler,
                    autocomplete: subcommandAutocomplete,
                },
            ],
        );

        await group.handler.bind(container)({
            option: {
                options: [
                    {
                        type: ApplicationCommandOptionType.Subcommand,
                        name: 'stest',
                    },
                ],
            },
        } as ToEventProps<APIChatInputApplicationCommandInteraction> & {
            option: APIApplicationCommandInteractionDataSubcommandGroupOption;
        });
        await group.autocomplete.bind(container)({
            option: {
                options: [
                    {
                        type: ApplicationCommandOptionType.Subcommand,
                        name: 'stest',
                    },
                ],
            },
        } as ToEventProps<APIApplicationCommandAutocompleteInteraction> & {
            option: APIApplicationCommandInteractionDataSubcommandGroupOption;
        });

        assert.strictEqual(groupHandler.mock.callCount(), 1);
        assert.strictEqual(groupAutocomplete.mock.callCount(), 1);
        assert.strictEqual(subcommandHandler.mock.callCount(), 1);
        assert.strictEqual(subcommandAutocomplete.mock.callCount(), 1);
    });
});

suite('createSubcommandsCommand()', () => {
    const logger = new MockLogger();
    const container = { logger } as unknown as BotEventContainer;

    test('Handles subcommands', async () => {
        const commandHandler = mock.fn();
        const commandAutocomplete = mock.fn();
        const subcommandHandler = mock.fn();
        const subcommandAutocomplete = mock.fn();

        const command = createSubcommandsCommand(
            {
                data: commandData,
                handler: commandHandler,
                autocomplete: commandAutocomplete,
            },
            [
                {
                    data: subcommandData,
                    handler: subcommandHandler,
                    autocomplete: subcommandAutocomplete,
                },
            ],
        );

        await command.handler.bind(container)({
            data: {
                data: {
                    options: [
                        {
                            type: ApplicationCommandOptionType.Subcommand,
                            name: 'stest',
                        },
                    ],
                },
            },
        } as ToEventProps<APIChatInputApplicationCommandInteraction>);
        await command.autocomplete.bind(container)({
            data: {
                data: {
                    options: [
                        {
                            type: ApplicationCommandOptionType.Subcommand,
                            name: 'stest',
                        },
                    ],
                },
            },
        } as ToEventProps<APIApplicationCommandAutocompleteInteraction>);

        assert.strictEqual(commandHandler.mock.callCount(), 1);
        assert.strictEqual(commandAutocomplete.mock.callCount(), 1);
        assert.strictEqual(subcommandHandler.mock.callCount(), 1);
        assert.strictEqual(subcommandAutocomplete.mock.callCount(), 1);
    });

    test('Handles subcommand groups', async () => {
        const commandHandler = mock.fn();
        const commandAutocomplete = mock.fn();
        const groupHandler = mock.fn();
        const groupAutocomplete = mock.fn();
        const subcommandHandler = mock.fn();
        const subcommandAutocomplete = mock.fn();

        const command = createSubcommandsCommand(
            {
                data: commandData,
                handler: commandHandler,
                autocomplete: commandAutocomplete,
            },
            [
                createSubcommandsGroup(
                    {
                        data: groupData,
                        handler: groupHandler,
                        autocomplete: groupAutocomplete,
                    },
                    [
                        {
                            data: subcommandData,
                            handler: subcommandHandler,
                            autocomplete: subcommandAutocomplete,
                        },
                    ],
                ),
            ],
        );

        await command.handler.bind(container)({
            data: {
                data: {
                    options: [
                        {
                            type: ApplicationCommandOptionType.SubcommandGroup,
                            name: 'gtest',
                            options: [
                                {
                                    type: ApplicationCommandOptionType.Subcommand,
                                    name: 'stest',
                                },
                            ],
                        },
                    ],
                },
            },
        } as ToEventProps<APIChatInputApplicationCommandInteraction>);
        await command.autocomplete.bind(container)({
            data: {
                data: {
                    options: [
                        {
                            type: ApplicationCommandOptionType.SubcommandGroup,
                            name: 'gtest',
                            options: [
                                {
                                    type: ApplicationCommandOptionType.Subcommand,
                                    name: 'stest',
                                },
                            ],
                        },
                    ],
                },
            },
        } as ToEventProps<APIApplicationCommandAutocompleteInteraction>);

        assert.strictEqual(commandHandler.mock.callCount(), 1);
        assert.strictEqual(commandAutocomplete.mock.callCount(), 1);
        assert.strictEqual(groupHandler.mock.callCount(), 1);
        assert.strictEqual(groupAutocomplete.mock.callCount(), 1);
        assert.strictEqual(subcommandHandler.mock.callCount(), 1);
        assert.strictEqual(subcommandAutocomplete.mock.callCount(), 1);
    });
});
