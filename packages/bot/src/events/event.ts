import type { MappedEvents } from '@discordjs/core';
import type { RestEventsMap } from '@discordjs/rest';
import type { Awaitable } from '@discordjs/util';
import type { WebSocketShardEventsMap } from '@discordjs/ws';
import type { Repositories } from '@internal/data';
import type { Logger } from '@internal/logger';
import type { EventMap, MapUnion } from '@internal/util';
import type { BotCache } from '../cache.ts';
import type { BotClient } from '../client.ts';
import type {
    IntentBasedEventData,
    IntentBasedMappedEvents,
} from './intent-based/index.ts';

export interface BotEventContainer {
    logger: Logger;
    db: Repositories;
    client: BotClient;
    cache: BotCache;
}

interface BaseBotEvent<T extends PropertyKey> {
    name: T;
    once?: boolean;
}

export interface BotEvent<T extends PropertyKey, M extends EventMap<T>>
    extends BaseBotEvent<T> {
    handler(this: BotEventContainer, ...args: M[T]): Awaitable<void>;
}
export type GenericBotEvent<
    T extends PropertyKey,
    M extends EventMap<T>,
> = MapUnion<{
    [K in T]: BotEvent<K, M>;
}>;

export type BotRestEvent<T extends keyof RestEventsMap> = BotEvent<
    T,
    RestEventsMap
>;
export type GenericBotRestEvent<
    T extends keyof RestEventsMap = keyof RestEventsMap,
> = MapUnion<{
    [K in T]: BotRestEvent<K>;
}>;

export type BotWebSocketEvent<T extends keyof WebSocketShardEventsMap> =
    BotEvent<T, WebSocketShardEventsMap>;
export type GenericBotWebSocketEvent<
    T extends keyof WebSocketShardEventsMap = keyof WebSocketShardEventsMap,
> = MapUnion<{
    [K in T]: BotWebSocketEvent<K>;
}>;

type Intent<T extends keyof MappedEvents> = T extends keyof IntentBasedEventData
    ? keyof IntentBasedEventData[T]
    : never;

export type BotGatewayDispatchEvent<
    E extends keyof MappedEvents,
    T extends Intent<E> | undefined = undefined,
> = BaseBotEvent<E> & {
    handler(
        this: BotEventContainer,
        ...args: IntentBasedMappedEvents<E, T>
    ): Awaitable<void>;
} & (T extends number
        ? {
              intents: T;
          }
        : {
              intents?: undefined;
          });
export type GenericBotGatewayDispatchEvent<
    T extends keyof MappedEvents = keyof MappedEvents,
> = MapUnion<{
    [K in T]:
        | BotGatewayDispatchEvent<K>
        | MapUnion<{
              [V in Intent<K>]: BotGatewayDispatchEvent<K, V>;
          }>;
}>;
