export type EventMap<T extends PropertyKey = PropertyKey> = Record<
    T,
    unknown[]
>;

export interface GenericEventEmitter<T extends EventMap> {
    on<K extends keyof T>(
        eventName: K,
        listener: (...args: T[K]) => unknown,
    ): GenericEventEmitter<T>;
    once<K extends keyof T>(
        eventName: K,
        listener: (...args: T[K]) => unknown,
    ): GenericEventEmitter<T>;
}
