import type {
    APIApplicationCommandDMInteraction,
    APIApplicationCommandGuildInteraction,
    APIApplicationCommandInteraction,
    APIInteraction,
    ApplicationCommandType,
    ApplicationIntegrationType,
    InteractionContextType,
    RESTPostAPIChatInputApplicationCommandsJSONBody,
    RESTPostAPIContextMenuApplicationCommandsJSONBody,
    RESTPostAPIPrimaryEntryPointApplicationCommandJSONBody,
} from '@discordjs/core';

type ContextMenuInteractionData<T extends APIApplicationCommandInteraction> =
    RESTPostAPIContextMenuApplicationCommandsJSONBody & {
        type: T['data']['type'];
    };

type Data<T extends APIApplicationCommandInteraction> = {
    [ApplicationCommandType.ChatInput]: RESTPostAPIChatInputApplicationCommandsJSONBody;
    [ApplicationCommandType.User]: ContextMenuInteractionData<T>;
    [ApplicationCommandType.Message]: ContextMenuInteractionData<T>;
    [ApplicationCommandType.PrimaryEntryPoint]: RESTPostAPIPrimaryEntryPointApplicationCommandJSONBody;
}[T['data']['type']];

type Context<
    T extends APIApplicationCommandInteraction,
    V extends APIApplicationCommandInteraction,
    C extends InteractionContextType,
    G extends ApplicationIntegrationType,
> = T extends V
    ? { contexts: [C, ...C[]] } & { integration_types: [G, ...G[]] }
    : object;

type GuildContext<T extends APIApplicationCommandInteraction> = Context<
    T,
    APIApplicationCommandGuildInteraction,
    InteractionContextType.Guild,
    ApplicationIntegrationType.GuildInstall
>;

type UserContext<T extends APIApplicationCommandInteraction> = Context<
    T,
    APIApplicationCommandDMInteraction,
    InteractionContextType.BotDM | InteractionContextType.PrivateChannel,
    ApplicationIntegrationType.UserInstall
>;

export type ApplicationCommandInteractionData<T extends APIInteraction> =
    T extends APIApplicationCommandInteraction
        ? Data<T> & GuildContext<T> & UserContext<T>
        : never;
