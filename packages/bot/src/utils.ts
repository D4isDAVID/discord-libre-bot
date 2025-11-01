import type { Awaitable } from '@discordjs/util';

export type Require<T, K extends keyof T> = T & { [P in K]-?: T[P] };

export type MapUnion<T> = T[keyof T];

export type EventMap<
    T extends string | number | symbol = string | number | symbol,
> = Record<T, unknown[]>;

export interface GenericEventEmitter<T extends EventMap> {
    on<K extends keyof T>(
        eventName: K,
        listener: (...args: T[K]) => Awaitable<unknown>,
    ): GenericEventEmitter<T>;
    once<K extends keyof T>(
        eventName: K,
        listener: (...args: T[K]) => Awaitable<unknown>,
    ): GenericEventEmitter<T>;
}
