import assert from 'node:assert/strict';
import { mock, suite, test } from 'node:test';
import {
    type APIMessageComponentButtonInteraction,
    ButtonStyle,
    ComponentType,
    type ToEventProps,
} from '@discordjs/core';
import type { BotEventContainer } from '../../events/event.ts';
import { createStatefulInteraction } from '../extensions/stateful.ts';
import {
    arraySerializer,
    intSerializer,
    stringSerializer,
} from './statefuls.ts';

suite('stringSerializer', () => {
    const func = mock.fn();
    const interaction = createStatefulInteraction(stringSerializer, {
        data: {
            type: ComponentType.Button,
            style: ButtonStyle.Primary,
            custom_id: 'test',
        },
        handler: func,
    });

    test('Serializes state to a string', () => {
        const stateful = interaction.stateful('asd');

        assert.strictEqual(stateful.custom_id, 'testasd');
    });

    test('Deserializes state to a string', () => {
        const stateful = interaction.stateful('asd');

        interaction.handler.bind({} as BotEventContainer)({
            data: {
                data: stateful as unknown,
            },
        } as ToEventProps<APIMessageComponentButtonInteraction>);

        assert.strictEqual(func.mock.callCount(), 1);
        assert.partialDeepStrictEqual(func.mock.calls[0]?.arguments[0], {
            state: 'asd',
        });
    });
});

suite('intSerializer', () => {
    const func = mock.fn();
    const interaction = createStatefulInteraction(intSerializer, {
        data: {
            type: ComponentType.Button,
            style: ButtonStyle.Primary,
            custom_id: 'test',
        },
        handler: func,
    });

    test('Serializes state to a string', () => {
        const stateful = interaction.stateful(123);

        assert.strictEqual(stateful.custom_id, 'test123');
    });

    test('Deserializes state to a number', () => {
        const stateful = interaction.stateful(123);

        interaction.handler.bind({} as BotEventContainer)({
            data: {
                data: stateful as unknown,
            },
        } as ToEventProps<APIMessageComponentButtonInteraction>);

        assert.strictEqual(func.mock.callCount(), 1);
        assert.partialDeepStrictEqual(func.mock.calls[0]?.arguments[0], {
            state: 123,
        });
    });
});

suite('arraySerializer()', () => {
    const func = mock.fn();
    const interaction = createStatefulInteraction(
        arraySerializer(intSerializer, stringSerializer),
        {
            data: {
                type: ComponentType.Button,
                style: ButtonStyle.Primary,
                custom_id: 'test',
            },
            handler: func,
        },
    );

    test('Serializes state to a string', () => {
        const stateful = interaction.stateful([123, 'asd']);

        assert.strictEqual(stateful.custom_id, 'test123_asd');
    });

    test('Deserializes state to an array', () => {
        const stateful = interaction.stateful([123, 'asd']);

        interaction.handler.bind({} as BotEventContainer)({
            data: {
                data: stateful as unknown,
            },
        } as ToEventProps<APIMessageComponentButtonInteraction>);

        assert.strictEqual(func.mock.callCount(), 1);
        assert.partialDeepStrictEqual(func.mock.calls[0]?.arguments[0], {
            state: [123, 'asd'],
        });
    });
});
