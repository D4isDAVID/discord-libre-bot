import type { Repositories } from '@internal/data';
import type { Logger } from '@internal/logger';
import { BotCache } from './cache.ts';
import {
    type BotClient,
    type CreateBotClientOptions,
    createBotClient,
} from './client.ts';
import { BotEventHandler } from './events/handler.ts';
import { BotFeatureHandler } from './features.ts';
import { BotInteractionHandler } from './interactions/handler.ts';

export interface BotOptions {
    logger: Logger;
    db: Repositories;
    client: CreateBotClientOptions;
}

export class Bot {
    #logger: Logger;
    client: BotClient;

    cache: BotCache;
    features: BotFeatureHandler;

    constructor({ logger, db, client }: BotOptions) {
        this.#logger = logger;
        this.client = createBotClient(client);

        this.cache = new BotCache({ client: this.client });
        this.features = new BotFeatureHandler({
            events: new BotEventHandler({
                logger: this.#logger.child('events'),
                db,
                client: this.client,
                cache: this.cache,
            }),
            interactions: new BotInteractionHandler({
                logger: this.#logger.child('interactions'),
                db,
                client: this.client,
                cache: this.cache,
            }),
        });
    }

    async start(): Promise<void> {
        this.#logger.info('connecting to Discord');

        this.features.interactions.registerInteractionCreateListener();
        await this.features.interactions.deployCommands();

        await this.client.gateway
            .connect()
            .then(() => {
                this.#logger.info('successfully connected to Discord');
            })
            .catch((err) => {
                this.#logger.fatal('failed to connect to Discord');
                throw err;
            });
    }
}
