import type { BotEventHandler, BotEvents } from './events/handler.ts';
import type {
    BotInteractionHandler,
    BotInteractions,
} from './interactions/handler.ts';

export interface BotFeature {
    events?: Partial<BotEvents>;
    interactions?: Partial<BotInteractions>;
}

export interface BotFeatureHandlerOptions {
    events: BotEventHandler;
    interactions: BotInteractionHandler;
}

export class BotFeatureHandler {
    events: BotEventHandler;
    interactions: BotInteractionHandler;

    constructor({ events, interactions }: BotFeatureHandlerOptions) {
        this.events = events;
        this.interactions = interactions;
    }

    register({ events = {}, interactions = {} }: BotFeature) {
        this.events.register(events);
        this.interactions.register(interactions);
    }
}
