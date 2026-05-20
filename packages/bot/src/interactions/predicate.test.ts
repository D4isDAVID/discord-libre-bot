import assert from 'node:assert/strict';
import { suite, test } from 'node:test';
import {
    ApplicationCommandOptionType,
    ApplicationCommandType,
    ApplicationIntegrationType,
    ChannelType,
    InteractionContextType,
} from '@discordjs/core';
import {
    hasArrayChanged,
    hasCommandChanged,
    hasCommandOptionChanged,
    haveCommandOptionChoicesChanged,
    haveCommandOptionsChanged,
    haveLocalizationsChanged,
} from './predicate.ts';

suite('hasCommandChanged()', () => {
    test('Returns false when the command is equal', () => {
        assert.strict(
            !hasCommandChanged(
                {
                    name: 'test',
                    name_localizations: { 'en-US': 'test' },
                    description: 'test',
                    description_localizations: { 'en-US': 'test' },
                    default_member_permissions: '0',
                    integration_types: [
                        ApplicationIntegrationType.GuildInstall,
                    ],
                    contexts: [InteractionContextType.Guild],
                    nsfw: false,
                    options: [
                        {
                            type: ApplicationCommandOptionType.String,
                            name: 'test',
                            description: 'test',
                        },
                    ],
                },
                {
                    application_id: '123',
                    id: '123',
                    version: '123',
                    type: ApplicationCommandType.ChatInput,
                    name: 'test',
                    name_localizations: { 'en-US': 'test' },
                    description: 'test',
                    description_localizations: { 'en-US': 'test' },
                    default_member_permissions: '0',
                    integration_types: [
                        ApplicationIntegrationType.GuildInstall,
                    ],
                    contexts: [InteractionContextType.Guild],
                    nsfw: false,
                    options: [
                        {
                            type: ApplicationCommandOptionType.String,
                            name: 'test',
                            description: 'test',
                        },
                    ],
                },
            ),
        );
        assert.strict(
            !hasCommandChanged(
                {
                    type: ApplicationCommandType.User,
                    name: 'test',
                },
                {
                    application_id: '123',
                    id: '123',
                    version: '123',
                    type: ApplicationCommandType.User,
                    name: 'test',
                    description: '',
                    default_member_permissions: null,
                },
            ),
        );
    });

    test('Returns true when the command is different', () => {
        assert.strict(
            hasCommandChanged(
                {
                    name: 'test',
                    description: 'test',
                },
                {
                    application_id: '123',
                    id: '123',
                    version: '123',
                    type: ApplicationCommandType.ChatInput,
                    name: 'changed',
                    description: 'changed',
                    default_member_permissions: null,
                },
            ),
        );
        assert.strict(
            hasCommandChanged(
                {
                    name: 'test',
                    name_localizations: { 'en-US': 'test' },
                    description: 'test',
                    description_localizations: { 'en-US': 'test' },
                },
                {
                    application_id: '123',
                    id: '123',
                    version: '123',
                    type: ApplicationCommandType.ChatInput,
                    name: 'test',
                    name_localizations: { 'en-US': 'changed' },
                    description: 'test',
                    description_localizations: { 'en-US': 'changed' },
                    default_member_permissions: null,
                },
            ),
        );
        assert.strict(
            hasCommandChanged(
                {
                    type: ApplicationCommandType.User,
                    name: 'test',
                },
                {
                    application_id: '123',
                    id: '123',
                    version: '123',
                    type: ApplicationCommandType.Message,
                    name: 'test',
                    description: '',
                    default_member_permissions: null,
                },
            ),
        );
    });
});

