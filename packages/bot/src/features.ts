import type { Logger } from '@internal/common';
import type { Repositories } from '@internal/data';
import type { BotCache } from './cache/index.ts';
import type { BotClient } from './client.ts';
import {
    BotEventHandler,
    type BotEventListeners,
    type BotEvents,
} from './events/index.ts';
import {
    BotInteractionHandler,
    type BotInteractionListeners,
    type BotInteractions,
} from './interactions/handler.ts';
import { BotLogic } from './logic/index.ts';

export interface BotFeature {
    name: string;
    events?: Partial<BotEvents>;
    interactions?: Partial<BotInteractions>;
}

export interface BotFeatureHandlerOptions {
    logger: Logger;
    client: BotClient;
    cache: BotCache;
    db: Repositories;
}

interface RegisteredFeature {
    enabled: boolean;
    events: BotEventListeners;
    interactions: BotInteractionListeners;
}

export class BotFeatureHandler {
    readonly #logger: Logger;

    readonly #events: BotEventHandler;
    readonly #interactions: BotInteractionHandler;
    readonly #registry = new Map<string, RegisteredFeature>();

    constructor({ logger, client, cache, db }: BotFeatureHandlerOptions) {
        this.#logger = logger;

        const logic = new BotLogic({ logger, db, features: this });

        this.#events = new BotEventHandler({
            logger,
            client,
            cache,
            db,
            features: this,
            logic,
        });
        this.#interactions = new BotInteractionHandler({
            logger,
            client,
            cache,
            db,
            features: this,
            logic,
        });
    }

    async setup() {
        this.#interactions.setup();
        await this.#interactions.deployCommands();
    }

    get(): Record<string, boolean> {
        return this.#registry.entries().reduce(
            (obj, [name, { enabled }]) => {
                obj[name] = enabled;

                return obj;
            },
            {} as Record<string, boolean>,
        );
    }

    register({ name, events = {}, interactions = {} }: BotFeature) {
        this.#registry.set(name, {
            enabled: false,
            events: this.#events.bind(events),
            interactions: this.#interactions.bind(interactions),
        });
    }

    enable(name: string) {
        const feature = this.#registry.get(name);

        if (typeof feature === 'undefined') {
            this.#logger.warn(
                `attemped enabling unregistered feature '${name}'`,
            );

            return;
        }

        if (feature.enabled) {
            this.#logger.warn(`feature '${name}' is already enabled`);

            return;
        }

        feature.enabled = true;
        this.#events.enable(feature.events);
        this.#interactions.enable(feature.interactions);
    }

    disable(name: string) {
        const feature = this.#registry.get(name);

        if (typeof feature === 'undefined') {
            this.#logger.warn(
                `attemped disabling unregistered feature ${name}`,
            );

            return;
        }

        if (!feature.enabled) {
            this.#logger.warn(`feature '${name}' is already disabled`);

            return;
        }

        this.#events.disable(feature.events);
        this.#interactions.disable(feature.interactions);
        feature.enabled = false;
    }
}
