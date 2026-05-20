import type {
    APIApplicationCommandInteractionDataSubcommandOption,
    APIChatInputApplicationCommandInteractionData,
    APIModalSubmission,
    APIModalSubmissionComponent,
    ModalSubmitComponent,
} from '@discordjs/core';

type MappedChatInputOptionValues = Record<string, string | number | boolean>;

export function mapChatInputOptionValues({
    options = [],
}:
    | APIChatInputApplicationCommandInteractionData
    | APIApplicationCommandInteractionDataSubcommandOption): MappedChatInputOptionValues {
    return options.reduce((values: MappedChatInputOptionValues, option) => {
        if ('value' in option) {
            values[option.name] = option.value;
        }

        return values;
    }, {});
}

function getModalChildComponentData(wrapper: APIModalSubmissionComponent) {
    let component: ModalSubmitComponent | undefined;

    if ('component' in wrapper) {
        component = wrapper.component;
    } else if ('components' in wrapper) {
        component = wrapper.components[0];
    }

    if (typeof component === 'undefined') {
        return;
    }

    return {
        id: component.custom_id,
        value: 'value' in component ? component.value : component.values,
    };
}

type MappedModalSubmitValues = Record<
    string,
    string | string[] | boolean | null
>;

export function mapModalSubmitInputValues({
    components,
}: APIModalSubmission): MappedModalSubmitValues {
    return components.reduce((values: MappedModalSubmitValues, component) => {
        const data = getModalChildComponentData(component);

        if (typeof data !== 'undefined') {
            values[data.id] = data.value;
        }

        return values;
    }, {});
}
