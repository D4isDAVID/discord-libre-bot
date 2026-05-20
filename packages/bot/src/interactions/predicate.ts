import {
    type _AddUndefinedToPossiblyUndefinedPropertiesOfInterface,
    type APIApplicationCommand,
    type APIApplicationCommandChannelOption,
    type APIApplicationCommandIntegerOption,
    type APIApplicationCommandNumberOption,
    type APIApplicationCommandOption,
    type APIApplicationCommandOptionChoice,
    type APIApplicationCommandStringOption,
    type APIApplicationCommandSubcommandGroupOption,
    type APIApplicationCommandSubcommandOption,
    ApplicationCommandOptionType,
    ApplicationCommandType,
    ApplicationIntegrationType,
    type LocalizationMap,
    type RESTGetAPIApplicationCommandsResult,
    type RESTPostAPIApplicationCommandsJSONBody,
    type RESTPutAPIApplicationCommandsJSONBody,
} from '@discordjs/core';

type AddUndefined<T> = _AddUndefinedToPossiblyUndefinedPropertiesOfInterface<T>;

export function haveCommandsChanged(
    newCommands: RESTPutAPIApplicationCommandsJSONBody,
    oldCommands: RESTGetAPIApplicationCommandsResult,
): boolean {
    if (newCommands.length !== oldCommands.length) {
        return true;
    }

    return (
        newCommands.some(
            (command) => !oldCommands.some((c) => c.name === command.name),
        )
        || oldCommands.some((command) =>
            hasCommandChanged(
                newCommands.find((c) => c.name === command.name),
                command,
            ),
        )
    );
}

// biome-ignore lint/complexity/noExcessiveCognitiveComplexity: predicate
export function hasCommandChanged(
    newCommand: RESTPostAPIApplicationCommandsJSONBody | undefined,
    oldCommand: APIApplicationCommand,
): boolean {
    return (
        typeof newCommand === 'undefined'
        || newCommand.name !== oldCommand.name
        || haveLocalizationsChanged(
            newCommand.name_localizations,
            oldCommand.name_localizations,
        )
        || ('description' in newCommand
            && (newCommand.description ?? '') !== oldCommand.description)
        || haveLocalizationsChanged(
            newCommand.description_localizations,
            oldCommand.description_localizations,
        )
        || (newCommand.default_member_permissions ?? null)
            !== oldCommand.default_member_permissions
        || hasArrayChanged(
            newCommand.integration_types ?? [
                ApplicationIntegrationType.GuildInstall,
            ],
            oldCommand.integration_types ?? [
                ApplicationIntegrationType.GuildInstall,
            ],
        )
        || hasArrayChanged(newCommand.contexts, oldCommand.contexts)
        || (newCommand.type ?? ApplicationCommandType.ChatInput)
            !== oldCommand.type
        || newCommand.handler !== oldCommand.handler
        || (newCommand.nsfw ?? false) !== (oldCommand.nsfw ?? false)
        || haveCommandOptionsChanged(newCommand.options, oldCommand.options)
    );
}

export function haveCommandOptionsChanged(
    newOptions: AddUndefined<APIApplicationCommandOption>[] = [],
    oldOptions: APIApplicationCommandOption[] = [],
): boolean {
    return (
        newOptions.length !== oldOptions.length
        || newOptions.some((v, i) =>
            hasCommandOptionChanged(
                v,
                oldOptions[i] as APIApplicationCommandOption,
            ),
        )
    );
}

export function hasCommandOptionChanged(
    newOption: AddUndefined<APIApplicationCommandOption>,
    oldOption: APIApplicationCommandOption,
): boolean {
    return (
        newOption.type !== oldOption.type
        || newOption.name !== oldOption.name
        || haveLocalizationsChanged(
            newOption.name_localizations,
            oldOption.name_localizations,
        )
        || newOption.description !== oldOption.description
        || haveLocalizationsChanged(
            newOption.description_localizations,
            oldOption.description_localizations,
        )
        || (newOption.required ?? false) !== (oldOption.required ?? false)
        || hasCommandOptionChangedBasedOnType(newOption, oldOption)
    );
}

function isStringOption(
    option: AddUndefined<APIApplicationCommandOption>,
): option is AddUndefined<APIApplicationCommandStringOption> {
    return option.type === ApplicationCommandOptionType.String;
}

