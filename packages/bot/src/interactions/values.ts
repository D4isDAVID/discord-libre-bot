import {
    type APIApplicationCommandInteractionDataBasicOption,
    type APIApplicationCommandInteractionDataOption,
    type APIApplicationCommandInteractionDataSubcommandOption,
    type APIChatInputApplicationCommandInteractionData,
    type APIModalSubmission,
    type APIModalSubmissionComponent,
    ApplicationCommandOptionType,
    ComponentType,
    type ModalSubmitComponent,
} from '@discordjs/core';

const basicOptionTypes = [
    ApplicationCommandOptionType.String,
    ApplicationCommandOptionType.Integer,
    ApplicationCommandOptionType.Boolean,
    ApplicationCommandOptionType.User,
    ApplicationCommandOptionType.Channel,
    ApplicationCommandOptionType.Role,
    ApplicationCommandOptionType.Mentionable,
    ApplicationCommandOptionType.Number,
    ApplicationCommandOptionType.Attachment,
];

function isBasicOption(
    option: APIApplicationCommandInteractionDataOption,
): option is APIApplicationCommandInteractionDataBasicOption {
    return basicOptionTypes.includes(option.type);
}

type MappedChatInputOptionValues = Record<string, string | number | boolean>;

export function mapChatInputOptionValues({
    options = [],
}:
    | APIChatInputApplicationCommandInteractionData
    | APIApplicationCommandInteractionDataSubcommandOption): MappedChatInputOptionValues {
    return options.reduce((values: MappedChatInputOptionValues, option) => {
        if (isBasicOption(option)) {
            values[option.name] = option.value;
        }

        return values;
    }, {});
}

function extractModalComponentInputData(wrapper: APIModalSubmissionComponent) {
    let component: ModalSubmitComponent | undefined;

    if (wrapper.type === ComponentType.ActionRow) {
        component = wrapper.components[0];
    } else if (wrapper.type === ComponentType.Label) {
        component = wrapper.component;
    }

    if (typeof component === 'undefined') {
        return;
    }

    return {
        id: component?.custom_id,
        value:
            component.type === ComponentType.TextInput
                ? component.value
                : component.values,
    };
}

type MappedModalComponentValues = Record<string, string | string[]>;

export function mapModalComponentInputValues({
    components,
}: APIModalSubmission): MappedModalComponentValues {
    return components.reduce(
        (values: MappedModalComponentValues, component) => {
            const data = extractModalComponentInputData(component);
            if (typeof data !== 'undefined') {
                values[data.id] = data.value;
            }

            return values;
        },
        {},
    );
}
