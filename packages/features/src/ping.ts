import type { APIChatInputApplicationCommandInteraction } from '@discordjs/core';
import { inlineCode } from '@discordjs/formatters';
import type { BotFeature, BotInteraction } from '@internal/bot';

function pingMessage(ping: string) {
    return `🏓 Pong! ${inlineCode(ping)}`;
}

const pingCommand: BotInteraction<APIChatInputApplicationCommandInteraction> = {
    data: {
        name: 'ping',
        description: "Check out the bot's ping",
    },
    async handler({ data: interaction, api }) {
        const ping = this.cache.ping;
        const isPromise = ping instanceof Promise;

        if (isPromise) {
            await api.interactions.reply(interaction.id, interaction.token, {
                content: pingMessage('fetching...'),
            });
        }

        await api.interactions[isPromise ? 'editReply' : 'reply'](
            isPromise ? interaction.application_id : interaction.id,
            interaction.token,
            {
                content: pingMessage(`${await ping}ms`),
            },
        );
    },
};

export const pingFeature: BotFeature = {
    interactions: {
        commands: [pingCommand],
    },
};
