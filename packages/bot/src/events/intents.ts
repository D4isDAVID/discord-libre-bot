import {
    GatewayDispatchEvents,
    GatewayIntentBits,
    type MappedEvents,
} from '@discordjs/core';

export const gatewayDispatchEventIntents: Record<keyof MappedEvents, number> = {
    [GatewayDispatchEvents.ApplicationCommandPermissionsUpdate]: 0,
    [GatewayDispatchEvents.AutoModerationActionExecution]:
        GatewayIntentBits.AutoModerationExecution,
    [GatewayDispatchEvents.AutoModerationRuleCreate]:
        GatewayIntentBits.AutoModerationConfiguration,
    [GatewayDispatchEvents.AutoModerationRuleDelete]:
        GatewayIntentBits.AutoModerationConfiguration,
    [GatewayDispatchEvents.AutoModerationRuleUpdate]:
        GatewayIntentBits.AutoModerationConfiguration,
    [GatewayDispatchEvents.ChannelCreate]: GatewayIntentBits.Guilds,
    [GatewayDispatchEvents.ChannelDelete]: GatewayIntentBits.Guilds,
    [GatewayDispatchEvents.ChannelPinsUpdate]:
        GatewayIntentBits.Guilds | GatewayIntentBits.DirectMessages,
    [GatewayDispatchEvents.ChannelUpdate]: GatewayIntentBits.Guilds,
    [GatewayDispatchEvents.EntitlementCreate]: 0,
    [GatewayDispatchEvents.EntitlementDelete]: 0,
    [GatewayDispatchEvents.EntitlementUpdate]: 0,
    [GatewayDispatchEvents.GuildAuditLogEntryCreate]:
        GatewayIntentBits.GuildModeration,
    [GatewayDispatchEvents.GuildBanAdd]: GatewayIntentBits.GuildModeration,
    [GatewayDispatchEvents.GuildBanRemove]: GatewayIntentBits.GuildModeration,
    [GatewayDispatchEvents.GuildCreate]: GatewayIntentBits.Guilds,
    [GatewayDispatchEvents.GuildDelete]: GatewayIntentBits.Guilds,
    [GatewayDispatchEvents.GuildEmojisUpdate]:
        GatewayIntentBits.GuildExpressions,
    [GatewayDispatchEvents.GuildIntegrationsUpdate]:
        GatewayIntentBits.GuildIntegrations,
    [GatewayDispatchEvents.GuildMemberAdd]: GatewayIntentBits.GuildMembers,
    [GatewayDispatchEvents.GuildMemberRemove]: GatewayIntentBits.GuildMembers,
    [GatewayDispatchEvents.GuildMembersChunk]: 0,
    [GatewayDispatchEvents.GuildMemberUpdate]: GatewayIntentBits.GuildMembers,
    [GatewayDispatchEvents.GuildRoleCreate]: GatewayIntentBits.Guilds,
    [GatewayDispatchEvents.GuildRoleDelete]: GatewayIntentBits.Guilds,
    [GatewayDispatchEvents.GuildRoleUpdate]: GatewayIntentBits.Guilds,
    [GatewayDispatchEvents.GuildScheduledEventCreate]:
        GatewayIntentBits.GuildScheduledEvents,
    [GatewayDispatchEvents.GuildScheduledEventDelete]:
        GatewayIntentBits.GuildScheduledEvents,
    [GatewayDispatchEvents.GuildScheduledEventUpdate]:
        GatewayIntentBits.GuildScheduledEvents,
    [GatewayDispatchEvents.GuildScheduledEventUserAdd]:
        GatewayIntentBits.GuildScheduledEvents,
    [GatewayDispatchEvents.GuildScheduledEventUserRemove]:
        GatewayIntentBits.GuildScheduledEvents,
    // [GatewayDispatchEvents.GuildSoundboardSoundCreate]:
    //     GatewayIntentBits.GuildExpressions,
    // [GatewayDispatchEvents.GuildSoundboardSoundDelete]:
    //     GatewayIntentBits.GuildExpressions,
    // [GatewayDispatchEvents.GuildSoundboardSoundsUpdate]:
    //     GatewayIntentBits.GuildExpressions,
    // [GatewayDispatchEvents.GuildSoundboardSoundUpdate]:
    //     GatewayIntentBits.GuildExpressions,
    // [GatewayDispatchEvents.SoundboardSounds]: 0,
    [GatewayDispatchEvents.GuildStickersUpdate]:
        GatewayIntentBits.GuildExpressions,
    [GatewayDispatchEvents.GuildUpdate]: GatewayIntentBits.Guilds,
    [GatewayDispatchEvents.IntegrationCreate]:
        GatewayIntentBits.GuildIntegrations,
    [GatewayDispatchEvents.IntegrationDelete]:
        GatewayIntentBits.GuildIntegrations,
    [GatewayDispatchEvents.IntegrationUpdate]:
        GatewayIntentBits.GuildIntegrations,
    [GatewayDispatchEvents.InteractionCreate]: 0,
    [GatewayDispatchEvents.InviteCreate]: GatewayIntentBits.GuildInvites,
    [GatewayDispatchEvents.InviteDelete]: GatewayIntentBits.GuildInvites,
    [GatewayDispatchEvents.MessageCreate]:
        GatewayIntentBits.GuildMessages | GatewayIntentBits.DirectMessages,
    [GatewayDispatchEvents.MessageDelete]:
        GatewayIntentBits.GuildMessages | GatewayIntentBits.DirectMessages,
    [GatewayDispatchEvents.MessageDeleteBulk]: GatewayIntentBits.GuildMessages,
    [GatewayDispatchEvents.MessagePollVoteAdd]:
        GatewayIntentBits.GuildMessagePolls |
        GatewayIntentBits.DirectMessagePolls,
    [GatewayDispatchEvents.MessagePollVoteRemove]:
        GatewayIntentBits.GuildMessagePolls |
        GatewayIntentBits.DirectMessagePolls,
    [GatewayDispatchEvents.MessageReactionAdd]:
        GatewayIntentBits.GuildMessageReactions |
        GatewayIntentBits.DirectMessageReactions,
    [GatewayDispatchEvents.MessageReactionRemove]:
        GatewayIntentBits.GuildMessageReactions |
        GatewayIntentBits.DirectMessageReactions,
    [GatewayDispatchEvents.MessageReactionRemoveAll]:
        GatewayIntentBits.GuildMessageReactions |
        GatewayIntentBits.DirectMessageReactions,
    [GatewayDispatchEvents.MessageReactionRemoveEmoji]:
        GatewayIntentBits.GuildMessageReactions |
        GatewayIntentBits.DirectMessageReactions,
    [GatewayDispatchEvents.MessageUpdate]:
        GatewayIntentBits.GuildMessages | GatewayIntentBits.DirectMessages,
    [GatewayDispatchEvents.PresenceUpdate]: GatewayIntentBits.GuildPresences,
    [GatewayDispatchEvents.Ready]: 0,
    [GatewayDispatchEvents.Resumed]: 0,
    [GatewayDispatchEvents.StageInstanceCreate]: GatewayIntentBits.Guilds,
    [GatewayDispatchEvents.StageInstanceDelete]: GatewayIntentBits.Guilds,
    [GatewayDispatchEvents.StageInstanceUpdate]: GatewayIntentBits.Guilds,
    // [GatewayDispatchEvents.SubscriptionCreate]: 0,
    // [GatewayDispatchEvents.SubscriptionDelete]: 0,
    // [GatewayDispatchEvents.SubscriptionUpdate]: 0,
    [GatewayDispatchEvents.ThreadCreate]: GatewayIntentBits.Guilds,
    [GatewayDispatchEvents.ThreadDelete]: GatewayIntentBits.Guilds,
    [GatewayDispatchEvents.ThreadListSync]: GatewayIntentBits.Guilds,
    [GatewayDispatchEvents.ThreadMembersUpdate]:
        GatewayIntentBits.Guilds | GatewayIntentBits.GuildMembers,
    [GatewayDispatchEvents.ThreadMemberUpdate]: GatewayIntentBits.Guilds,
    [GatewayDispatchEvents.ThreadUpdate]: GatewayIntentBits.Guilds,
    [GatewayDispatchEvents.TypingStart]:
        GatewayIntentBits.GuildMessageTyping |
        GatewayIntentBits.DirectMessageTyping,
    [GatewayDispatchEvents.UserUpdate]: 0,
    // [GatewayDispatchEvents.VoiceChannelEffectSend]:
    //     GatewayIntentBits.GuildVoiceStates,
    [GatewayDispatchEvents.VoiceServerUpdate]: 0,
    [GatewayDispatchEvents.VoiceStateUpdate]:
        GatewayIntentBits.GuildVoiceStates,
    [GatewayDispatchEvents.WebhooksUpdate]: GatewayIntentBits.GuildWebhooks,
};
