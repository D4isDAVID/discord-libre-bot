import {
    type APIComponentInContainer,
    type APISelectMenuOption,
    type APIStringSelectComponent,
    ComponentType,
} from '@discordjs/core';
import type { BotEventContainer } from '../../../events/event.ts';
import { intSerializer } from '../../stateful/serializers.ts';
import {
    type BotStatefulInteraction,
    createStatefulInteraction,
} from '../../stateful/stateful.ts';
import type { ApiMessageComponentStringSelectInteraction } from '../message-components.ts';
import {
    type BotMenu,
    type ComponentIdFactory,
    createBotMenu,
} from './base.ts';

const SECTION_SELECT_ID = 'section';

export interface BotSectionedMenuSection {
    option: Omit<APISelectMenuOption, 'value' | 'default'>;
    build(
        this: BotEventContainer,
        getComponentId: ComponentIdFactory,
    ): APIComponentInContainer[] | Promise<APIComponentInContainer[]>;
}

export interface BotSectionedMenuOptions<
    T extends Record<string, BotSectionedMenuSection>,
> {
    menuId: string;
    select?: Pick<APIStringSelectComponent, 'placeholder'>;
    sections: T;
}

export interface BotSectionedMenu<
    T extends Record<string, BotSectionedMenuSection>,
> extends BotMenu<keyof T> {
    sectionSelect: BotStatefulInteraction<
        ApiMessageComponentStringSelectInteraction,
        number
    >;
}

export function createBotSectionedMenu<
    T extends Record<string, BotSectionedMenuSection>,
>({
    menuId,
    select,
    sections,
}: BotSectionedMenuOptions<T>): BotSectionedMenu<T> {
    const menu = createBotMenu<keyof T>({
        async build(getComponentId, sectionName) {
            const componentId = getComponentId();

            const section =
                (typeof sectionName === 'undefined'
                    ? undefined
                    : await sections[sectionName]?.build.bind(this)(
                          getComponentId,
                      )) ?? [];

            return [
                ...section,
                {
                    type: ComponentType.Separator,
                },
                {
                    type: ComponentType.ActionRow,
                    components: [sectionSelect.stateful(componentId)],
                    id: componentId,
                },
            ];
        },
    });

    const sectionSelect = createStatefulInteraction<
        ApiMessageComponentStringSelectInteraction,
        number
    >(intSerializer, {
        data: {
            type: ComponentType.StringSelect,
            custom_id: `${menuId}_${SECTION_SELECT_ID}`,
            options: Object.entries(sections).map(([value, { option }]) => ({
                ...option,
                value,
            })),
            ...select,
        },
        async handler({ data: interaction, api, state: componentId }) {
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
                interaction.data.values[0],
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
        sectionSelect,
    };
}
