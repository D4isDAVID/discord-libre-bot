import {
    type APIComponentInContainer,
    type APIContainerComponent,
    ComponentType,
} from '@discordjs/core';
import type { Awaitable } from '@discordjs/util';

export interface BotMenuOptions {
    build(): Awaitable<APIComponentInContainer[]>;
}

export interface BotMenu {
    build(): Promise<APIContainerComponent>;
}

export function createBotMenu({ build }: BotMenuOptions): BotMenu {
    return {
        async build() {
            return {
                type: ComponentType.Container,
                components: await build(),
            };
        },
    };
}
