import {
    type APIChatInputApplicationCommandInteraction,
    ApplicationCommandType,
} from '@discordjs/core';
import { inlineCode } from '@discordjs/formatters';
import type { BotInteraction } from '@internal/bot';

function pingMessage(shardId: number, ping: string) {
    return `🏓 Pong! ${inlineCode(`shard ${shardId}, ${ping}`)}`;
}

export const pingCommand = {
    data: {
        type: ApplicationCommandType.ChatInput,
        name: 'ping',
        description: "Check the bot's ping.",
    },
    async handler({ data: interaction, api, shardId }) {
        const ping = this.cache.getPing(shardId);
        const isPromise = ping instanceof Promise;

        if (isPromise) {
            await api.interactions.reply(interaction.id, interaction.token, {
                content: pingMessage(shardId, 'fetching...'),
            });
        }

        await api.interactions[isPromise ? 'editReply' : 'reply'](
            isPromise ? interaction.application_id : interaction.id,
            interaction.token,
            {
                content: pingMessage(shardId, `${await ping}ms`),
            },
        );
    },
} satisfies BotInteraction<APIChatInputApplicationCommandInteraction>;
