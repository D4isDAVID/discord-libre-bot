import type { Logger } from '@internal/common';
import type { ConfigWriteObject, Repositories } from '@internal/data';
import type { BotFeatureHandler } from '../features.ts';
import type { LogicOptions } from './index.ts';

export class ConfigLogic {
    readonly #logger: Logger;
    readonly #db: Repositories;
    readonly #features: BotFeatureHandler;

    constructor({ logger, db, features }: LogicOptions) {
        this.#logger = logger;
        this.#db = db;
        this.#features = features;
    }

    async getGlobal() {
        const response = (
            await this.#db.config.findByGuildId(null, {
                limit: 1,
            })
        )[0];

        if (typeof response !== 'undefined') {
            return response;
        }

        return await this.#db.config.create({
            guildId: null,
            prefix: null,
            features: [],
        });
    }

    async updateGlobal(object: Partial<ConfigWriteObject>) {
        const config = await this.getGlobal();

        return await this.#db.config.update(config.id, object);
    }

    async isFeatureEnabledGlobally(featureName: string) {
        const { features } = await this.getGlobal();

        return features.includes(featureName);
    }

    async enableFeatureGlobally(featureName: string) {
        this.#logger.info(`globally enabling feature '${featureName}'`);

        this.#features.disable(featureName);

        const { features } = await this.getGlobal();

        if (features.includes(featureName)) {
            return;
        }

        features.push(featureName);

        this.updateGlobal({ features });
    }

    async disableFeatureGlobally(featureName: string) {
        this.#logger.info(`globally disabling feature '${featureName}'`);

        this.#features.enable(featureName);

        const { features } = await this.getGlobal();

        const index = features.indexOf(featureName);

        if (index === -1) {
            return;
        }

        features.splice(index, 1);

        this.updateGlobal({ features });
    }
}
