import {
    ActivityType,
    GatewayDispatchEvents,
    PresenceUpdateStatus,
} from '@discordjs/core';
import type { BotFeature, BotGatewayDispatchEvent } from '@internal/bot';

const readyEvent: BotGatewayDispatchEvent<GatewayDispatchEvents.Ready> = {
    name: GatewayDispatchEvents.Ready,
    once: true,
    async handler({ data: bot, shardId }) {
        await this.client.updatePresence(shardId, {
            activities: [
                {
                    type: ActivityType.Playing,
                    name: 'Libre Bot 🕊️',
                },
            ],
            status: PresenceUpdateStatus.Online,
            afk: false,
            since: null,
        });

        this.logger.info(
            `ready as ${bot.user.username}#${bot.user.discriminator}`,
        );
    },
};

export const statusFeature: BotFeature = {
    events: {
        gatewayDispatch: [readyEvent],
    },
};
