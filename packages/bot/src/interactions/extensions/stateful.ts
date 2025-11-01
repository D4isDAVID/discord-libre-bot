import type {
    APIMessageComponentInteraction,
    APIModalSubmitInteraction,
    ToEventProps,
} from '@discordjs/core';
import type { Awaitable } from '@discordjs/util';
import type { BotEventContainer } from '../../events/event.ts';
import type { BotInteraction } from '../interaction.ts';

type ApiStatefulInteraction =
    | APIMessageComponentInteraction
    | APIModalSubmitInteraction;

export interface BotStatefulInteraction<T extends ApiStatefulInteraction, S>
    extends BotInteraction<T> {
    stateful(state: S): BotInteraction<T>['data'];
}

export function isStatefulInteraction<T extends ApiStatefulInteraction>(
    interaction: BotInteraction<T>,
): interaction is BotStatefulInteraction<T, unknown> {
    return (
        'stateful' in interaction && typeof interaction.stateful === 'function'
    );
}

type CreateStatefulInteractionOptions<T extends ApiStatefulInteraction, S> = {
    data: BotInteraction<T>['data'];
    handler(
        this: BotEventContainer,
        props: ToEventProps<T> & { state: S },
    ): Awaitable<void>;
} & (S extends string
    ? {
          serialize?: never;
          deserialize?: never;
      }
    : {
          serialize(state: S): string;
          deserialize(state: string): S;
      });

export function createStatefulInteraction<
    T extends ApiStatefulInteraction,
    S = string,
>({
    data,
    handler,
    serialize,
    deserialize,
}: CreateStatefulInteractionOptions<T, S>): BotStatefulInteraction<T, S> {
    return {
        data,
        async handler(props) {
            const state = props.data.data.custom_id.replace(data.custom_id, '');
            await handler.bind(this)({
                ...props,
                state: deserialize?.(state) ?? (state as S),
            });
        },
        stateful(state) {
            const newData = structuredClone(data);
            newData.custom_id += serialize?.(state) ?? state;
            return newData;
        },
    } satisfies BotStatefulInteraction<T, S>;
}
