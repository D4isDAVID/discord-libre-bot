import {
    type APIMessageComponentButtonInteraction,
    ButtonStyle,
    ComponentType,
    MessageFlags,
} from '@discordjs/core';
import type { BotInteraction } from '@internal/bot';
import { globalDashboardMenu } from './menu.ts';
import { checkOwner } from './owner.ts';

export const globalDashboardButton = {
    data: {
        type: ComponentType.Button,
        custom_id: 'open_global_dashboard',
        style: ButtonStyle.Primary,
        emoji: { name: '🌐' },
        label: 'Global Dashboard',
    },
    async handler({ data: interaction, api }) {
        await api.interactions.defer(interaction.id, interaction.token, {
            flags: MessageFlags.Ephemeral,
        });

        if (!checkOwner(await this.cache.getApplication(), interaction)) {
            await api.interactions.editReply(
                interaction.application_id,
                interaction.token,
                {
                    content: "You can't use this.",
                },
            );

            return;
        }

        const components = await globalDashboardMenu.build();

        await api.interactions.editReply(
            interaction.application_id,
            interaction.token,
            {
                flags: MessageFlags.IsComponentsV2,
                components: [
                    {
                        type: ComponentType.Container,
                        components,
                    },
                ],
            },
        );
    },
} satisfies BotInteraction<APIMessageComponentButtonInteraction>;
