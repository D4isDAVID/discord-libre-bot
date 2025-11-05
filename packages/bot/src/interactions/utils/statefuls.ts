import type { StatefulInteractionSerializer } from '../extensions/stateful.ts';

export const stringSerializer: StatefulInteractionSerializer<string> = {
    serialize(state) {
        return state;
    },
    deserialize(state) {
        return state;
    },
};

export const intSerializer: StatefulInteractionSerializer<number> = {
    serialize(state) {
        return `${state}`;
    },
    deserialize(state) {
        return Number.parseInt(state);
    },
};

export function arraySerializer<
    S extends StatefulInteractionSerializer<unknown>[],
    R extends {
        [K in keyof S]: S[K] extends StatefulInteractionSerializer<infer T>
            ? T
            : never;
    },
>(...serializers: S): StatefulInteractionSerializer<R> {
    const delimiter = '_';

    return {
        serialize(state) {
            if (state.length !== serializers.length) {
                throw new Error(
                    `unexpected size for state array (expected: ${serializers.length}, received: ${state.length})`,
                );
            }

            return state
                .map((s, i) => {
                    const serialize = serializers[i]?.serialize;
                    return serialize ? serialize(s) : s;
                })
                .join(delimiter);
        },
        deserialize(state) {
            const splitState = state.split(delimiter);

            if (splitState.length !== serializers.length) {
                throw new Error(
                    `unexpected size for state array (expected: ${serializers.length}, received: ${splitState.length})`,
                );
            }

            return splitState.map((s, i) => {
                const deserialize = serializers[i]?.deserialize;
                return deserialize ? deserialize(s) : s;
            }) as R;
        },
    };
}
