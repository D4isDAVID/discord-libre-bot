import { once } from 'node:events';
import { WebSocketShardEvents } from '@discordjs/ws';
import type { BotClient } from './client.ts';

export interface BotCacheOptions {
    client: BotClient;
}

export class BotCache {
    #client: BotClient;

    #ping: number | undefined;

    constructor({ client }: BotCacheOptions) {
        this.#client = client;
    }

    get ping(): number | Promise<number> {
        if (this.#ping == null) {
            return once(
                this.#client.gateway,
                WebSocketShardEvents.HeartbeatComplete,
            ).then(([{ latency }]) => latency);
        }

        return this.#ping;
    }

    set ping(ping: number) {
        this.#ping = ping;
    }
}
