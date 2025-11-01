import assert from 'node:assert/strict';
import { mock, suite, test } from 'node:test';
import {
    type APIMessageComponentButtonInteraction,
    ButtonStyle,
    ComponentType,
    type ToEventProps,
} from '@discordjs/core';
import type { BotEventContainer } from '../../events/event.ts';
import type { BotInteraction } from '../interaction.ts';
import {
    createStatefulInteraction,
    isStatefulInteraction,
} from './stateful.ts';

suite('isStatefulInteraction()', () => {
    test('Returns true given a stateful interaction', () => {
        assert(
            isStatefulInteraction({
                stateful() {
                    return;
                },
            } as unknown as BotInteraction<APIMessageComponentButtonInteraction>),
        );
    });

    test('Returns false given a non-stateful interaction', () => {
        assert(
            !isStatefulInteraction(
                {} as unknown as BotInteraction<APIMessageComponentButtonInteraction>,
            ),
        );
    });
});

suite('createStatefulInteraction()', () => {
    const data: BotInteraction<APIMessageComponentButtonInteraction>['data'] = {
        type: ComponentType.Button,
        custom_id: 'test',
        style: ButtonStyle.Primary,
    };

    test('Registers state', () => {
        const interaction =
            createStatefulInteraction<APIMessageComponentButtonInteraction>({
                data,
                handler() {
                    return;
                },
            });

        const stateful = interaction.stateful('123');

        assert.strictEqual(stateful.custom_id, `${data.custom_id}123`);
    });

    test('Handles state', () => {
        const func = mock.fn();
        const interaction =
            createStatefulInteraction<APIMessageComponentButtonInteraction>({
                data,
                handler: func,
            });

        interaction.handler.bind({} as BotEventContainer)({
            data: {
                data: {
                    custom_id: 'test123',
                },
            },
        } as ToEventProps<APIMessageComponentButtonInteraction>);

        assert.strictEqual(func.mock.calls?.[0]?.arguments?.[0].state, '123');
    });

    test('Serializes state', () => {
        const interaction = createStatefulInteraction<
            APIMessageComponentButtonInteraction,
            number
        >({
            data,
            handler() {
                return;
            },
            serialize(state) {
                return `${state}`;
            },
            deserialize(state) {
                return Number.parseInt(state);
            },
        });

        const stateful = interaction.stateful(123);

        assert.strictEqual(stateful.custom_id, `${data.custom_id}123`);
    });

    test('Handles state', () => {
        const func = mock.fn();
        const interaction = createStatefulInteraction<
            APIMessageComponentButtonInteraction,
            number
        >({
            data,
            handler: func,
            serialize(state) {
                return `${state}`;
            },
            deserialize(state) {
                return Number.parseInt(state);
            },
        });

        interaction.handler.bind({} as BotEventContainer)({
            data: {
                data: {
                    custom_id: 'test123',
                },
            },
        } as ToEventProps<APIMessageComponentButtonInteraction>);

        assert.strictEqual(func.mock.calls?.[0]?.arguments?.[0].state, 123);
    });
});
