import {
    type APIChatInputApplicationCommandInteraction,
    MessageFlags,
} from '@discordjs/core';
import {
    type BotFeature,
    type BotInteraction,
    createPaginatedBotMenu,
} from '@internal/bot';

const exampleMenu = createPaginatedBotMenu({
    getPageCount() {
        return 10;
    },
    buildPage() {
        return [];
    },
});

const exampleMenuCommand = {
    data: {
        name: 'examplemenu',
        description: 'Show an example menu',
    },
    async handler({ data: interaction, api }) {
        await api.interactions.defer(interaction.id, interaction.token);

        const container = await exampleMenu.build();

        await api.interactions.editReply(
            interaction.application_id,
            interaction.token,
            {
                flags: MessageFlags.IsComponentsV2,
                components: [container],
            },
        );
    },
} satisfies BotInteraction<APIChatInputApplicationCommandInteraction>;

export const exampleFeature: BotFeature = {
    interactions: {
        commands: [exampleMenuCommand],
        messageComponents: exampleMenu.messageComponents,
    },
};
