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
import type { Logger, Require } from '@internal/common';
import type { BotEventContainer } from '../../events/index.ts';
import type {
    ApiAutocompleteInteraction,
    BotInteraction,
} from '../interaction.ts';

export interface BotSubcommand<
    T extends APIChatInputApplicationCommandInteraction,
    G extends boolean = false,
> {
    data: APIApplicationCommandSubcommandOption;
    handler(
        this: BotEventContainer,
        props: ToEventProps<T> & {
            option: APIApplicationCommandInteractionDataSubcommandOption;
        } & (G extends true
                ? {
                      groupOption: APIApplicationCommandInteractionDataSubcommandGroupOption;
                  }
                : object),
    ): void | Promise<void>;
    autocomplete?(
        this: BotEventContainer,
        props: ToEventProps<ApiAutocompleteInteraction<T>> & {
            option: APIApplicationCommandInteractionDataSubcommandOption;
        } & (G extends true
                ? {
                      groupOption: APIApplicationCommandInteractionDataSubcommandGroupOption;
                  }
                : object),
    ): void | Promise<void>;
}

export interface BotSubcommandGroup<
    T extends APIChatInputApplicationCommandInteraction,
> {
    data: APIApplicationCommandSubcommandGroupOption;
    handler(
        this: BotEventContainer,
        props: ToEventProps<T> & {
            option: APIApplicationCommandInteractionDataSubcommandGroupOption;
        },
    ): void | Promise<void>;
    autocomplete?(
        this: BotEventContainer,
        props: ToEventProps<ApiAutocompleteInteraction<T>> & {
            option: APIApplicationCommandInteractionDataSubcommandGroupOption;
        },
    ): void | Promise<void>;
}

export function createSubcommandsGroup<
    T extends APIChatInputApplicationCommandInteraction,
>(
    group: Require<Partial<BotSubcommandGroup<T>>, 'data'>,
    subcommands: BotSubcommand<T, true>[],
): Required<BotSubcommandGroup<T>> {
    const map = new Map<string, BotSubcommand<T, true>>();

    group.data.options = subcommands.map((subcommand) => {
        map.set(subcommand.data.name, subcommand);

        return subcommand.data;
    });

    return {
        data: group.data,
        async handler(props) {
            const data = getSubcommandGroupData(
                this.logger,
                map,
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
                option: data.option,
                groupOption: props.option,
            });
        },
        async autocomplete(props) {
            const data = getSubcommandGroupData(
                this.logger,
                map,
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
                data.logger.warn('missing autocomplete handler');

                return;
            }

            await handler({
                ...props,
                option: data.option,
                groupOption: props.option,
            });
        },
    };
}

export function createSubcommandsCommand<
    T extends APIChatInputApplicationCommandInteraction,
>(
    command: Require<Partial<BotInteraction<T>>, 'data'>,
    subcommands: (BotSubcommand<T> | BotSubcommandGroup<T>)[],
): Required<BotInteraction<T>> {
    const map = new Map<string, BotSubcommand<T> | BotSubcommandGroup<T>>();

    command.data.options = subcommands.map((subcommand) => {
        map.set(subcommand.data.name, subcommand);

        return subcommand.data;
    });

    return {
        data: command.data,
        async handler(props) {
            const data = getSubcommandData(
                this.logger,
                map,
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
                //@ts-expect-error
                option: data.option,
            });
        },
        async autocomplete(props) {
            const data = getSubcommandData(
                this.logger,
                map,
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
                data.logger.warn('missing autocomplete handler');

                return;
            }

            await handler({
                ...props,
                //@ts-expect-error
                option: data.option,
            });
        },
    };
}

function getSubcommandGroupData<
    T extends APIChatInputApplicationCommandInteraction,
>(
    logger: Logger,
    registry: Map<string, BotSubcommand<T, true>>,
    options: APIApplicationCommandInteractionDataOption[] = [],
) {
    const option = options[0];

    if (
        typeof option === 'undefined'
        || option.type !== ApplicationCommandOptionType.Subcommand
    ) {
        logger.warn('missing subcommand in subcommand group');

        return;
    }

    const subcommand = registry.get(option.name);

    if (typeof subcommand === 'undefined') {
        logger.warn('missing subcommand handler', {
            subcommand: option.name,
        });

        return;
    }

    return {
        option,
        subcommand,
        logger: logger.child({ subcommand: option.name }),
    };
}

function getSubcommandData<T extends APIChatInputApplicationCommandInteraction>(
    logger: Logger,
    registry: Map<string, BotSubcommand<T> | BotSubcommandGroup<T>>,
    options: APIApplicationCommandInteractionDataOption[] = [],
) {
    const option = options[0];

    if (
        typeof option === 'undefined'
        || (option.type !== ApplicationCommandOptionType.Subcommand
            && option.type !== ApplicationCommandOptionType.SubcommandGroup)
    ) {
        logger.warn('missing subcommand or subcommand group');

        return;
    }

    const subcommand = registry.get(option.name);

    if (typeof subcommand === 'undefined') {
        logger.warn('missing subcommand or subcommand group handler', {
            subcommand: option.name,
        });

        return;
    }

    return {
        option,
        subcommand,
        logger: logger.child({ subcommand: option.name }),
    };
}
