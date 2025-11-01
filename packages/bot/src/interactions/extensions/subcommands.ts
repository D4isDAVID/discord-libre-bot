import { Collection } from '@discordjs/collection';
import {
    type APIApplicationCommandInteractionDataOption,
    type APIApplicationCommandInteractionDataSubcommandGroupOption,
    type APIApplicationCommandInteractionDataSubcommandOption,
    type APIApplicationCommandSubcommandGroupOption,
    type APIApplicationCommandSubcommandOption,
    type APIChatInputApplicationCommandInteraction,
    ApplicationCommandOptionType,
    type ToEventProps,
} from '@discordjs/core';
import type { Awaitable } from '@discordjs/util';
import type { Logger } from '@internal/logger';
import type { BotEventContainer } from '../../events/event.ts';
import type { Require } from '../../utils.ts';
import type {
    ApiAutocompleteInteraction,
    BotInteraction,
} from '../interaction.ts';

export interface BotSubcommandGroup<
    T extends APIChatInputApplicationCommandInteraction,
> {
    data: APIApplicationCommandSubcommandGroupOption;
    handler: (
        this: BotEventContainer,
        props: ToEventProps<T> & {
            option: APIApplicationCommandInteractionDataSubcommandGroupOption;
        },
    ) => Awaitable<void>;
    autocomplete?(
        this: BotEventContainer,
        props: ToEventProps<ApiAutocompleteInteraction<T>> & {
            option: APIApplicationCommandInteractionDataSubcommandGroupOption;
        },
    ): Awaitable<void>;
}

export interface BotSubcommand<
    T extends APIChatInputApplicationCommandInteraction,
    G extends boolean = false,
> {
    data: APIApplicationCommandSubcommandOption;
    handler: (
        this: BotEventContainer,
        props: ToEventProps<T> & {
            option: APIApplicationCommandInteractionDataSubcommandOption;
        } & (G extends true
                ? {
                      groupOption: APIApplicationCommandInteractionDataSubcommandGroupOption;
                  }
                : object),
    ) => Awaitable<void>;
    autocomplete?(
        this: BotEventContainer,
        props: ToEventProps<ApiAutocompleteInteraction<T>> & {
            option: APIApplicationCommandInteractionDataSubcommandOption;
        } & (G extends true
                ? {
                      groupOption: APIApplicationCommandInteractionDataSubcommandGroupOption;
                  }
                : object),
    ): Awaitable<void>;
}

export function createSubcommandsGroup<
    T extends APIChatInputApplicationCommandInteraction,
>(
    group: Require<Partial<BotSubcommandGroup<T>>, 'data'>,
    subcommands: BotSubcommand<T, true>[],
) {
    const collection = new Collection<string, BotSubcommand<T, true>>();

    group.data.options = subcommands.map((subcommand) => {
        collection.set(subcommand.data.name, subcommand);
        return subcommand.data;
    });

    return {
        data: group.data,
        async handler(props) {
            const data = getSubcommandGroupData(
                this.logger,
                collection,
                props.option.options,
            );

            if (typeof data === 'undefined') {
                return;
            }

            await group.handler?.bind(this)(props);
            await data.subcommand.handler.bind({
                ...this,
                logger: data.logger,
            })({
                ...props,
                option: data.subcommandOption,
                groupOption: props.option,
            });
        },
        async autocomplete(props) {
            const data = getSubcommandGroupData(
                this.logger,
                collection,
                props.option.options,
            );

            if (typeof data === 'undefined') {
                return;
            }

            await group.autocomplete?.bind(this)(props);

            const handler = data.subcommand.autocomplete?.bind({
                ...this,
                logger: data.logger,
            });
            if (typeof handler === 'undefined') {
                this.logger.warn('missing handler', {
                    subcommand: data.subcommandOption.name,
                });
                return;
            }

            await handler.bind({
                ...this,
                logger: data.logger,
            })({
                ...props,
                option: data.subcommandOption,
                groupOption: props.option,
            });
        },
    } satisfies BotSubcommandGroup<T>;
}

export function createSubcommandsCommand<
    T extends APIChatInputApplicationCommandInteraction,
>(
    command: Require<Partial<BotInteraction<T>>, 'data'>,
    subcommands: (BotSubcommand<T> | BotSubcommandGroup<T>)[],
) {
    const collection = new Collection<
        string,
        BotSubcommand<T> | BotSubcommandGroup<T>
    >();

    command.data.options = subcommands.map((subcommand) => {
        collection.set(subcommand.data.name, subcommand);
        return subcommand.data;
    });

    return {
        data: command.data,
        async handler(props) {
            const data = getSubcommandData(
                this.logger,
                collection,
                props.data.data.options,
            );

            if (typeof data === 'undefined') {
                return;
            }

            await command.handler?.bind(this)(props);
            await data.subcommand.handler.bind({
                ...this,
                logger: data.logger,
            })({
                ...props,
                //@ts-ignore
                option: data.subcommandOption,
            });
        },
        async autocomplete(props) {
            const data = getSubcommandData(
                this.logger,
                collection,
                props.data.data.options,
            );

            if (typeof data === 'undefined') {
                return;
            }

            await command.autocomplete?.bind(this)(props);

            const handler = data.subcommand.autocomplete?.bind({
                ...this,
                logger: data.logger,
            });
            if (typeof handler === 'undefined') {
                this.logger.warn('missing handler', {
                    subcommand: data.subcommandOption.name,
                });
                return;
            }

            await handler.bind({
                ...this,
                logger: data.logger,
            })({
                ...props,
                //@ts-ignore
                option: data.subcommandOption,
            });
        },
    } satisfies BotInteraction<T>;
}

function getSubcommandGroupData<
    T extends APIChatInputApplicationCommandInteraction,
>(
    logger: Logger,
    collection: Collection<string, BotSubcommand<T, true>>,
    options: APIApplicationCommandInteractionDataOption[] = [],
) {
    const subcommandOption = options[0];
    if (
        typeof subcommandOption === 'undefined' ||
        subcommandOption.type !== ApplicationCommandOptionType.Subcommand
    ) {
        logger.warn('missing subcommand');
        return;
    }

    const subcommand = collection.get(subcommandOption.name);
    if (typeof subcommand === 'undefined') {
        logger.warn('missing subcommand handler', {
            subcommand: subcommandOption.name,
        });
        return;
    }

    return {
        subcommand,
        subcommandOption,
        logger: logger.child(subcommandOption.name),
    };
}

function getSubcommandData<T extends APIChatInputApplicationCommandInteraction>(
    logger: Logger,
    collection: Collection<string, BotSubcommand<T> | BotSubcommandGroup<T>>,
    options: APIApplicationCommandInteractionDataOption[] = [],
) {
    const subcommandOption = options[0];
    if (
        typeof subcommandOption === 'undefined' ||
        (subcommandOption.type !== ApplicationCommandOptionType.Subcommand &&
            subcommandOption.type !==
                ApplicationCommandOptionType.SubcommandGroup)
    ) {
        logger.warn('missing subcommand or subcommand group');
        return;
    }

    const subcommand = collection.get(subcommandOption.name);
    if (typeof subcommand === 'undefined') {
        logger.warn('missing subcommand or subcommand group handler', {
            subcommand: subcommandOption.name,
        });
        return;
    }

    return {
        subcommand,
        subcommandOption,
        logger: logger.child(subcommandOption.name),
    };
}
