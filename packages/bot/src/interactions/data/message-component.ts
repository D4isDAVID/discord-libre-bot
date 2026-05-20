import type {
    APIButtonComponentWithCustomId,
    APIChannelSelectComponent,
    APIInteraction,
    APIMentionableSelectComponent,
    APIMessageComponentInteraction,
    APIRoleSelectComponent,
    APIStringSelectComponent,
    APIUserSelectComponent,
    ComponentType,
} from '@discordjs/core';

interface ComponentTypeToData {
    [ComponentType.Button]: APIButtonComponentWithCustomId;
    [ComponentType.StringSelect]: APIStringSelectComponent;
    [ComponentType.UserSelect]: APIUserSelectComponent;
    [ComponentType.RoleSelect]: APIRoleSelectComponent;
    [ComponentType.MentionableSelect]: APIMentionableSelectComponent;
    [ComponentType.ChannelSelect]: APIChannelSelectComponent;
}

export type MessageComponentInteractionData<T extends APIInteraction> =
    T extends APIMessageComponentInteraction
        ? ComponentTypeToData[T['data']['component_type']]
        : never;