suite('haveCommandOptionsChanged()', () => {
    test('Returns false when the options are similar', () => {
        assert.strict(!haveCommandOptionsChanged([], []));
        assert.strict(
            !haveCommandOptionsChanged(
                [
                    {
                        type: ApplicationCommandOptionType.String,
                        name: 'test',
                        description: 'test',
                    },
                ],
                [
                    {
                        type: ApplicationCommandOptionType.String,
                        name: 'test',
                        description: 'test',
                    },
                ],
            ),
        );
    });

    test('Returns true when an option is not similar', () => {
        assert.strict(
            haveCommandOptionsChanged(
                [
                    {
                        type: ApplicationCommandOptionType.String,
                        name: 'test',
                        description: 'test',
                    },
                ],
                [],
            ),
        );
        assert.strict(
            haveCommandOptionsChanged(
                [],
                [
                    {
                        type: ApplicationCommandOptionType.String,
                        name: 'test',
                        description: 'test',
                    },
                ],
            ),
        );
        assert.strict(
            haveCommandOptionsChanged(
                [
                    {
                        type: ApplicationCommandOptionType.String,
                        name: 'test',
                        description: 'test',
                    },
                ],
                [
                    {
                        type: ApplicationCommandOptionType.String,
                        name: 'test',
                        description: 'changed',
                    },
                ],
            ),
        );
        assert.strict(
            haveCommandOptionsChanged(
                [
                    {
                        type: ApplicationCommandOptionType.String,
                        name: 'test',
                        description: 'test',
                    },
                ],
                [
                    {
                        type: ApplicationCommandOptionType.String,
                        name: 'changed',
                        description: 'changed',
                    },
                ],
            ),
        );
    });
});

