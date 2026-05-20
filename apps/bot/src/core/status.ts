import { setTimeout } from 'node:timers/promises';
import {
    GatewayDispatchEvents,
    type PresenceUpdateStatus,
} from '@discordjs/core';
import type { BotEventContainer, BotGatewayDispatchEvent } from '@internal/bot';

const ONE_SECOND = 1000;
const ONE_MINUTE = 60 * ONE_SECOND;

const shardIds: number[] = [];

async function runStatusLoop(this: BotEventContainer) {
    const statuses = await this.db.status.findMany();

    let timeout = 0;

    for (const status of statuses) {
        // biome-ignore lint/performance/noAwaitInLoops: we want to wait for this
        await setTimeout(timeout);

        timeout = ONE_MINUTE;

        const promises = shardIds.map((shardId) =>
            this.client.updatePresence(shardId, {
                status: status.status as PresenceUpdateStatus,
                afk: status.afk,
                since: status.afk ? Date.now() : null,
                activities: [
                    {
                        type: status.activityType,
                        name: status.activityName,
                        state: status.activityState,
                        url: status.activityUrl,
                    },
                ],
            }),
        );

        await Promise.all(promises);
    }

    await setTimeout(ONE_MINUTE);
}

export const statusReadyEvent = {
    name: GatewayDispatchEvents.Ready,
    async handler({ shardId }) {
        if (shardIds.includes(shardId)) {
            return;
        }

        shardIds.push(shardId);

        if (shardIds[0] !== shardId) {
            return;
        }

        while (true) {
            // biome-ignore lint/performance/noAwaitInLoops: we want to wait for this
            await runStatusLoop.bind(this)();
        }
    },
} satisfies BotGatewayDispatchEvent<GatewayDispatchEvents.Ready>;
