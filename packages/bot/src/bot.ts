import { inspect } from 'node:util';
import type { Logger } from '@internal/common';
import type { Repositories } from '@internal/data';
import { BotCache } from './cache/index.ts';
import {
    type BotClient,
    type CreateBotClientOptions,
    createBotClient,
} from './client.ts';
import { BotFeatureHandler } from './features.ts';

export interface BotOptions {
    logger: Logger;
    client: CreateBotClientOptions;
    db: Repositories;
}

export class Bot {
    readonly #logger: Logger;
    readonly #client: BotClient;
    readonly #cache: BotCache;
    readonly features: BotFeatureHandler;

    constructor({ logger, client, db }: BotOptions) {
        this.#logger = logger;
        this.#client = createBotClient(client);
        this.#cache = new BotCache({ client: this.#client });
        this.features = new BotFeatureHandler({
            logger: this.#logger,
            client: this.#client,
            cache: this.#cache,
            db,
        });
    }

    async start(): Promise<boolean> {
        this.#logger.info('setting up');

        await this.#cache.setup();
        await this.features.setup();

        this.#logger.info('connecting to Discord');

        return await this.#client.gateway
            .connect()
            .then(() => {
                this.#logger.info('successfully connected to Discord');

                return true;
            })
            .catch((err) => {
                this.#logger.fatal(
                    `failed to connect to Discord: ${inspect(err)}`,
                );

                return false;
            });
    }
}
