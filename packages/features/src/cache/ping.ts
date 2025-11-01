import { WebSocketShardEvents } from '@discordjs/ws';
import type { BotWebSocketEvent } from '@internal/bot';

export const heartbeatCompleteEvent = {
    name: WebSocketShardEvents.HeartbeatComplete,
    handler({ latency }) {
        this.cache.ping = latency;
    },
} satisfies BotWebSocketEvent<WebSocketShardEvents.HeartbeatComplete>;
