import { inspect } from 'node:util';
import type { MappedEvents, ToEventProps } from '@discordjs/core';
import type { RestEventsMap } from '@discordjs/rest';
import type { WebSocketShardEventsMap } from '@discordjs/ws';
import type {
    EventMap,
    GenericEventEmitter,
    Logger,
    MapUnion,
} from '@internal/common';
import type { Repositories } from '@internal/data';
import type { BotCache } from '../cache/index.ts';
import type { BotClient } from '../client.ts';
import type { BotFeatureHandler } from '../features.ts';
import type { BotLogic } from '../logic/index.ts';
import {
    type BotEvent,
    type BotEventContainer,
    type GenericBotEvent,
    type GenericBotGatewayDispatchEvent,
    type GenericBotIntentBasedGatewayDispatchEvent,
    type GenericBotRestEvent,
    type GenericBotWebSocketRestEvent,
    isBotIntentBasedGatewayDispatchEvent,
} from './event.ts';
import type { IntentBasedEvent, IntentBasedEventData } from './intent-data.ts';
import { getEventIntentPredicate } from './intent-predicates.ts';
import { gatewayDispatchEventIntents } from './intents.ts';

export interface BotEvents {
    rest: GenericBotRestEvent[];
    ws: GenericBotWebSocketRestEvent[];
    gatewayDispatch: GenericBotGatewayDispatchEvent[];
}

export interface BotEventHandlerOptions {
    logger: Logger;
    client: BotClient;
    cache: BotCache;
    db: Repositories;
    features: BotFeatureHandler;
    logic: BotLogic;
}

type Listeners<T extends PropertyKey> = {
    name: T;
    listener: OmitThisParameter<BotEvent<T, EventMap<T>>['handler']>;
}[];

export interface BotEventListeners {
    rest: Listeners<keyof RestEventsMap>;
    ws: Listeners<keyof WebSocketShardEventsMap>;
    gatewayDispatch: Listeners<keyof MappedEvents>;
}

export class BotEventHandler {
    readonly #logger: Logger;
    readonly #client: BotClient;
    readonly #cache: BotCache;
    readonly #db: Repositories;
    readonly #features: BotFeatureHandler;
    readonly #logic: BotLogic;

    #intents = 0;

    constructor({
        logger,
        client,
        cache,
        db,
        features,
        logic,
    }: BotEventHandlerOptions) {
        this.#logger = logger;
        this.#client = client;
        this.#cache = cache;
        this.#db = db;
        this.#features = features;
        this.#logic = logic;
    }

    get intents() {
        return this.#intents;
    }

    enable(listeners: BotEventListeners) {
        for (const event of listeners.rest) {
            this.#client.rest.on(event.name, event.listener);
        }

        for (const event of listeners.ws) {
            this.#client.gateway.on(event.name, event.listener);
        }

        for (const event of listeners.gatewayDispatch) {
            this.#client.on(event.name, event.listener);
        }
    }

    disable(listeners: BotEventListeners) {
        for (const event of listeners.rest) {
            this.#client.rest.off(event.name, event.listener);
        }

        for (const event of listeners.ws) {
            this.#client.gateway.off(event.name, event.listener);
        }

        for (const event of listeners.gatewayDispatch) {
            this.#client.off(event.name, event.listener);
        }
    }

    bind({
        rest = [],
        ws = [],
        gatewayDispatch = [],
    }: Partial<BotEvents>): BotEventListeners {
        this.#updateIntents(gatewayDispatch);

        return {
            rest: this.#bindAll(this.#client.rest, rest),
            ws: this.#bindAll(this.#client.gateway, ws),
            gatewayDispatch: this.#bindAll(this.#client, gatewayDispatch),
        };
    }

    #updateIntents(events: GenericBotGatewayDispatchEvent[]) {
        for (const event of events) {
            if (isBotIntentBasedGatewayDispatchEvent(event)) {
                this.#intents |= event.intents;
                continue;
            }

            this.#intents |= gatewayDispatchEventIntents[event.name];
        }
    }

    #bindAll<T extends PropertyKey>(
        emitter: GenericEventEmitter<EventMap<T>>,
        events: GenericBotEvent<T, EventMap<T>>[],
    ) {
        const listeners: Listeners<T> = [];

        for (const event of events) {
            const listener = this.#bind(event);

            if (event.once) {
                emitter.once(event.name, listener);
                continue;
            }

            listeners.push({ name: event.name, listener });
        }

        return listeners;
    }

    #bind<T extends PropertyKey>(event: GenericBotEvent<T, EventMap<T>>) {
        this.#logger.trace('binding event listener', {
            name: event.name,
            once: event.once ?? false,
        });

        const logger = this.#logger.child({ event: event.name.toString() });
        const container: BotEventContainer = {
            logger,
            client: this.#client,
            cache: this.#cache,
            db: this.#db,
            features: this.#features,
            logic: this.#logic,
        };
        const handler = event.handler.bind(container);

        async function listener(...args: EventMap<T>[T]) {
            logger.trace('event handled');

            try {
                await handler(...args);
            } catch (err) {
                logger.error(`unhandled error in handler: ${inspect(err)}`);
            }
        }

        if (isBotIntentBasedGatewayDispatchEvent(event)) {
            return this.#wrapPredicate(
                event,
                container,
                listener,
            ) as typeof listener;
        }

        return listener;
    }

    #wrapPredicate<Event extends IntentBasedEvent>(
        event: GenericBotIntentBasedGatewayDispatchEvent<Event>,
        container: BotEventContainer,
        listener: (...args: EventMap<Event>[Event]) => Promise<void>,
    ) {
        const predicate = getEventIntentPredicate(event).bind(container);

        return async (
            ...args: [ToEventProps<MapUnion<IntentBasedEventData[Event]>>]
        ) => {
            if (!predicate(args[0].data)) {
                return;
            }

            await listener(...args);
        };
    }
}
