import {
    type APIComponentInContainer,
    type APIInteraction,
    type APIMessageComponentInteraction,
    type APIMessageTopLevelComponent,
    type APIModalSubmitInteraction,
    ComponentType,
} from '@discordjs/core';
import type { Awaitable } from '@discordjs/util';
import { mapObject } from '@internal/util';
import type { BotEventContainer } from '../../../events/event.ts';
import type { InteractionData } from '../../data/index.ts';
import type { GenericBotInteraction } from '../../interaction.ts';

export interface BotMenu<Interaction extends APIInteraction> {
    build(options: {
        container: BotEventContainer;
        interaction: Interaction;
    }): Awaitable<APIMessageTopLevelComponent[]>;
    messageComponents: GenericBotInteraction<APIMessageComponentInteraction>[];
    modals: GenericBotInteraction<APIModalSubmitInteraction>[];
}

export type BotMenuOptions<
    Interaction extends APIInteraction,
    Components extends string,
    Modals extends string,
> = {
    build(
        this: BotEventContainer,
        options: {
            interaction: Interaction;
            messageComponents: Record<
                Components,
                InteractionData<APIMessageComponentInteraction>
            >;
        },
    ): Awaitable<APIComponentInContainer[]>;
    messageComponents: Record<
        Components,
        | ((
              modals: Record<
                  Modals,
                  InteractionData<APIModalSubmitInteraction>
              >,
          ) => GenericBotInteraction<APIMessageComponentInteraction>)
        | GenericBotInteraction<APIMessageComponentInteraction>
    >;
    modals: Record<Modals, GenericBotInteraction<APIModalSubmitInteraction>>;
};

export function createBotMenu<
    Interaction extends APIInteraction,
    Components extends string,
    Modals extends string,
>({
    build,
    messageComponents,
    modals,
}: BotMenuOptions<Interaction, Components, Modals>): BotMenu<Interaction> {
    const modalData = mapObject(modals, (m) => m.data);
    const messageComponentData = mapObject(messageComponents, (c) =>
        typeof c === 'function' ? c(modalData).data : c.data,
    );

    return {
        async build({ container, interaction }) {
            return [
                {
                    type: ComponentType.Container,
                    components: await build.bind(container)({
                        interaction,
                        messageComponents: messageComponentData,
                    }),
                },
            ];
        },
        messageComponents: Object.values(messageComponents),
        modals: Object.values(modals),
    };
}
