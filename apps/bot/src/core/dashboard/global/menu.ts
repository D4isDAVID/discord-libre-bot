import {
    type APIMessageComponentButtonInteraction,
    ButtonStyle,
    ComponentType,
} from '@discordjs/core';
import {
    arraySerializer,
    type BotSectionedMenuSection,
    boolSerializer,
    createBotMenu,
    createBotSectionedMenu,
    createStatefulInteraction,
    intSerializer,
    stringSerializer,
} from '@internal/bot';

const featureData: Record<string> = {
    core: {
        option: {
            emoji: { name: '⚙️' },
            label: 'Core',
        },
    },
};

export const globalFeatureMenu = createBotMenu<string>({
    async build(getComponentId, featureName) {
        const data =
            typeof featureName === 'undefined'
                ? undefined
                : featureData[featureName];

        if (typeof featureName === 'undefined' || typeof data === 'undefined') {
            return [];
        }

        const enabled =
            await this.logic.config.isFeatureEnabledGlobally(featureName);

        return [
            {
                type: ComponentType.Section,
                components: [
                    {
                        type: ComponentType.TextDisplay,
                        content: `${data.emoji} ${data.label}`,
                    },
                    {
                        type: ComponentType.TextDisplay,
                        content: data.description,
                    },
                ],
                accessory: {
                    ...toggleFeatureButton,
                    style: enabled ? ButtonStyle.Danger : ButtonStyle.Success,
                    emoji: { name: enabled ? '🛑' : '🚀' },
                    label: enabled ? 'Disable' : 'Enable',
                },
                id: getComponentId(),
            },
        ];
    },
});

export const toggleFeatureButton = createStatefulInteraction<
    APIMessageComponentButtonInteraction,
    [number, string, boolean]
>(arraySerializer(intSerializer, stringSerializer, boolSerializer), {
    data: {
        type: ComponentType.Button,
        custom_id: 'global_toggle_feature',
        style: ButtonStyle.Success,
    },
    async handler({
        data: interaction,
        api,
        state: [componentId, featureName, enable],
    }) {
        const container = interaction.message.components?.[0];

        if (
            typeof container === 'undefined'
            || container.type !== ComponentType.Container
        ) {
            return;
        }

        await api.interactions.deferMessageUpdate(
            interaction.id,
            interaction.token,
        );

        await this.logic.config[
            enable ? 'enableFeatureGlobally' : 'disableFeatureGlobally'
        ](featureName);

        const build = await globalFeatureMenu.editContainer.bind(this)(
            container,
            componentId,
            featureName,
        );

        await api.interactions.editReply(
            interaction.application_id,
            interaction.token,
            {
                components: [build],
            },
        );
    },
});

export const globalDashboardMenu = createBotSectionedMenu({
    menuId: 'global_dashboard',
    select: {
        placeholder: 'Select Feature to Manage',
    },
    sections: Object.entries(featureData).reduce(
        (obj, [featureName, option]) => {
            obj[featureName] = {
                option,
                async build(getComponentId) {
                    return await globalFeatureMenu.build.bind(this)(
                        getComponentId,
                        featureName,
                    );
                },
            };

            return obj;
        },
        {} as Record<string, BotSectionedMenuSection>,
    ),
});
