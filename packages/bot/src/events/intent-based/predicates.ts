import {
    GatewayDispatchEvents,
    GatewayIntentBits,
    type Snowflake,
} from '@discordjs/core';
import type { MapUnion } from '../../utils.ts';
import type { IntentBasedEventData } from './types.ts';

export interface IntentBasedPredicateData {
    userId: Snowflake;
}

type Predicate<
    T extends keyof IntentBasedEventData,
    Intent extends keyof IntentBasedEventData[T],
> = (
    this: IntentBasedPredicateData,
    obj: MapUnion<IntentBasedEventData[T]>,
) => obj is IntentBasedEventData[T][Intent];

function guildsDmsPredicate<T extends keyof IntentBasedEventData>() {
    return <
        GuildsIntent extends keyof IntentBasedEventData[T],
        DmsIntent extends keyof IntentBasedEventData[T],
    >(
        guildsIntent: GuildsIntent,
        dmsIntent: DmsIntent,
    ) => {
        return {
            [guildsIntent]: (obj: object) => 'guild_id' in obj,
            [dmsIntent]: (obj: object) => !('guild_id' in obj),
        } as {
            [K in GuildsIntent]: Predicate<T, K>;
        } & {
            [K in DmsIntent]: Predicate<T, K>;
        };
    };
}

function messageContentPredicate<T extends keyof IntentBasedEventData>() {
    return {
        [GatewayIntentBits.GuildMessages |
            GatewayIntentBits.DirectMessages |
            GatewayIntentBits.MessageContent]: () => true,
        [GatewayIntentBits.GuildMessages]: (obj: object) => 'guild_id' in obj,
        [GatewayIntentBits.GuildMessages | GatewayIntentBits.MessageContent]: (
            obj: object,
        ) => 'guild_id' in obj,
        [GatewayIntentBits.DirectMessages]: (obj: object) =>
            !('guild_id' in obj),
        [GatewayIntentBits.DirectMessages | GatewayIntentBits.MessageContent]: (
            obj: object,
        ) => !('guild_id' in obj),
    } as {
        [K in keyof IntentBasedEventData[T]]: Predicate<T, K>;
    };
}

export const intentBasedEventPredicates: {
    [T in keyof IntentBasedEventData]: {
        [Intent in keyof IntentBasedEventData[T]]: Predicate<T, Intent>;
    };
} = {
    [GatewayDispatchEvents.ChannelPinsUpdate]:
        guildsDmsPredicate<GatewayDispatchEvents.ChannelPinsUpdate>()(
            GatewayIntentBits.Guilds,
            GatewayIntentBits.DirectMessages,
        ),
    [GatewayDispatchEvents.GuildMemberUpdate]: {
        0: function (this, obj) {
            return obj.user.id === this.userId;
        } as Predicate<GatewayDispatchEvents.GuildMemberUpdate, 0>,
    },
    [GatewayDispatchEvents.MessageCreate]:
        messageContentPredicate<GatewayDispatchEvents.MessageCreate>(),
    [GatewayDispatchEvents.MessageDelete]:
        guildsDmsPredicate<GatewayDispatchEvents.MessageDelete>()(
            GatewayIntentBits.GuildMessages,
            GatewayIntentBits.DirectMessages,
        ),
    [GatewayDispatchEvents.MessageDeleteBulk]: {
        [GatewayIntentBits.GuildMessages]: function (this, obj) {
            return 'guild_id' in obj;
        } as Predicate<
            GatewayDispatchEvents.MessageDeleteBulk,
            GatewayIntentBits.GuildMessages
        >,
    },
    [GatewayDispatchEvents.MessagePollVoteAdd]:
        guildsDmsPredicate<GatewayDispatchEvents.MessagePollVoteAdd>()(
            GatewayIntentBits.GuildMessagePolls,
            GatewayIntentBits.DirectMessagePolls,
        ),
    [GatewayDispatchEvents.MessagePollVoteRemove]:
        guildsDmsPredicate<GatewayDispatchEvents.MessagePollVoteRemove>()(
            GatewayIntentBits.GuildMessagePolls,
            GatewayIntentBits.DirectMessagePolls,
        ),
    [GatewayDispatchEvents.MessageReactionAdd]:
        guildsDmsPredicate<GatewayDispatchEvents.MessageReactionAdd>()(
            GatewayIntentBits.GuildMessageReactions,
            GatewayIntentBits.DirectMessageReactions,
        ),
    [GatewayDispatchEvents.MessageReactionRemove]:
        guildsDmsPredicate<GatewayDispatchEvents.MessageReactionRemove>()(
            GatewayIntentBits.GuildMessageReactions,
            GatewayIntentBits.DirectMessageReactions,
        ),
    [GatewayDispatchEvents.MessageReactionRemoveAll]:
        guildsDmsPredicate<GatewayDispatchEvents.MessageReactionRemoveAll>()(
            GatewayIntentBits.GuildMessageReactions,
            GatewayIntentBits.DirectMessageReactions,
        ),
    [GatewayDispatchEvents.MessageReactionRemoveEmoji]:
        guildsDmsPredicate<GatewayDispatchEvents.MessageReactionRemoveEmoji>()(
            GatewayIntentBits.GuildMessageReactions,
            GatewayIntentBits.DirectMessageReactions,
        ),
    [GatewayDispatchEvents.MessageUpdate]:
        messageContentPredicate<GatewayDispatchEvents.MessageUpdate>(),
    [GatewayDispatchEvents.ThreadMembersUpdate]: {
        [GatewayIntentBits.Guilds]: function (this, obj) {
            return (
                obj.added_members?.some(
                    (member) => member.user_id === this.userId,
                ) || obj.removed_member_ids?.includes(this.userId)
            );
        } as Predicate<
            GatewayDispatchEvents.ThreadMembersUpdate,
            GatewayIntentBits.Guilds
        >,
    },
    [GatewayDispatchEvents.TypingStart]:
        guildsDmsPredicate<GatewayDispatchEvents.TypingStart>()(
            GatewayIntentBits.GuildMessageTyping,
            GatewayIntentBits.DirectMessageTyping,
        ),
};
