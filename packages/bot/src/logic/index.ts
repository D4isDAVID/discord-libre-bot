import type { Logger } from '@internal/common';
import type { Repositories } from '@internal/data';
import type { BotFeatureHandler } from '../features.ts';
import { ConfigLogic } from './config.ts';

export interface LogicOptions {
    logger: Logger;
    db: Repositories;
    features: BotFeatureHandler;
}

export class BotLogic {
    readonly config: ConfigLogic;

    constructor(options: LogicOptions) {
        this.config = new ConfigLogic(options);
    }
}
