import type {
    APIInteraction,
    APIModalInteractionResponseCallbackData,
    APIModalSubmitInteraction,
} from '@discordjs/core';

export type ModalSubmitInteractionData<T extends APIInteraction> =
    T extends APIModalSubmitInteraction
        ? APIModalInteractionResponseCallbackData
        : never;
