import { type APIUser, GatewayDispatchEvents } from '@discordjs/core';
import type { BotClient } from '../client.ts';

export class BotUserCache {
    readonly #client: BotClient;
    #value: APIUser | undefined = undefined;

    constructor(client: BotClient) {
        this.#client = client;
    }

    setup() {
        this.#client.once(GatewayDispatchEvents.Ready, ({ data: { user } }) => {
            this.#value = user;
        });

        this.#client.on(GatewayDispatchEvents.UserUpdate, ({ data: user }) => {
            this.#value = user;
        });
    }

    get() {
        return this.#value;
    }
}
