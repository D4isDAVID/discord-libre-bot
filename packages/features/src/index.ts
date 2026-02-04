import type { BotFeature } from '@internal/bot';
import { cacheFeature } from './cache/index.ts';
import { exampleFeature } from './example.ts';
import { pingFeature } from './ping.ts';
import { statusFeature } from './status.ts';

export const botFeatures: BotFeature[] = [
    cacheFeature,
    statusFeature,
    pingFeature,
    exampleFeature,
];
