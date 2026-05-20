import type {
    APIComponentInContainer,
    APIContainerComponent,
    APIMessageComponent,
} from '@discordjs/core';
import type { BotEventContainer } from '../../../events/index.ts';

export type ComponentIdFactory = () => number;

export function createComponentIdFactory(componentId = 1): ComponentIdFactory {
    let currentId = componentId;

    return () => currentId++;
}

export interface BotMenuOptions<T> {
    build(
        this: BotEventContainer,
        getComponentId: ComponentIdFactory,
        arg?: T,
    ): APIComponentInContainer[] | Promise<APIComponentInContainer[]>;
}

export interface BotMenu<T> {
    build(
        this: BotEventContainer,
        getComponentId?: ComponentIdFactory,
        arg?: T,
    ): Promise<APIComponentInContainer[]>;
    editContainer(
        this: BotEventContainer,
        container: APIContainerComponent,
        componentId: number,
        arg?: T,
    ): Promise<APIContainerComponent>;
}

export function createBotMenu<T>({ build }: BotMenuOptions<T>): BotMenu<T> {
    return {
        async build(getComponentId, arg) {
            return await build.bind(this)(
                getComponentId ?? createComponentIdFactory(),
                arg,
            );
        },
        async editContainer(container, componentId, arg) {
            const [top, bottom] = findInContainer(container, componentId);

            return {
                ...clearIds(container, componentId),
                components: [
                    ...container.components.slice(0, top + 1),
                    ...(await build.bind(this)(
                        createComponentIdFactory(componentId),
                        arg,
                    )),
                    ...container.components.slice(bottom + 1),
                ],
            };
        },
    };
}

function findInContainer(
    container: APIContainerComponent,
    componentId: number,
): [number, number] {
    const base = container.components.findIndex((c) => c.id === componentId);

    const top = container.components
        .slice(0, base)
        .findLastIndex(
            (c) => typeof c.id !== 'undefined' && c.id < componentId,
        );

    const bottom = container.components
        .slice(base + 1)
        .findIndex((c) => typeof c.id !== 'undefined' && c.id < componentId);

    return [Math.min(base, top), Math.max(base, bottom)];
}

function clearIds<T extends APIMessageComponent>(
    component: T,
    maxId: number,
): T {
    if ('id' in component && component.id > maxId) {
        delete component.id;
    }

    if ('components' in component) {
        for (const child of component.components) {
            clearIds(child, maxId);
        }
    }

    return component;
}