suite('hasCommandOptionChanged()', () => {
    test('Returns false when the option is equal', () => {
        assert.strict(
            !hasCommandOptionChanged(
                {
                    type: ApplicationCommandOptionType.String,
                    name: 'test',
                    name_localizations: { 'en-US': 'test' },
                    description: 'test',
                    description_localizations: { 'en-US': 'test' },
                    required: true,
                    choices: [{ name: 'test', value: 'test' }],
                    autocomplete: false,
                    min_length: 10,
                    max_length: 20,
                },
                {
                    type: ApplicationCommandOptionType.String,
                    name: 'test',
                    name_localizations: { 'en-US': 'test' },
                    description: 'test',
                    description_localizations: { 'en-US': 'test' },
                    required: true,
                    choices: [{ name: 'test', value: 'test' }],
                    autocomplete: false,
                    min_length: 10,
                    max_length: 20,
                },
            ),
        );
        assert.strict(
            !hasCommandOptionChanged(
                {
                    type: ApplicationCommandOptionType.Integer,
                    name: 'test',
                    name_localizations: { 'en-US': 'test' },
                    description: 'test',
                    description_localizations: { 'en-US': 'test' },
                    required: true,
                    choices: [{ name: 'test', value: 2 }],
                    autocomplete: false,
                    min_value: 10,
                    max_value: 20,
                },
                {
                    type: ApplicationCommandOptionType.Integer,
                    name: 'test',
                    name_localizations: { 'en-US': 'test' },
                    description: 'test',
                    description_localizations: { 'en-US': 'test' },
                    required: true,
                    choices: [{ name: 'test', value: 2 }],
                    autocomplete: false,
                    min_value: 10,
                    max_value: 20,
                },
            ),
        );
        assert.strict(
            !hasCommandOptionChanged(
                {
                    type: ApplicationCommandOptionType.Channel,
                    name: 'test',
                    description: 'test',
                    channel_types: [
                        ChannelType.GuildText,
                        ChannelType.GuildText,
                        ChannelType.AnnouncementThread,
                    ],
                },
                {
                    type: ApplicationCommandOptionType.Channel,
                    name: 'test',
                    description: 'test',
                    channel_types: [
                        ChannelType.AnnouncementThread,
                        ChannelType.GuildText,
                    ],
                },
            ),
        );
        assert.strict(
            !hasCommandOptionChanged(
                {
                    type: ApplicationCommandOptionType.Subcommand,
                    name: 'test',
                    name_localizations: { 'en-US': 'test' },
                    description: 'test',
                    description_localizations: { 'en-US': 'test' },
                    required: true,
                    options: [
                        {
                            type: ApplicationCommandOptionType.String,
                            name: 'test',
                            description: 'test',
                        },
                    ],
                },
                {
                    type: ApplicationCommandOptionType.Subcommand,
                    name: 'test',
                    name_localizations: { 'en-US': 'test' },
                    description: 'test',
                    description_localizations: { 'en-US': 'test' },
                    required: true,
                    options: [
                        {
                            type: ApplicationCommandOptionType.String,
                            name: 'test',
                            description: 'test',
                        },
                    ],
                },
            ),
        );
    });

    test('Returns true when the option is different', () => {
        assert.strict(
            hasCommandOptionChanged(
                {
                    type: ApplicationCommandOptionType.String,
                    name: 'test',
                    description: 'test',
                },
                {
                    type: ApplicationCommandOptionType.String,
                    name: 'changed',
                    description: 'changed',
                },
            ),
        );
        assert.strict(
            hasCommandOptionChanged(
                {
                    type: ApplicationCommandOptionType.String,
                    name: 'test',
                    name_localizations: { 'en-US': 'test' },
                    description: 'test',
                    description_localizations: { 'en-US': 'test' },
                },
                {
                    type: ApplicationCommandOptionType.String,
                    name: 'test',
                    name_localizations: { 'en-US': 'changed' },
                    description: 'test',
                    description_localizations: { 'en-US': 'changed' },
                    required: false,
                },
            ),
        );
        assert.strict(
            hasCommandOptionChanged(
                {
                    type: ApplicationCommandOptionType.String,
                    name: 'test',
                    description: 'test',
                    required: true,
                },
                {
                    type: ApplicationCommandOptionType.String,
                    name: 'test',
                    description: 'test',
                    required: false,
                },
            ),
        );
        assert.strict(
            hasCommandOptionChanged(
                {
                    type: ApplicationCommandOptionType.String,
                    name: 'test',
                    description: 'test',
                    choices: [{ name: 'test', value: 'test' }],
                },
                {
                    type: ApplicationCommandOptionType.String,
                    name: 'test',
                    description: 'test',
                    choices: [{ name: 'changed', value: 'changed' }],
                },
            ),
        );
        assert.strict(
            hasCommandOptionChanged(
                {
                    type: ApplicationCommandOptionType.String,
                    name: 'test',
                    description: 'test',
                    autocomplete: false,
                },
                {
                    type: ApplicationCommandOptionType.String,
                    name: 'test',
                    description: 'test',
                    autocomplete: true,
                },
            ),
        );
        assert.strict(
            hasCommandOptionChanged(
                {
                    type: ApplicationCommandOptionType.String,
                    name: 'test',
                    description: 'test',
                    min_length: 10,
                    max_length: 20,
                },
                {
                    type: ApplicationCommandOptionType.String,
                    name: 'test',
                    description: 'test',
                    min_length: 1,
                    max_length: 2,
                },
            ),
        );
        assert.strict(
            hasCommandOptionChanged(
                {
                    type: ApplicationCommandOptionType.Integer,
                    name: 'test',
                    description: 'test',
                    min_value: 1,
                    max_value: 2,
                },
                {
                    type: ApplicationCommandOptionType.Integer,
                    name: 'test',
                    description: 'test',
                    min_value: 10,
                    max_value: 20,
                },
            ),
        );
        assert.strict(
            hasCommandOptionChanged(
                {
                    type: ApplicationCommandOptionType.Channel,
                    name: 'test',
                    description: 'test',
                    channel_types: [ChannelType.GuildText],
                },
                {
                    type: ApplicationCommandOptionType.Channel,
                    name: 'test',
                    description: 'test',
                    channel_types: [ChannelType.GuildCategory],
                },
            ),
        );
        assert.strict(
            hasCommandOptionChanged(
                {
                    type: ApplicationCommandOptionType.Subcommand,
                    name: 'test',
                    description: 'test',
                    options: [
                        {
                            type: ApplicationCommandOptionType.String,
                            name: 'test',
                            description: 'test',
                        },
                    ],
                },
                {
                    type: ApplicationCommandOptionType.Subcommand,
                    name: 'test',
                    description: 'test',
                    options: [
                        {
                            type: ApplicationCommandOptionType.String,
                            name: 'changed',
                            description: 'changed',
                        },
                    ],
                },
            ),
        );
    });
});

