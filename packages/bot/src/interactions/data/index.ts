import type { APIInteraction, InteractionType } from '@discordjs/core';
import type { ApplicationCommandInteractionData } from './application-command.ts';
import type { MessageComponentInteractionData } from './message-component.ts';
import type { ModalSubmitInteractionData } from './modal-submit.ts';

export type InteractionData<T extends APIInteraction> = {
    [InteractionType.Ping]: never;
    [InteractionType.ApplicationCommand]: ApplicationCommandInteractionData<T>;
    [InteractionType.MessageComponent]: MessageComponentInteractionData<T>;
    [InteractionType.ApplicationCommandAutocomplete]: never;
    [InteractionType.ModalSubmit]: ModalSubmitInteractionData<T>;
}[T['type']];
