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

export type MessageComponentInteractionData<T extends APIInteraction> =
    T extends APIMessageComponentInteraction
        ? {
              [ComponentType.Button]: APIButtonComponentWithCustomId;
              [ComponentType.StringSelect]: APIStringSelectComponent;
              [ComponentType.UserSelect]: APIUserSelectComponent;
              [ComponentType.RoleSelect]: APIRoleSelectComponent;
              [ComponentType.MentionableSelect]: APIMentionableSelectComponent;
              [ComponentType.ChannelSelect]: APIChannelSelectComponent;
          }[T['data']['component_type']]
        : never;
