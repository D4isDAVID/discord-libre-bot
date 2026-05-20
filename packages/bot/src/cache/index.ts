import type { BotClient } from '../client.ts';
import { BotApplicationCache } from './application.ts';
import { BotPingCache } from './ping.ts';
import { BotUserCache } from './user.ts';

export interface BotCacheOptions {
    client: BotClient;
}

export class BotCache {
    readonly #application: BotApplicationCache;
    readonly #ping: BotPingCache;
    readonly #user: BotUserCache;

    constructor({ client }: BotCacheOptions) {
        this.#application = new BotApplicationCache(client);
        this.#ping = new BotPingCache(client);
        this.#user = new BotUserCache(client);
    }

    async setup() {
        await this.#application.update();
        this.#ping.setup();
        this.#user.setup();
    }

    getApplication() {
        return this.#application.get();
    }

    getPing(shardId: number) {
        return this.#ping.get(shardId);
    }

    getUser() {
        return this.#user.get();
    }
}
