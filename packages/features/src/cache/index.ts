import type { BotFeature } from '@internal/bot';
import { heartbeatCompleteEvent } from './ping.ts';

export const cacheFeature: BotFeature = {
    events: {
        ws: [heartbeatCompleteEvent],
    },
};
