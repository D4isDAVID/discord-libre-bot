import type {
    APIApplicationCommandAutocompleteDMInteraction,
    APIApplicationCommandAutocompleteGuildInteraction,
    APIApplicationCommandAutocompleteInteraction,
    APIChatInputApplicationCommandDMInteraction,
    APIChatInputApplicationCommandGuildInteraction,
    APIChatInputApplicationCommandInteraction,
    APIInteraction,
    ToEventProps,
} from '@discordjs/core';
import type { Awaitable } from '@discordjs/util';
import type { BotEventContainer } from '../events/event.ts';
import type { InteractionData } from './data/index.ts';

export type ApiAutocompleteInteraction<
    T extends APIChatInputApplicationCommandInteraction,
> = T extends APIChatInputApplicationCommandGuildInteraction
    ? APIApplicationCommandAutocompleteGuildInteraction
    : T extends APIChatInputApplicationCommandDMInteraction
      ? APIApplicationCommandAutocompleteDMInteraction
      : APIApplicationCommandAutocompleteInteraction;

export interface BotInteraction<T extends APIInteraction> {
    data: InteractionData<T>;
    handler(this: BotEventContainer, props: ToEventProps<T>): Awaitable<void>;
    autocomplete?(
        this: BotEventContainer,
        props: T extends APIChatInputApplicationCommandInteraction
            ? ToEventProps<ApiAutocompleteInteraction<T>>
            : never,
    ): Awaitable<void>;
}

export type GenericBotInteraction<T> = T extends APIInteraction
    ? BotInteraction<T>
    : never;
