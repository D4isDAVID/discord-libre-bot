import type { Database } from '@internal/data';
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
    client: CreateBotClientOptions;
    db: Database;
}

export class Bot {
    #logger: Logger;
    client: BotClient;

    cache: BotCache;
    features: BotFeatureHandler;

    constructor({ logger, client, db }: BotOptions) {
        this.#logger = logger;
        this.client = createBotClient(client);

        this.cache = new BotCache({ client: this.client });
        this.features = new BotFeatureHandler({
            events: new BotEventHandler({
                client: this.client,
                logger: this.#logger.child('events'),
                cache: this.cache,
                db,
            }),
            interactions: new BotInteractionHandler({
                client: this.client,
                logger: this.#logger.child('interactions'),
                cache: this.cache,
                db,
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
