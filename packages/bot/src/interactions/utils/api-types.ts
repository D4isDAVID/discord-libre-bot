import type {
    APIBaseInteraction,
    APIDMInteractionWrapper,
    APIGuildInteractionWrapper,
    APIMessageChannelSelectInteractionData,
    APIMessageComponentButtonInteraction,
    APIMessageMentionableSelectInteractionData,
    APIMessageRoleSelectInteractionData,
    APIMessageStringSelectInteractionData,
    APIMessageUserSelectInteractionData,
    InteractionType,
} from '@discordjs/core';

export type ApiMessageComponentButtonDmInteraction =
    APIDMInteractionWrapper<APIMessageComponentButtonInteraction>;
export type ApiMessageComponentButtonGuildInteraction =
    APIGuildInteractionWrapper<APIMessageComponentButtonInteraction>;

type SelectMenuInteraction<Data> = APIBaseInteraction<
    InteractionType.MessageComponent,
    Data
> &
    Required<
        Pick<
            APIBaseInteraction<InteractionType.MessageComponent, Data>,
            'app_permissions' | 'channel_id' | 'channel' | 'data' | 'message'
        >
    >;

export type ApiMessageComponentStringSelectInteraction =
    SelectMenuInteraction<APIMessageStringSelectInteractionData>;
export type ApiMessageComponentStringSelectGuildInteraction =
    APIGuildInteractionWrapper<ApiMessageComponentStringSelectInteraction>;
export type ApiMessageComponentStringSelectDmInteraction =
    APIDMInteractionWrapper<ApiMessageComponentStringSelectInteraction>;

export type ApiMessageComponentUserSelectInteraction =
    SelectMenuInteraction<APIMessageUserSelectInteractionData>;
export type ApiMessageComponentUserSelectGuildInteraction =
    APIGuildInteractionWrapper<ApiMessageComponentUserSelectInteraction>;
export type ApiMessageComponentUserSelectDmInteraction =
    APIDMInteractionWrapper<ApiMessageComponentUserSelectInteraction>;

export type ApiMessageComponentRoleSelectInteraction =
    SelectMenuInteraction<APIMessageRoleSelectInteractionData>;
export type ApiMessageComponentRoleSelectGuildInteraction =
    APIGuildInteractionWrapper<ApiMessageComponentRoleSelectInteraction>;
export type ApiMessageComponentRoleSelectDmInteraction =
    APIDMInteractionWrapper<ApiMessageComponentRoleSelectInteraction>;

export type ApiMessageComponentMentionableSelectInteraction =
    SelectMenuInteraction<APIMessageMentionableSelectInteractionData>;
export type ApiMessageComponentMentionableSelectGuildInteraction =
    APIGuildInteractionWrapper<ApiMessageComponentMentionableSelectInteraction>;
export type ApiMessageComponentMentionableSelectDmInteraction =
    APIDMInteractionWrapper<ApiMessageComponentMentionableSelectInteraction>;

export type ApiMessageComponentChannelSelectInteraction =
    SelectMenuInteraction<APIMessageChannelSelectInteractionData>;
export type ApiMessageComponentChannelSelectGuildInteraction =
    APIGuildInteractionWrapper<ApiMessageComponentChannelSelectInteraction>;
export type ApiMessageComponentChannelSelectDmInteraction =
    APIDMInteractionWrapper<ApiMessageComponentChannelSelectInteraction>;
