import assert from 'node:assert/strict';
import { mock, suite, test } from 'node:test';
import {
    type APIInteraction,
    type APIMessageComponentButtonInteraction,
    type APIModalSubmitInteraction,
    ButtonStyle,
    ComponentType,
} from '@discordjs/core';
import type { BotEventContainer } from '../../../events/event.ts';
import type { BotInteraction } from '../../interaction.ts';
import { createBotMenu } from './base.ts';

const exampleComponent = {
    data: {
        type: ComponentType.Button,
        style: ButtonStyle.Primary,
        custom_id: 'example',
    },
    handler: mock.fn(),
} satisfies BotInteraction<APIMessageComponentButtonInteraction>;

const exampleModal = {
    data: {
        custom_id: 'example',
        title: 'Example',
        components: [],
    },
    handler: mock.fn(),
} satisfies BotInteraction<APIModalSubmitInteraction>;

suite('createBotMenu()', () => {
    test('Compiles message components and modals', () => {
        const menu = createBotMenu({
            build() {
                return [];
            },
            messageComponents: { exampleComponent },
            modals: { exampleModal },
        });

        assert.deepStrictEqual(
            menu.messageComponents[0]?.data,
            exampleComponent.data,
        );
        assert.deepStrictEqual(menu.modals[0]?.data, exampleModal.data);
    });

    test('Provides message components to build function', () => {
        const fn = mock.fn();

        const menu = createBotMenu({
            build({ messageComponents: { exampleComponent } }) {
                fn(exampleComponent);
                return [];
            },
            messageComponents: { exampleComponent },
            modals: { exampleModal },
        });

        menu.build({
            container: {} as BotEventContainer,
            interaction: {} as APIInteraction,
        });

        assert.strictEqual(
            fn.mock.calls[0]?.arguments[0],
            exampleComponent.data,
        );
    });

    test('Provides modals to message component functions', () => {
        const fn = mock.fn();

        createBotMenu({
            build() {
                return [];
            },
            messageComponents: {
                exampleComponent({ exampleModal }) {
                    fn(exampleModal);
                    return exampleComponent;
                },
            },
            modals: { exampleModal },
        });

        assert.strictEqual(fn.mock.calls[0]?.arguments[0], exampleModal.data);
    });
});
