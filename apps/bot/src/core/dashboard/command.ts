import {
    type APIChatInputApplicationCommandInteraction,
    type APIMessageTopLevelComponent,
    ApplicationCommandType,
    ComponentType,
    MessageFlags,
} from '@discordjs/core';
import type { BotInteraction } from '@internal/bot';
import { globalDashboardButton } from './global/button.ts';
import { checkOwner } from './global/owner.ts';

export const dashboardCommand = {
    data: {
        type: ApplicationCommandType.ChatInput,
        name: 'dashboard',
        description: 'Configure the bot.',
    },
    async handler({ data: interaction, api }) {
        await api.interactions.defer(interaction.id, interaction.token, {
            flags: MessageFlags.Ephemeral,
        });

        const components: APIMessageTopLevelComponent[] = [
            {
                type: ComponentType.TextDisplay,
                content: 'lel',
            },
        ];

        if (checkOwner(await this.cache.getApplication(), interaction)) {
            components.push({
                type: ComponentType.ActionRow,
                components: [globalDashboardButton.data],
            });
        }

        await api.interactions.editReply(
            interaction.application_id,
            interaction.token,
            {
                flags: MessageFlags.IsComponentsV2,
                components,
            },
        );
    },
} satisfies BotInteraction<APIChatInputApplicationCommandInteraction>;
