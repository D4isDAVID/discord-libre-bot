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
} from '../../stateful/index.ts';
import {
    type BotMenu,
    type ComponentIdFactory,
    createBotMenu,
} from './base.ts';

const FIRST_PAGE = 1;
const GO_TO_FIRST_PAGE = FIRST_PAGE - 2;
const GO_TO_LAST_PAGE = GO_TO_FIRST_PAGE - 1;
const PAGE_BUTTON_ID = 'page';

export interface BotPaginatedMenuOptions {
    menuId: string;
    getPageCount(this: BotEventContainer): number | Promise<number>;
    buildEmpty(
        this: BotEventContainer,
        getComponentId: ComponentIdFactory,
    ): APIComponentInContainer[] | Promise<APIComponentInContainer[]>;
    buildPage(
        this: BotEventContainer,
        getComponentId: ComponentIdFactory,
        page: number,
    ): APIComponentInContainer[] | Promise<APIComponentInContainer[]>;
}

export interface BotPaginatedMenu extends BotMenu<number> {
    pageButton: BotStatefulInteraction<
        APIMessageComponentButtonInteraction,
        [number, number]
    >;
}

export function createBotPaginatedMenu({
    menuId,
    getPageCount,
    buildEmpty,
    buildPage,
}: BotPaginatedMenuOptions): BotPaginatedMenu {
    const menu = createBotMenu<number>({
        async build(getComponentId, rawPage = FIRST_PAGE) {
            const componentId = getComponentId();

            const pageCount = await getPageCount.bind(this)();
            let page: number;

            switch (rawPage) {
                case GO_TO_FIRST_PAGE: {
                    page = FIRST_PAGE;
                    break;
                }
                case GO_TO_LAST_PAGE: {
                    page = pageCount;
                    break;
                }
                default: {
                    page = Math.max(FIRST_PAGE, Math.min(rawPage, pageCount));
                    break;
                }
            }

            const components =
                pageCount <= 0
                    ? await buildEmpty.bind(this)(getComponentId)
                    : await buildPage.bind(this)(getComponentId, page);

            return [
                ...components,
                {
                    type: ComponentType.Separator,
                    id: componentId,
                },
                {
                    type: ComponentType.TextDisplay,
                    content: `Page ${page}/${pageCount}`,
                },
                {
                    type: ComponentType.ActionRow,
                    components: [
                        {
                            ...pageButton.stateful([
                                componentId,
                                GO_TO_FIRST_PAGE,
                            ]),
                            label: 'First',
                            emoji: { name: '⏮️' },
                            disabled: page <= FIRST_PAGE,
                        },
                        {
                            ...pageButton.stateful([componentId, page - 1]),
                            label: 'Previous',
                            emoji: { name: '◀️' },
                            disabled: page <= FIRST_PAGE,
                        },
                        {
                            ...pageButton.stateful([componentId, page]),
                            label: 'Reload',
                            emoji: { name: '🔄' },
                        },
                        {
                            ...pageButton.stateful([componentId, page + 1]),
                            label: 'Next',
                            emoji: { name: '▶️' },
                            disabled: page >= pageCount,
                        },
                        {
                            ...pageButton.stateful([
                                componentId,
                                GO_TO_LAST_PAGE,
                            ]),
                            label: 'Last',
                            emoji: { name: '⏭️' },
                            disabled: page >= pageCount,
                        },
                    ],
                },
            ];
        },
    });

    const pageButton = createStatefulInteraction<
        APIMessageComponentButtonInteraction,
        [number, number]
    >(arraySerializer(intSerializer, intSerializer), {
        data: {
            type: ComponentType.Button,
            custom_id: `${menuId}_${PAGE_BUTTON_ID}`,
            style: ButtonStyle.Primary,
        },
        async handler({ data: interaction, api, state: [componentId, page] }) {
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
                page,
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
        pageButton,
    };
}
