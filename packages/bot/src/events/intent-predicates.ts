import { GatewayDispatchEvents, GatewayIntentBits } from '@discordjs/core';
import type { MapUnion } from '@internal/common';
import type {
    BotEventContainer,
    GenericBotIntentBasedGatewayDispatchEvent,
} from './event.ts';
import {
    CombinedIntentBits,
    type EventIntents,
    type IntentBasedEvent,
    type IntentBasedEventData,
} from './intent-data.ts';

export type IntentPredicate<
    Event extends IntentBasedEvent = IntentBasedEvent,
    Intent extends EventIntents<Event> = EventIntents<Event>,
> = (
    this: BotEventContainer,
    obj: MapUnion<IntentBasedEventData[Event]>,
) => obj is IntentBasedEventData[Event][Intent];

function noopPredicate<
    Event extends IntentBasedEvent,
    Intent extends EventIntents<Event>,
>(): IntentPredicate<Event, Intent> {
    return function (this, _obj): _obj is IntentBasedEventData[Event][Intent] {
        return true;
    };
}

function guildPredicate<
    Event extends IntentBasedEvent,
    Intent extends EventIntents<Event>,
>(): IntentPredicate<Event, Intent> {
    return function (this, obj): obj is IntentBasedEventData[Event][Intent] {
        return typeof obj === 'object' && obj !== null && 'guild_id' in obj;
    };
}

function dmPredicate<
    Event extends IntentBasedEvent,
    Intent extends EventIntents<Event>,
>(): IntentPredicate<Event, Intent> {
    return function (this, obj): obj is IntentBasedEventData[Event][Intent] {
        return typeof obj === 'object' && obj !== null && !('guild_id' in obj);
    };
}

const eventIntentPredicates: {
    [T in IntentBasedEvent]: {
        [Intent in EventIntents<T>]: IntentPredicate<T, Intent>;
    };
} = {
    [GatewayDispatchEvents.AutoModerationActionExecution]: {
        [CombinedIntentBits.AutoModerationExecutionMessageContent]:
            noopPredicate(),
    },
    [GatewayDispatchEvents.ChannelPinsUpdate]: {
        [GatewayIntentBits.Guilds]: guildPredicate(),
        [GatewayIntentBits.DirectMessages]: dmPredicate(),
    },
    [GatewayDispatchEvents.MessageCreate]: {
        [GatewayIntentBits.GuildMessages]: guildPredicate(),
        [GatewayIntentBits.DirectMessages]: dmPredicate(),
        [CombinedIntentBits.MessageContent]: noopPredicate(),
        [CombinedIntentBits.GuildMessageContent]: guildPredicate(),
        [CombinedIntentBits.DirectMessageContent]: dmPredicate(),
    },
    [GatewayDispatchEvents.MessageDelete]: {
        [GatewayIntentBits.GuildMessages]: guildPredicate(),
        [GatewayIntentBits.DirectMessages]: dmPredicate(),
    },
    [GatewayDispatchEvents.MessageDeleteBulk]: {
        [GatewayIntentBits.GuildMessages]: guildPredicate(),
    },
    [GatewayDispatchEvents.MessagePollVoteAdd]: {
        [GatewayIntentBits.GuildMessagePolls]: guildPredicate(),
        [GatewayIntentBits.DirectMessagePolls]: dmPredicate(),
    },
    [GatewayDispatchEvents.MessagePollVoteRemove]: {
        [GatewayIntentBits.GuildMessagePolls]: guildPredicate(),
        [GatewayIntentBits.DirectMessagePolls]: dmPredicate(),
    },
    [GatewayDispatchEvents.MessageReactionAdd]: {
        [GatewayIntentBits.GuildMessageReactions]: guildPredicate(),
        [GatewayIntentBits.DirectMessageReactions]: dmPredicate(),
    },
    [GatewayDispatchEvents.MessageReactionRemove]: {
        [GatewayIntentBits.GuildMessageReactions]: guildPredicate(),
        [GatewayIntentBits.DirectMessageReactions]: dmPredicate(),
    },
    [GatewayDispatchEvents.MessageReactionRemoveAll]: {
        [GatewayIntentBits.GuildMessageReactions]: guildPredicate(),
        [GatewayIntentBits.DirectMessageReactions]: dmPredicate(),
    },
    [GatewayDispatchEvents.MessageReactionRemoveEmoji]: {
        [GatewayIntentBits.GuildMessageReactions]: guildPredicate(),
        [GatewayIntentBits.DirectMessageReactions]: dmPredicate(),
    },
    [GatewayDispatchEvents.MessageUpdate]: {
        [GatewayIntentBits.GuildMessages]: guildPredicate(),
        [GatewayIntentBits.DirectMessages]: dmPredicate(),
        [CombinedIntentBits.MessageContent]: noopPredicate(),
        [CombinedIntentBits.GuildMessageContent]: guildPredicate(),
        [CombinedIntentBits.DirectMessageContent]: dmPredicate(),
    },
    [GatewayDispatchEvents.ThreadMembersUpdate]: {
        [GatewayIntentBits.Guilds](
            this,
            obj,
        ): obj is IntentBasedEventData[GatewayDispatchEvents.ThreadMembersUpdate][GatewayIntentBits.Guilds] {
            const botUserId = 'TODO';

            if (
                obj.added_members?.some(
                    (member) => member.user_id === botUserId,
                )
            ) {
                return true;
            }

            if (obj.removed_member_ids?.includes(botUserId)) {
                return true;
            }

            return false;
        },
    },
    [GatewayDispatchEvents.TypingStart]: {
        [GatewayIntentBits.GuildMessageTyping]: guildPredicate(),
        [GatewayIntentBits.DirectMessageTyping]: dmPredicate(),
    },
};

export function getEventIntentPredicate<
    Event extends IntentBasedEvent,
    Intent extends EventIntents<Event>,
>(
    event: GenericBotIntentBasedGatewayDispatchEvent<Event, Intent>,
): IntentPredicate<Event, Intent> {
    return eventIntentPredicates[event.name][event.intents] as IntentPredicate<
        Event,
        Intent
    >;
}
