import type { APIApplication } from '@discordjs/core';
import type { BotClient } from '../client.ts';

export class BotApplicationCache {
    readonly #client: BotClient;
    #value: APIApplication | undefined = undefined;

    constructor(client: BotClient) {
        this.#client = client;
    }

    async update(): Promise<APIApplication> {
        const application = await this.#client.api.applications.getCurrent();

        this.#value = application;

        return application;
    }

    get(): APIApplication | Promise<APIApplication> {
        if (typeof this.#value !== 'undefined') {
            return this.#value;
        }

        return this.update();
    }
}
