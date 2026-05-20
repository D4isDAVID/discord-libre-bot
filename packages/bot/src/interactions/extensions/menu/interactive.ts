import {
    type APIComponentInContainer,
    type APIMessageComponentButtonInteraction,
    ButtonStyle,
    ComponentType,
} from '@discordjs/core';
import type { BotEventContainer } from '../../../events/event.ts';
import {
    arraySerializer,
    type BotStatefulInteraction,
    createStatefulInteraction,
    intSerializer,
    stringSerializer,
} from '../../stateful/index.ts';
import {
    type BotMenu,
    type ComponentIdFactory,
    createBotMenu,
} from './base.ts';

const INTERACTIVE_BUTTON_ID = 'interactive';

interface InteractiveButton {
    label: string;
    build(
        this: BotEventContainer,
        getComponentId: ComponentIdFactory,
    ): APIComponentInContainer[] | Promise<APIComponentInContainer[]>;
}

export interface BotInteractiveMenuOptions<
    T extends Record<string, InteractiveButton>,
> {
    menuId: string;
    title?: string;
    buttons: T;
}

export interface BotInteractiveMenu<T extends Record<string, InteractiveButton>>
    extends BotMenu<keyof T> {
    button: BotStatefulInteraction<
        APIMessageComponentButtonInteraction,
        [number, string]
    >;
}

export function createBotInteractiveMenu<
    T extends Record<string, InteractiveButton>,
>({
    menuId,
    title,
    buttons,
}: BotInteractiveMenuOptions<T>): BotInteractiveMenu<T> {
    const backText = `Back${typeof title === 'undefined' ? '' : ` to ${title}`}`;

    const menu = createBotMenu<keyof T>({
        async build(getComponentId, buttonName) {
            const componentId = getComponentId();

            const buttonData =
                typeof buttonName === 'undefined'
                    ? undefined
                    : buttons[buttonName];

            if (typeof buttonData !== 'undefined') {
                const built = await buttonData.build.bind(this)(getComponentId);

                return [
                    ...built,
                    {
                        type: ComponentType.Separator,
                        id: componentId,
                    },
                    {
                        type: ComponentType.Section,
                        components: [
                            {
                                type: ComponentType.TextDisplay,
                                content: backText,
                            },
                        ],
                        accessory: {
                            ...button.stateful([componentId, '']),
                            emoji: { name: '➡️' },
                        },
                    },
                ];
            }

            return createListing(componentId);
        },
    });

    function createListing(componentId: number) {
        const components: APIComponentInContainer[] = Object.entries(
            buttons,
        ).map(([key, { label }]) => ({
            type: ComponentType.Section,
            components: [
                {
                    type: ComponentType.TextDisplay,
                    content: label,
                },
            ],
            accessory: {
                ...button.stateful([componentId, key]),
                emoji: { name: '➡️' },
            },
        }));

        if (typeof title !== 'undefined') {
            components.unshift(
                {
                    type: ComponentType.TextDisplay,
                    content: title,
                },
                {
                    type: ComponentType.Separator,
                },
            );
        }

        const finalSection = components[0];
        if (typeof finalSection !== 'undefined') {
            finalSection.id = componentId;
        }

        return components;
    }

    const button = createStatefulInteraction<
        APIMessageComponentButtonInteraction,
        [number, string]
    >(arraySerializer(intSerializer, stringSerializer), {
        data: {
            type: ComponentType.Button,
            custom_id: `${menuId}_${INTERACTIVE_BUTTON_ID}`,
            style: ButtonStyle.Secondary,
        },
        async handler({
            data: interaction,
            api,
            state: [componentId, buttonName],
        }) {
            const container = interaction.message.components?.[0];

            if (
                typeof container === 'undefined'
                || container.type !== ComponentType.Container
            ) {
                return;
            }

            await api.interactions.deferMessageUpdate(
                interaction.id,
                interaction.token,
            );

            const build = await menu.editContainer.bind(this)(
                container,
                componentId,
                buttonName,
            );

            await api.interactions.editReply(
                interaction.application_id,
                interaction.token,
                {
                    components: [build],
                },
            );
        },
    });

    return {
        ...menu,
        button,
    };
}
