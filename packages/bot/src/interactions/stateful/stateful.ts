import type {
    APIMessageComponentInteraction,
    APIModalSubmitInteraction,
    ToEventProps,
} from '@discordjs/core';
import type { BotEventContainer } from '../../events/index.ts';
import type { BotInteraction, GenericBotInteraction } from '../interaction.ts';

export type ApiStatefulInteraction =
    | APIMessageComponentInteraction
    | APIModalSubmitInteraction;

export interface BotStatefulInteraction<T extends ApiStatefulInteraction, S>
    extends BotInteraction<T> {
    stateful(state: S): BotInteraction<T>['data'];
}

export type GenericBotStatefulInteraction<T, S> =
    T extends ApiStatefulInteraction
        ? GenericBotInteraction<T> & BotStatefulInteraction<T, S>['stateful']
        : never;

export function isStatefulInteraction<T extends ApiStatefulInteraction>(
    interaction: GenericBotInteraction<T>,
): interaction is GenericBotStatefulInteraction<T, unknown> {
    return (
        'stateful' in interaction && typeof interaction.stateful === 'function'
    );
}

export interface StatefulInteractionSerializer<S> {
    serialize(state: S): string;
    deserialize(state: string): S;
}

export interface StatefulInteractionOptions<
    T extends ApiStatefulInteraction,
    S,
> {
    data: BotInteraction<T>['data'];
    handler(
        this: BotEventContainer,
        props: ToEventProps<T> & { state: S },
    ): void | Promise<void>;
}

export function createStatefulInteraction<T extends ApiStatefulInteraction, S>(
    { serialize, deserialize }: StatefulInteractionSerializer<S>,
    { data, handler }: StatefulInteractionOptions<T, S>,
): BotStatefulInteraction<T, S> {
    return {
        data,
        async handler(props) {
            const state = props.data.data.custom_id.replace(data.custom_id, '');

            await handler.bind(this)({
                ...props,
                state: deserialize(state),
            });
        },
        stateful(state) {
            const newData = structuredClone(data);

            newData.custom_id += serialize(state);

            return newData;
        },
    };
}
