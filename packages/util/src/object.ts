export type Require<T, K extends keyof T> = T & { [P in K]-?: T[P] };

export type MapUnion<T> = T[keyof T];

export type RecordWithKeys<K extends PropertyKey, V, S extends K> = Partial<
    Record<S, V>
> &
    Record<K, V>;

export function mapObject<O extends Record<PropertyKey, unknown>, R>(
    obj: O,
    map: (value: O[keyof O], key: keyof O) => R,
): Record<keyof O, R> {
    return Object.fromEntries(
        Object.entries(obj).map(([key, value]) => [
            key,
            map(value as O[keyof O], key as keyof O),
        ]),
    ) as Record<keyof O, R>;
}
