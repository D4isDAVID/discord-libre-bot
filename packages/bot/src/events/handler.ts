import { inspect } from 'node:util';
import type { Repositories } from '@internal/data';
import type { Logger } from '@internal/logger';
import type { GenericEventEmitter } from '@internal/util';
import type { BotCache } from '../cache.ts';
import type { BotClient } from '../client.ts';
import type {
    GenericBotEvent,
    GenericBotGatewayDispatchEvent,
    GenericBotRestEvent,
    GenericBotWebSocketEvent,
} from './event.ts';
import { gatewayDispatchEventIntents } from './intents.ts';

export interface BotEvents {
    rest: GenericBotRestEvent[];
    ws: GenericBotWebSocketEvent[];
    gatewayDispatch: GenericBotGatewayDispatchEvent[];
}

export interface BotEventHandlerOptions {
    logger: Logger;
    db: Repositories;
    client: BotClient;
    cache: BotCache;
}

export class BotEventHandler {
    #logger: Logger;
    #db: Repositories;
    #client: BotClient;
    #cache: BotCache;

    #intents = 0;

    constructor({ logger, db, client, cache }: BotEventHandlerOptions) {
        this.#logger = logger;
        this.#db = db;
        this.#client = client;
        this.#cache = cache;
    }

    get intents(): number {
        return this.#intents;
    }

    register({ rest = [], ws = [], gatewayDispatch = [] }: Partial<BotEvents>) {
        this.#register(this.#client.rest, rest);
        this.#register(this.#client.gateway, ws);
        this.#register(this.#client, gatewayDispatch);
        this.#updateIntents(gatewayDispatch);
    }

    #updateIntents(events: GenericBotGatewayDispatchEvent[]) {
        for (const event of events) {
            this.#intents |=
                event.intents ?? gatewayDispatchEventIntents[event.name];
        }
    }

    #register<K extends string, T extends Record<K, unknown[]>>(
        emitter: GenericEventEmitter<T>,
        events: GenericBotEvent<K, T>[],
    ) {
        for (const event of events) {
            this.#logger.trace('adding event handler', {
                name: event.name,
                once: event.once ?? false,
            });

            const logger = this.#logger.child(event.name);
            const handler = event.handler.bind({
                logger,
                db: this.#db,
                client: this.#client,
                cache: this.#cache,
            });

            emitter[event.once ? 'once' : 'on'](event.name, async (...args) => {
                logger.trace('event handled');
                try {
                    await handler(...args);
                } catch (err) {
                    logger.error(`unhandled error in handler: ${inspect(err)}`);
                }
            });
        }
    }
}
