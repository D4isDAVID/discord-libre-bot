import {
    type ManagerShardEventsMap,
    WebSocketShardEvents,
} from '@discordjs/ws';
import type { BotClient } from '../client.ts';

export class BotPingCache {
    readonly #client: BotClient;
    readonly #value = new Map<number, number>();

    constructor(client: BotClient) {
        this.#client = client;
    }

    setup() {
        this.#client.gateway.on(
            WebSocketShardEvents.HeartbeatComplete,
            ({ latency }, shardId) => {
                this.#value.set(shardId, latency);
            },
        );
    }

    get(shardId: number): number | Promise<number> {
        const ping = this.#value.get(shardId);

        if (typeof ping !== 'undefined') {
            return ping;
        }

        return new Promise((resolve) => {
            const listener = (
                ...[
                    { latency },
                    eventShardId,
                ]: ManagerShardEventsMap[WebSocketShardEvents.HeartbeatComplete]
            ) => {
                if (eventShardId !== shardId) {
                    return;
                }

                this.#client.gateway.off(
                    WebSocketShardEvents.HeartbeatComplete,
                    listener,
                );

                resolve(latency);
            };

            this.#client.gateway.on(
                WebSocketShardEvents.HeartbeatComplete,
                listener,
            );
        });
    }
}
