/** biome-ignore-all lint/style/useLiteralEnumMembers: enum values are re-used */
import {
    type GatewayChannelPinsUpdateDispatchData,
    GatewayDispatchEvents,
    type GatewayGuildMemberUpdateDispatchData,
    GatewayIntentBits,
    type GatewayMessageCreateDispatchData,
    type GatewayMessageDeleteBulkDispatchData,
    type GatewayMessageDeleteDispatchData,
    type GatewayMessagePollVoteDispatchData,
    type GatewayMessageReactionAddDispatchData,
    type GatewayMessageReactionRemoveAllDispatchData,
    type GatewayMessageReactionRemoveDispatchData,
    type GatewayMessageReactionRemoveEmojiDispatchData,
    type GatewayMessageUpdateDispatchData,
    type GatewayThreadMembersUpdateDispatchData,
    type GatewayTypingStartDispatchData,
    type MappedEvents,
    type ToEventProps,
} from '@discordjs/core';
import type { Require } from '../../utils.ts';

export enum CombinedIntents {
    MessageContent = GatewayIntentBits.GuildMessages |
        GatewayIntentBits.DirectMessages |
        GatewayIntentBits.MessageContent,
    GuildMessagesContent = GatewayIntentBits.GuildMessages |
        GatewayIntentBits.MessageContent,
    DirectMessagesContent = GatewayIntentBits.DirectMessages |
        GatewayIntentBits.MessageContent,
}

export interface IntentBasedEventData {
    [GatewayDispatchEvents.ChannelPinsUpdate]: {
        [GatewayIntentBits.Guilds]: Require<
            GatewayChannelPinsUpdateDispatchData,
            'guild_id'
        >;
        [GatewayIntentBits.DirectMessages]: Omit<
            GatewayChannelPinsUpdateDispatchData,
            'guild_id'
        >;
    };
    [GatewayDispatchEvents.GuildMemberUpdate]: {
        0: GatewayGuildMemberUpdateDispatchData;
    };
    [GatewayDispatchEvents.MessageCreate]: {
        [CombinedIntents.MessageContent]: GatewayMessageCreateDispatchData;
        [GatewayIntentBits.GuildMessages]: Require<
            GatewayMessageCreateDispatchData,
            'guild_id' | 'member'
        >;
        [CombinedIntents.GuildMessagesContent]: Require<
            GatewayMessageCreateDispatchData,
            'guild_id' | 'member'
        >;
        [GatewayIntentBits.DirectMessages]: Omit<
            GatewayMessageCreateDispatchData,
            'guild_id' | 'member'
        >;
        [CombinedIntents.DirectMessagesContent]: Omit<
            GatewayMessageCreateDispatchData,
            'guild_id' | 'member'
        >;
    };
    [GatewayDispatchEvents.MessageDelete]: {
        [GatewayIntentBits.GuildMessages]: Require<
            GatewayMessageDeleteDispatchData,
            'guild_id'
        >;
        [GatewayIntentBits.DirectMessages]: Omit<
            GatewayMessageDeleteDispatchData,
            'guild_id'
        >;
    };
    [GatewayDispatchEvents.MessageDeleteBulk]: {
        [GatewayIntentBits.GuildMessages]: Require<
            GatewayMessageDeleteBulkDispatchData,
            'guild_id'
        >;
    };
    [GatewayDispatchEvents.MessagePollVoteAdd]: {
        [GatewayIntentBits.GuildMessagePolls]: Require<
            GatewayMessagePollVoteDispatchData,
            'guild_id'
        >;
        [GatewayIntentBits.DirectMessagePolls]: Omit<
            GatewayMessagePollVoteDispatchData,
            'guild_id'
        >;
    };
    [GatewayDispatchEvents.MessagePollVoteRemove]: {
        [GatewayIntentBits.GuildMessagePolls]: Require<
            GatewayMessagePollVoteDispatchData,
            'guild_id'
        >;
        [GatewayIntentBits.DirectMessagePolls]: Omit<
            GatewayMessagePollVoteDispatchData,
            'guild_id'
        >;
    };
    [GatewayDispatchEvents.MessageReactionAdd]: {
        [GatewayIntentBits.GuildMessageReactions]: Require<
            GatewayMessageReactionAddDispatchData,
            'guild_id' | 'member'
        >;
        [GatewayIntentBits.DirectMessageReactions]: Omit<
            GatewayMessageReactionAddDispatchData,
            'guild_id' | 'member'
        >;
    };
    [GatewayDispatchEvents.MessageReactionRemove]: {
        [GatewayIntentBits.GuildMessageReactions]: Require<
            GatewayMessageReactionRemoveDispatchData,
            'guild_id'
        >;
        [GatewayIntentBits.DirectMessageReactions]: Omit<
            GatewayMessageReactionRemoveDispatchData,
            'guild_id'
        >;
    };
    [GatewayDispatchEvents.MessageReactionRemoveAll]: {
        [GatewayIntentBits.GuildMessageReactions]: Require<
            GatewayMessageReactionRemoveAllDispatchData,
            'guild_id'
        >;
        [GatewayIntentBits.DirectMessageReactions]: Omit<
            GatewayMessageReactionRemoveAllDispatchData,
            'guild_id'
        >;
    };
    [GatewayDispatchEvents.MessageReactionRemoveEmoji]: {
        [GatewayIntentBits.GuildMessageReactions]: Require<
            GatewayMessageReactionRemoveEmojiDispatchData,
            'guild_id'
        >;
        [GatewayIntentBits.DirectMessageReactions]: Omit<
            GatewayMessageReactionRemoveEmojiDispatchData,
            'guild_id'
        >;
    };
    [GatewayDispatchEvents.MessageUpdate]: {
        [CombinedIntents.MessageContent]: GatewayMessageUpdateDispatchData;
        [GatewayIntentBits.GuildMessages]: Require<
            GatewayMessageUpdateDispatchData,
            'guild_id' | 'member'
        >;
        [CombinedIntents.GuildMessagesContent]: Require<
            GatewayMessageUpdateDispatchData,
            'guild_id' | 'member'
        >;
        [GatewayIntentBits.DirectMessages]: Omit<
            GatewayMessageUpdateDispatchData,
            'guild_id' | 'member'
        >;
        [CombinedIntents.DirectMessagesContent]: Omit<
            GatewayMessageUpdateDispatchData,
            'guild_id' | 'member'
        >;
    };
    [GatewayDispatchEvents.ThreadMembersUpdate]: {
        [GatewayIntentBits.Guilds]: GatewayThreadMembersUpdateDispatchData;
    };
    [GatewayDispatchEvents.TypingStart]: {
        [GatewayIntentBits.GuildMessageTyping]: Require<
            GatewayTypingStartDispatchData,
            'guild_id'
        >;
        [GatewayIntentBits.DirectMessageTyping]: Omit<
            GatewayTypingStartDispatchData,
            'guild_id'
        >;
    };
}

export type IntentBasedMappedEvents<
    E extends keyof MappedEvents,
    T extends number | undefined = undefined,
> = E extends keyof IntentBasedEventData
    ? T extends number
        ? T extends keyof IntentBasedEventData[E]
            ? [ToEventProps<IntentBasedEventData[E][T]>]
            : never
        : MappedEvents[E]
    : MappedEvents[E];
