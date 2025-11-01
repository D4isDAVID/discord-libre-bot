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
} from './predicates.ts';

suite('hasCommandChanged()', () => {
    test('Returns false when the command is equal', () => {
        assert(
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
        assert(
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
        assert(
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
        assert(
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
        assert(
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
        assert(!haveCommandOptionsChanged([], []));
        assert(
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
        assert(
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
        assert(
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
        assert(
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
        assert(
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
        assert(
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
        assert(
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
        assert(
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
        assert(
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
        assert(
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
        assert(
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
        assert(
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
        assert(
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
        assert(
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
        assert(
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
        assert(
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
        assert(
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
        assert(
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
    test('Returns false when the arrays contain similar values', () => {
        assert(!haveCommandOptionChoicesChanged([], []));
        assert(
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

    test('Returns true when the arrays are missing similar values', () => {
        assert(
            haveCommandOptionChoicesChanged(
                [{ name: 'test', value: 'test' }],
                [],
            ),
        );
        assert(
            haveCommandOptionChoicesChanged(
                [],
                [{ name: 'test', value: 'test' }],
            ),
        );
        assert(
            haveCommandOptionChoicesChanged(
                [{ name: 'test', value: 'test' }],
                [{ name: 'changed', value: 'test' }],
            ),
        );
        assert(
            haveCommandOptionChoicesChanged(
                [{ name: 'test', value: 'test' }],
                [{ name: 'test', value: 'changed' }],
            ),
        );
        assert(
            haveCommandOptionChoicesChanged(
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
                        name_localizations: { 'en-US': 'changed' },
                    },
                ],
            ),
        );
    });
});

suite('haveLocalizationsChanged()', () => {
    test('Returns false when both are null', () => {
        assert(!haveLocalizationsChanged(null, null));
    });

    test('Returns true when only one is null', () => {
        assert(haveLocalizationsChanged({}, null));
        assert(haveLocalizationsChanged(null, {}));
    });

    test('Returns false when the arrays contain similar values', () => {
        assert(!haveLocalizationsChanged({}, {}));
        assert(
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

    test('Returns true when the arrays are missing similar values', () => {
        assert(haveLocalizationsChanged({ 'en-US': 'test' }, {}));
        assert(haveLocalizationsChanged({}, { 'en-US': 'test' }));
        assert(
            haveLocalizationsChanged(
                { 'en-US': 'test' },
                { 'en-US': 'changed' },
            ),
        );
        assert(
            haveLocalizationsChanged(
                { 'en-US': 'test' },
                { 'en-US': 'test', 'en-GB': 'test' },
            ),
        );
        assert(
            haveLocalizationsChanged(
                { 'en-US': 'test', 'en-GB': 'test' },
                { 'en-US': 'test' },
            ),
        );
    });
});

suite('hasArrayChanged()', () => {
    test('Returns false when both are null', () => {
        assert(!hasArrayChanged(null, null));
    });

    test('Returns true when only one is null', () => {
        assert(hasArrayChanged([], null));
        assert(hasArrayChanged(null, []));
    });

    test('Returns false when the arrays contain similar values', () => {
        assert(!hasArrayChanged([], []));
        assert(!hasArrayChanged(['a', 'b', 'b'], ['b', 'a', 'a']));
    });

    test('Returns true when the arrays are missing similar values', () => {
        assert(hasArrayChanged(['a'], []));
        assert(hasArrayChanged([], ['b']));
        assert(hasArrayChanged(['a'], ['b']));
    });
});