function isNumberOption(
    option: AddUndefined<APIApplicationCommandOption>,
): option is AddUndefined<
    APIApplicationCommandIntegerOption | APIApplicationCommandNumberOption
> {
    return (
        option.type === ApplicationCommandOptionType.Integer
        || option.type === ApplicationCommandOptionType.Number
    );
}

function isChannelOption(
    option: AddUndefined<APIApplicationCommandOption>,
): option is AddUndefined<APIApplicationCommandChannelOption> {
    return option.type === ApplicationCommandOptionType.Channel;
}

function isSubcommandOption(
    option: AddUndefined<APIApplicationCommandOption>,
): option is AddUndefined<
    | APIApplicationCommandSubcommandOption
    | APIApplicationCommandSubcommandGroupOption
> {
    return (
        option.type === ApplicationCommandOptionType.Subcommand
        || option.type === ApplicationCommandOptionType.SubcommandGroup
    );
}

function doesCommandOptionHaveChoices(
    option: AddUndefined<APIApplicationCommandOption>,
): option is AddUndefined<
    | APIApplicationCommandStringOption
    | APIApplicationCommandIntegerOption
    | APIApplicationCommandNumberOption
> {
    return isStringOption(option) || isNumberOption(option);
}

// biome-ignore lint/complexity/noExcessiveCognitiveComplexity: predicate
function hasCommandOptionChangedBasedOnType(
    newOption: AddUndefined<APIApplicationCommandOption>,
    oldOption: APIApplicationCommandOption,
): boolean {
    return (
        (doesCommandOptionHaveChoices(newOption)
            && doesCommandOptionHaveChoices(oldOption)
            && (haveCommandOptionChoicesChanged(
                newOption.choices,
                oldOption.choices,
            )
                || (newOption.autocomplete ?? false)
                    !== (oldOption.autocomplete ?? false)))
        || (isSubcommandOption(newOption)
            && isSubcommandOption(oldOption)
            && haveCommandOptionsChanged(newOption.options, oldOption.options))
        || (isChannelOption(newOption)
            && isChannelOption(oldOption)
            && hasArrayChanged(
                newOption.channel_types,
                oldOption.channel_types,
            ))
        || (isNumberOption(newOption)
            && isNumberOption(oldOption)
            && (newOption.min_value !== oldOption.min_value
                || newOption.max_value !== oldOption.max_value))
        || (isStringOption(newOption)
            && isStringOption(oldOption)
            && (newOption.min_length !== oldOption.min_length
                || newOption.max_length !== oldOption.max_length))
    );
}

export function haveCommandOptionChoicesChanged(
    newChoices: AddUndefined<APIApplicationCommandOptionChoice>[] = [],
    oldChoices: APIApplicationCommandOptionChoice[] = [],
): boolean {
    return (
        newChoices.some(
            (choice) => !oldChoices.some((c) => c.name === choice.name),
        )
        || oldChoices.some((choice) => {
            const c = newChoices.find((c) => c.name === choice.name);

            return (
                typeof c === 'undefined'
                || haveLocalizationsChanged(
                    c.name_localizations,
                    choice.name_localizations,
                )
                || c.value !== choice.value
            );
        })
    );
}

export function haveLocalizationsChanged(
    newLocales: AddUndefined<LocalizationMap> | null = null,
    oldLocales: LocalizationMap | null = null,
): boolean {
    if (newLocales === null || oldLocales === null) {
        return newLocales !== oldLocales;
    }

    const newKeys = Object.keys(newLocales) as (keyof LocalizationMap)[];
    const oldKeys = Object.keys(oldLocales) as (keyof LocalizationMap)[];

    if (newKeys.length === 0 || oldKeys.length === 0) {
        return newKeys.length !== oldKeys.length;
    }

    return (
        newKeys.some((k) => (oldLocales[k] ?? null) !== (newLocales[k] ?? null))
        || oldKeys.some((k) => !newKeys.includes(k))
    );
}

export function hasArrayChanged<T>(
    newArray: T[] | null = null,
    oldArray: T[] | null = null,
): boolean {
    if (newArray === null || oldArray === null) {
        return newArray !== oldArray;
    }

    if (newArray.length === 0 || oldArray.length === 0) {
        return newArray.length !== oldArray.length;
    }

    return (
        newArray.some((v) => !oldArray.includes(v))
        || oldArray.some((v) => !newArray.includes(v))
    );
}
