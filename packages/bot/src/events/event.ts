import type { MappedEvents, ToEventProps } from '@discordjs/core';
import type { RestEventsMap } from '@discordjs/rest';
import type { WebSocketShardEventsMap } from '@discordjs/ws';
import type { EventMap, Logger, MapUnion } from '@internal/common';
import type { Repositories } from '@internal/data';
import type { BotCache } from '../cache/index.ts';
import type { BotClient } from '../client.ts';
import type { BotFeatureHandler } from '../features.ts';
import type { BotLogic } from '../logic/index.ts';
import type {
    EventIntents,
    IntentBasedEvent,
    IntentBasedEventData,
} from './intent-data.ts';

export interface BotEventContainer {
    logger: Logger;
    client: BotClient;
    cache: BotCache;
    db: Repositories;
    features: BotFeatureHandler;
    logic: BotLogic;
}

interface BaseBotEvent<T extends PropertyKey> {
    name: T;
    once?: boolean;
}

export interface BotEvent<T extends PropertyKey, M extends EventMap<T>>
    extends BaseBotEvent<T> {
    handler(this: BotEventContainer, ...args: M[T]): void | Promise<void>;
}

export type BotRestEvent<T extends keyof RestEventsMap> = BotEvent<
    T,
    RestEventsMap
>;

export type BotWebSocketEvent<T extends keyof WebSocketShardEventsMap> =
    BotEvent<T, WebSocketShardEventsMap>;

export type BotGatewayDispatchEvent<T extends keyof MappedEvents> = BotEvent<
    T,
    MappedEvents
>;

export type BotIntentBasedGatewayDispatchEvent<
    Event extends IntentBasedEvent,
    Intent extends EventIntents<Event>,
> = BaseBotEvent<Event> & {
    intents: Intent;
    handler(
        this: BotEventContainer,
        ...args: [ToEventProps<IntentBasedEventData[Event][Intent]>]
    ): void | Promise<void>;
};

export type GenericBotEvent<
    T extends PropertyKey,
    M extends EventMap<T>,
> = MapUnion<{
    [K in T]: BotEvent<K, M>;
}>;

export type GenericBotRestEvent<
    T extends keyof RestEventsMap = keyof RestEventsMap,
> = GenericBotEvent<T, RestEventsMap>;

export type GenericBotWebSocketRestEvent<
    T extends keyof WebSocketShardEventsMap = keyof WebSocketShardEventsMap,
> = GenericBotEvent<T, WebSocketShardEventsMap>;

export type GenericBotGatewayDispatchEvent<
    T extends keyof MappedEvents = keyof MappedEvents,
> = GenericBotEvent<T, MappedEvents>;

export type GenericBotIntentBasedGatewayDispatchEvent<
    Event extends IntentBasedEvent = IntentBasedEvent,
    Intent extends EventIntents<Event> = EventIntents<Event>,
> = MapUnion<{
    [K in Event]: BotIntentBasedGatewayDispatchEvent<K, Intent>;
}>;

export function isBotIntentBasedGatewayDispatchEvent<
    Event extends IntentBasedEvent,
    Intent extends EventIntents<Event>,
>(
    event: BaseBotEvent<PropertyKey>,
): event is GenericBotIntentBasedGatewayDispatchEvent<Event, Intent> {
    return 'intents' in event;
}
