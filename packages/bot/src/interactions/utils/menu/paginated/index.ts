import { type APIInteraction, ComponentType } from '@discordjs/core';
import type { Awaitable } from '@discordjs/util';
import { type BotMenuOptions, createBotMenu } from '../base.ts';

export interface PaginatedBotMenuOptions<
    Interaction extends APIInteraction,
    Components extends string,
    Modals extends string,
> extends BotMenuOptions<Interaction, Components, Modals> {
    getPageCount(): Awaitable<number>;
}

export function createPaginatedBotMenu<
    Interaction extends APIInteraction,
    Components extends string,
    Modals extends string,
>({
    build,
    messageComponents,
    modals,
}: PaginatedBotMenuOptions<Interaction, Components, Modals>) {
    return createBotMenu<Interaction, Components, Modals>({
        async build(options) {
            return [
                ...(await build.bind(this)(options)),
                {
                    type: ComponentType.Separator,
                },
                {
                    type: ComponentType.Separator,
                },
            ];
        },
        messageComponents,
        modals,
    });
}
