import type {
    APIInteraction,
    APIMessageTopLevelComponent,
} from '@discordjs/core';
import type { Awaitable } from '@discordjs/util';
import type { BotEventContainer } from '../../../../events/event.ts';

export interface InternalPaginatedMenuData<Interaction extends APIInteraction> {
    build(options: {
        container: BotEventContainer;
        interaction: Interaction;
        page: number;
    }): Awaitable<APIMessageTopLevelComponent[]>;
}
