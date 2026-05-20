/** biome-ignore-all lint/style/useLiteralEnumMembers: seemingly no other good way to do combined intents */

import {
    type GatewayAutoModerationActionExecutionDispatchData,
    type GatewayChannelPinsUpdateDispatchData,
    GatewayDispatchEvents,
    GatewayIntentBits,
    type GatewayMessageCreateDispatchData,
    type GatewayMessageDeleteDispatchData,
    type GatewayMessagePollVoteDispatchData,
    type GatewayMessageReactionAddDispatchData,
    type GatewayMessageReactionRemoveAllDispatchData,
    type GatewayMessageReactionRemoveDispatchData,
    type GatewayMessageReactionRemoveEmojiDispatchData,
    type GatewayMessageUpdateDispatchData,
    type GatewayThreadMembersUpdateDispatchData,
    type GatewayTypingStartDispatchData,
} from '@discordjs/core';
import type { Require } from '@internal/common';

export enum CombinedIntentBits {
    AutoModerationExecutionMessageContent = GatewayIntentBits.MessageContent
        | GatewayIntentBits.AutoModerationExecution,
    MessageContent = GatewayIntentBits.MessageContent
        | GatewayIntentBits.GuildMessages
        | GatewayIntentBits.DirectMessages,
    GuildMessageContent = GatewayIntentBits.MessageContent
        | GatewayIntentBits.GuildMessages,
    DirectMessageContent = GatewayIntentBits.MessageContent
        | GatewayIntentBits.DirectMessages,
}

export interface IntentBasedEventData {
    [GatewayDispatchEvents.AutoModerationActionExecution]: {
        [CombinedIntentBits.AutoModerationExecutionMessageContent]: GatewayAutoModerationActionExecutionDispatchData;
    };
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
    [GatewayDispatchEvents.MessageCreate]: {
        [GatewayIntentBits.GuildMessages]: Require<
            GatewayMessageCreateDispatchData,
            'guild_id' | 'member'
        >;
        [GatewayIntentBits.DirectMessages]: Omit<
            GatewayMessageCreateDispatchData,
            'guild_id' | 'member'
        >;
        [CombinedIntentBits.MessageContent]: GatewayMessageCreateDispatchData;
        [CombinedIntentBits.GuildMessageContent]: Require<
            GatewayMessageCreateDispatchData,
            'guild_id' | 'member'
        >;
        [CombinedIntentBits.DirectMessageContent]: Omit<
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
            GatewayMessageDeleteDispatchData,
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
        [GatewayIntentBits.GuildMessages]: Require<
            GatewayMessageUpdateDispatchData,
            'guild_id' | 'member'
        >;
        [GatewayIntentBits.DirectMessages]: Omit<
            GatewayMessageUpdateDispatchData,
            'guild_id' | 'member'
        >;
        [CombinedIntentBits.MessageContent]: GatewayMessageUpdateDispatchData;
        [CombinedIntentBits.GuildMessageContent]: Require<
            GatewayMessageUpdateDispatchData,
            'guild_id' | 'member'
        >;
        [CombinedIntentBits.DirectMessageContent]: Omit<
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
            'guild_id' | 'member'
        >;
        [GatewayIntentBits.DirectMessageTyping]: Omit<
            GatewayTypingStartDispatchData,
            'guild_id' | 'member'
        >;
    };
}

export type IntentBasedEvent = keyof IntentBasedEventData;

export type EventIntents<T extends IntentBasedEvent> =
    keyof IntentBasedEventData[T];
