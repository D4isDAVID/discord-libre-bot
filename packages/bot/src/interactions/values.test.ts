import assert from 'node:assert/strict';
import { suite, test } from 'node:test';
import {
    type APIChatInputApplicationCommandInteractionData,
    type APIModalSubmission,
    ApplicationCommandOptionType,
    ComponentType,
} from '@discordjs/core';
import {
    mapChatInputOptionValues,
    mapModalComponentInputValues,
} from './values.ts';

suite('mapChatInputOptionValues()', () => {
    test('Maps basic option values', () => {
        const mapped = mapChatInputOptionValues({
            options: [
                {
                    type: ApplicationCommandOptionType.String,
                    name: 'string',
                    value: 'test',
                },
                {
                    type: ApplicationCommandOptionType.Integer,
                    name: 'integer',
                    value: 123,
                },
                {
                    type: ApplicationCommandOptionType.Boolean,
                    name: 'boolean',
                    value: true,
                },
                {
                    type: ApplicationCommandOptionType.User,
                    name: 'user',
                    value: 'user123',
                },
                {
                    type: ApplicationCommandOptionType.Channel,
                    name: 'channel',
                    value: 'channel123',
                },
                {
                    type: ApplicationCommandOptionType.Role,
                    name: 'role',
                    value: 'role123',
                },
                {
                    type: ApplicationCommandOptionType.Mentionable,
                    name: 'mentionable',
                    value: 'mentionable123',
                },
                {
                    type: ApplicationCommandOptionType.Number,
                    name: 'number',
                    value: 123,
                },
                {
                    type: ApplicationCommandOptionType.Attachment,
                    name: 'attachment',
                    value: 'attachment123',
                },
            ],
        } as APIChatInputApplicationCommandInteractionData);

        assert.deepStrictEqual(mapped, {
            string: 'test',
            integer: 123,
            boolean: true,
            user: 'user123',
            channel: 'channel123',
            role: 'role123',
            mentionable: 'mentionable123',
            number: 123,
            attachment: 'attachment123',
        });
    });
});

suite('mapModalComponentInputValues()', () => {
    test('Maps text input component values', () => {
        const mapped = mapModalComponentInputValues({
            components: [
                {
                    type: ComponentType.ActionRow,
                    components: [
                        {
                            type: ComponentType.TextInput,
                            custom_id: 'action',
                            value: 'testa',
                        },
                    ],
                },
                {
                    type: ComponentType.Label,
                    component: {
                        type: ComponentType.TextInput,
                        custom_id: 'label',
                        value: 'testl',
                    },
                },
            ],
        } as APIModalSubmission);

        assert.deepStrictEqual(mapped, {
            action: 'testa',
            label: 'testl',
        });
    });

    test('Maps select menu component values', () => {
        const mapped = mapModalComponentInputValues({
            components: [
                {
                    type: ComponentType.Label,
                    component: {
                        type: ComponentType.StringSelect,
                        custom_id: 'string',
                        values: ['test'],
                    },
                },
                {
                    type: ComponentType.Label,
                    component: {
                        type: ComponentType.UserSelect,
                        custom_id: 'user',
                        values: ['user123'],
                    },
                },
                {
                    type: ComponentType.Label,
                    component: {
                        type: ComponentType.RoleSelect,
                        custom_id: 'role',
                        values: ['role123'],
                    },
                },
                {
                    type: ComponentType.Label,
                    component: {
                        type: ComponentType.MentionableSelect,
                        custom_id: 'mentionable',
                        values: ['mentionable123'],
                    },
                },
                {
                    type: ComponentType.Label,
                    component: {
                        type: ComponentType.ChannelSelect,
                        custom_id: 'channel',
                        values: ['channel123'],
                    },
                },
            ],
        } as APIModalSubmission);

        assert.deepStrictEqual(mapped, {
            string: ['test'],
            user: ['user123'],
            role: ['role123'],
            mentionable: ['mentionable123'],
            channel: ['channel123'],
        });
    });
});
