import {
    type APIActionRowComponent,
    type APIButtonComponentWithCustomId,
    type APIComponentInContainer,
    type APIComponentInMessageActionRow,
    type APIContainerComponent,
    type APIMessageComponentButtonInteraction,
    type APIMessageComponentInteraction,
    type APISeparatorComponent,
    type APITextDisplayComponent,
    ButtonStyle,
    ComponentType,
    MessageFlags,
} from '@discordjs/core';
import type { Awaitable } from '@discordjs/util';
import type { GenericBotInteraction } from '../../interaction.ts';
import { intSerializer } from '../stateful/serializers.ts';
import { createStatefulInteraction } from '../stateful/stateful.ts';
import type { BotMenu } from './base.ts';

const INITIAL_PAGE = 1;
const FIRST_PAGE = INITIAL_PAGE - 2;
const LAST_PAGE = FIRST_PAGE - 1;
const PAGE_BUTTON_ID = 'page';

export interface PaginatedBotMenuOptions {
    getPageCount(): Awaitable<number>;
    buildPage(page: number): Awaitable<APIComponentInContainer[]>;
}

export interface PaginatedBotMenu extends BotMenu {
    messageComponents: GenericBotInteraction<APIMessageComponentInteraction>[];
}

export function createPaginatedBotMenu({
    getPageCount,
    buildPage,
}: PaginatedBotMenuOptions): PaginatedBotMenu {
    const pageButton = createStatefulInteraction<
        APIMessageComponentButtonInteraction,
        number
    >(intSerializer, {
        data: {
            type: ComponentType.Button,
            custom_id: PAGE_BUTTON_ID,
            style: ButtonStyle.Primary,
        },
        async handler({ data: interaction, api, state }) {
            await api.interactions.deferMessageUpdate(
                interaction.id,
                interaction.token,
            );

            const container = await buildInternal(state);

            await api.interactions.editReply(
                interaction.application_id,
                interaction.token,
                {
                    flags: MessageFlags.IsComponentsV2,
                    components: [container],
                },
            );
        },
    });

    async function buildInternal(
        rawPage: number,
    ): Promise<APIContainerComponent> {
        const pageCount = await getPageCount();
        let page: number;
        switch (rawPage) {
            case FIRST_PAGE: {
                page = INITIAL_PAGE;
                break;
            }
            case LAST_PAGE: {
                page = pageCount;
                break;
            }
            default: {
                page = Math.max(INITIAL_PAGE, Math.min(rawPage, pageCount));
                break;
            }
        }

        return {
            type: ComponentType.Container,
            components: [
                ...(await buildPage(page)),
                {
                    type: ComponentType.Separator,
                } satisfies APISeparatorComponent,
                {
                    type: ComponentType.ActionRow,
                    components: [
                        {
                            ...pageButton.stateful(FIRST_PAGE),
                            label: 'First',
                            emoji: { name: '⏮️' },
                            disabled: page === INITIAL_PAGE,
                        },
                        {
                            ...pageButton.stateful(page - 1),
                            label: 'Previous',
                            emoji: { name: '◀️' },
                            disabled: page === INITIAL_PAGE,
                        },
                        {
                            ...pageButton.stateful(page),
                            label: 'Reload',
                            emoji: { name: '🔄' },
                        },
                        {
                            ...pageButton.stateful(page + 1),
                            label: 'Next',
                            emoji: { name: '▶️' },
                            disabled: page === pageCount,
                        },
                        {
                            ...pageButton.stateful(LAST_PAGE),
                            label: 'Last',
                            emoji: { name: '⏭️' },
                            disabled: page === pageCount,
                        },
                    ] satisfies APIButtonComponentWithCustomId[],
                } satisfies APIActionRowComponent<APIComponentInMessageActionRow>,
                {
                    type: ComponentType.TextDisplay,
                    content: `Page ${page}/${pageCount}`,
                } satisfies APITextDisplayComponent,
            ],
        };
    }

    return {
        build() {
            return buildInternal(INITIAL_PAGE);
        },
        messageComponents: [pageButton],
    };
}