suite('haveCommandOptionChoicesChanged()', () => {
    test('Returns false for similar values', () => {
        assert.strict(!haveCommandOptionChoicesChanged([], []));
        assert.strict(
            !haveCommandOptionChoicesChanged(
                [
                    {
                        name: 'test',
                        value: 'test',
                        name_localizations: { 'en-US': 'test' },
                    },
                ],
                [
                    {
                        name: 'test',
                        value: 'test',
                        name_localizations: { 'en-US': 'test' },
                    },
                ],
            ),
        );
    });

    test('Returns true for differing values', () => {
        assert.strict(
            haveCommandOptionChoicesChanged(
                [{ name: 'test', value: 'test' }],
                [],
            ),
        );
        assert.strict(
            haveCommandOptionChoicesChanged(
                [],
                [{ name: 'test', value: 'test' }],
            ),
        );
        assert.strict(
            haveCommandOptionChoicesChanged(
                [{ name: 'changed', value: 'test' }],
                [{ name: 'test', value: 'test' }],
            ),
        );
        assert.strict(
            haveCommandOptionChoicesChanged(
                [{ name: 'test', value: 'changed' }],
                [{ name: 'test', value: 'test' }],
            ),
        );
        assert.strict(
            haveCommandOptionChoicesChanged(
                [
                    {
                        name: 'test',
                        value: 'test',
                        name_localizations: { 'en-US': 'changed' },
                    },
                ],
                [
                    {
                        name: 'test',
                        value: 'test',
                        name_localizations: { 'en-US': 'test' },
                    },
                ],
            ),
        );
    });
});

suite('haveLocalizationsChanged()', () => {
    test('Returns false when both are null', () => {
        assert.strict(!haveLocalizationsChanged(null, null));
    });

    test('Returns true when only one is null', () => {
        assert.strict(haveLocalizationsChanged({}, null));
        assert.strict(haveLocalizationsChanged(null, {}));
    });

    test('Returns false for similar values', () => {
        assert.strict(!haveLocalizationsChanged({}, {}));
        assert.strict(
            !haveLocalizationsChanged(
                {
                    'en-GB': undefined,
                    'en-US': null,
                    'es-419': 'test',
                },
                {
                    'en-GB': null,
                    'es-419': 'test',
                },
            ),
        );
    });

    test('Returns true for differing values', () => {
        assert.strict(haveLocalizationsChanged({ 'en-US': 'test' }, {}));
        assert.strict(haveLocalizationsChanged({}, { 'en-US': 'test' }));
        assert.strict(
            haveLocalizationsChanged(
                { 'en-US': 'test' },
                { 'en-US': 'changed' },
            ),
        );
        assert.strict(
            haveLocalizationsChanged(
                { 'en-US': 'test' },
                { 'en-US': 'test', 'en-GB': 'test' },
            ),
        );
        assert.strict(
            haveLocalizationsChanged(
                { 'en-US': 'test', 'en-GB': 'test' },
                { 'en-US': 'test' },
            ),
        );
    });
});

suite('hasArrayChanged()', () => {
    test('Returns false when both are null', () => {
        assert.strict(!hasArrayChanged(null, null));
    });

    test('Returns true when only one is null', () => {
        assert.strict(hasArrayChanged([], null));
        assert.strict(hasArrayChanged(null, []));
    });

    test('Returns false for similar values', () => {
        assert.strict(!hasArrayChanged([], []));
        assert.strict(!hasArrayChanged(['a', 'b', 'b'], ['b', 'a', 'a']));
    });

    test('Returns true for differing values', () => {
        assert.strict(hasArrayChanged(['a'], []));
        assert.strict(hasArrayChanged([], ['b']));
        assert.strict(hasArrayChanged(['a'], ['b']));
    });
});
