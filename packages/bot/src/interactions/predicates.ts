import {
    type _AddUndefinedToPossiblyUndefinedPropertiesOfInterface,
    type APIApplicationCommand,
    type APIApplicationCommandOption,
    type APIApplicationCommandOptionChoice,
    ApplicationCommandOptionType,
    ApplicationCommandType,
    ApplicationIntegrationType,
    type LocalizationMap,
    type RESTGetAPIApplicationCommandsResult,
    type RESTPostAPIApplicationCommandsJSONBody,
    type RESTPutAPIApplicationCommandsJSONBody,
} from '@discordjs/core';

export function haveCommandsChanged(
    newCommands: RESTPutAPIApplicationCommandsJSONBody,
    oldCommands: RESTGetAPIApplicationCommandsResult,
): boolean {
    if (newCommands.length !== oldCommands.length) {
        return true;
    }

    const hasRemovedCommands = oldCommands.some(
        (command) => !newCommands.some((c) => c.name === command.name),
    );
    const hasUpdatedCommands = newCommands.some((command) =>
        hasCommandChanged(
            command,
            oldCommands.find((c) => c.name === command.name),
        ),
    );

    return (
        newCommands.length !== oldCommands.length ||
        hasRemovedCommands ||
        hasUpdatedCommands
    );
}

// biome-ignore lint/complexity/noExcessiveCognitiveComplexity: predicate
export function hasCommandChanged(
    newCommand: RESTPostAPIApplicationCommandsJSONBody,
    oldCommand: APIApplicationCommand | undefined,
): boolean {
    return (
        typeof oldCommand === 'undefined' ||
        newCommand.name !== oldCommand.name ||
        haveLocalizationsChanged(
            newCommand.name_localizations,
            oldCommand.name_localizations,
        ) ||
        ('description' in newCommand &&
            (newCommand.description ?? '') !== oldCommand.description) ||
        haveLocalizationsChanged(
            newCommand.description_localizations,
            oldCommand.description_localizations,
        ) ||
        (newCommand.default_member_permissions ?? null) !==
            oldCommand.default_member_permissions ||
        hasArrayChanged(
            newCommand.integration_types ?? [
                ApplicationIntegrationType.GuildInstall,
            ],
            oldCommand.integration_types ?? [
                ApplicationIntegrationType.GuildInstall,
            ],
        ) ||
        hasArrayChanged(newCommand.contexts, oldCommand.contexts) ||
        (newCommand.type ?? ApplicationCommandType.ChatInput) !==
            oldCommand.type ||
        newCommand.handler !== oldCommand.handler ||
        (newCommand.nsfw ?? false) !== (oldCommand.nsfw ?? false) ||
        haveCommandOptionsChanged(newCommand.options, oldCommand.options)
    );
}

export function haveCommandOptionsChanged(
    newOptions: _AddUndefinedToPossiblyUndefinedPropertiesOfInterface<APIApplicationCommandOption>[] = [],
    oldOptions: APIApplicationCommandOption[] = [],
): boolean {
    return (
        newOptions.length !== oldOptions.length ||
        newOptions.some((v, i) =>
            hasCommandOptionChanged(
                v,
                oldOptions[i] as APIApplicationCommandOption,
            ),
        )
    );
}

// biome-ignore lint/complexity/noExcessiveCognitiveComplexity: predicate
export function hasCommandOptionChanged(
    newOption: _AddUndefinedToPossiblyUndefinedPropertiesOfInterface<APIApplicationCommandOption>,
    oldOption: APIApplicationCommandOption,
): boolean {
    return (
        newOption.type !== oldOption.type ||
        newOption.name !== oldOption.name ||
        haveLocalizationsChanged(
            newOption.name_localizations,
            oldOption.name_localizations,
        ) ||
        newOption.description !== oldOption.description ||
        haveLocalizationsChanged(
            newOption.description_localizations,
            oldOption.description_localizations,
        ) ||
        (newOption.required ?? false) !== (oldOption.required ?? false) ||
        ((newOption.type === ApplicationCommandOptionType.String ||
            newOption.type === ApplicationCommandOptionType.Integer ||
            newOption.type === ApplicationCommandOptionType.Number) &&
            (oldOption.type === ApplicationCommandOptionType.String ||
                oldOption.type === ApplicationCommandOptionType.Integer ||
                oldOption.type === ApplicationCommandOptionType.Number) &&
            (haveCommandOptionChoicesChanged(
                newOption.choices,
                oldOption.choices,
            ) ||
                (newOption.autocomplete ?? false) !==
                    (oldOption.autocomplete ?? false))) ||
        ((newOption.type === ApplicationCommandOptionType.SubcommandGroup ||
            newOption.type === ApplicationCommandOptionType.Subcommand) &&
            (oldOption.type === ApplicationCommandOptionType.SubcommandGroup ||
                oldOption.type === ApplicationCommandOptionType.Subcommand) &&
            haveCommandOptionsChanged(newOption.options, oldOption.options)) ||
        (newOption.type === ApplicationCommandOptionType.Channel &&
            oldOption.type === ApplicationCommandOptionType.Channel &&
            hasArrayChanged(
                newOption.channel_types,
                oldOption.channel_types,
            )) ||
        ((newOption.type === ApplicationCommandOptionType.Integer ||
            newOption.type === ApplicationCommandOptionType.Number) &&
            (oldOption.type === ApplicationCommandOptionType.Integer ||
                oldOption.type === ApplicationCommandOptionType.Number) &&
            (newOption.min_value !== oldOption.min_value ||
                newOption.max_value !== oldOption.max_value)) ||
        (newOption.type === ApplicationCommandOptionType.String &&
            oldOption.type === ApplicationCommandOptionType.String &&
            (newOption.min_length !== oldOption.min_length ||
                newOption.max_length !== oldOption.max_length))
    );
}

export function haveCommandOptionChoicesChanged(
    oldChoices: _AddUndefinedToPossiblyUndefinedPropertiesOfInterface<APIApplicationCommandOptionChoice>[] = [],
    newChoices: APIApplicationCommandOptionChoice[] = [],
): boolean {
    return (
        newChoices.some(
            (choice) => !oldChoices.some((c) => c.name === choice.name),
        ) ||
        oldChoices.some((choice) => {
            const c = newChoices.find((c) => c.name === choice.name);

            return (
                typeof c === 'undefined' ||
                haveLocalizationsChanged(
                    choice.name_localizations,
                    c.name_localizations,
                ) ||
                choice.value !== c.value
            );
        })
    );
}

export function haveLocalizationsChanged(
    newLocales: _AddUndefinedToPossiblyUndefinedPropertiesOfInterface<LocalizationMap> | null = null,
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
        oldKeys.some((key) => !newKeys.some((k) => k === key)) ||
        newKeys.some(
            (key) => (newLocales[key] ?? null) !== (oldLocales[key] ?? null),
        )
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
        newArray.some((v) => !oldArray.includes(v)) ||
        oldArray.some((v) => !newArray.includes(v))
    );
}
