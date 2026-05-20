import { inspect } from 'node:util';
import {
    type APIApplicationCommandAutocompleteInteraction,
    type APIApplicationCommandInteraction,
    type APIChatInputApplicationCommandInteraction,
    type APIInteraction,
    type APIMessageComponentInteraction,
    type APIModalSubmitInteraction,
    GatewayDispatchEvents,
    InteractionType,
    MessageFlags,
    type RESTPutAPIApplicationCommandsJSONBody,
    type ToEventProps,
} from '@discordjs/core';
import type { Logger } from '@internal/common';
import type { Repositories } from '@internal/data';
import type { BotCache } from '../cache/index.ts';
import type { BotClient } from '../client.ts';
import type { BotEventContainer } from '../events/event.ts';
import type { BotFeatureHandler } from '../features.ts';
import type { BotLogic } from '../logic/index.ts';
import type { InteractionData } from './data/index.ts';
import type { BotInteraction, GenericBotInteraction } from './interaction.ts';
import { haveCommandsChanged } from './predicate.ts';
import {
    type ApiStatefulInteraction,
    isStatefulInteraction,
} from './stateful/stateful.ts';

export interface BotInteractions {
    commands: GenericBotInteraction<APIApplicationCommandInteraction>[];
    messageComponents: GenericBotInteraction<APIMessageComponentInteraction>[];
    modals: GenericBotInteraction<APIModalSubmitInteraction>[];
}

export interface BotInteractionHandlerOptions {
    logger: Logger;
    client: BotClient;
    cache: BotCache;
    db: Repositories;
    features: BotFeatureHandler;
    logic: BotLogic;
}

interface Listener<T extends APIInteraction> {
    data: InteractionData<T>;
    handler(props: ToEventProps<APIInteraction>): void | Promise<void>;
    autocomplete(
        props: ToEventProps<APIApplicationCommandAutocompleteInteraction>,
    ): void | Promise<void>;
    enabled: boolean;
}

export interface BotInteractionListeners {
    commands: string[];
    messageComponents: string[];
    modals: string[];
}

export class BotInteractionHandler {
    readonly #logger: Logger;
    readonly #client: BotClient;
    readonly #cache: BotCache;
    readonly #db: Repositories;
    readonly #features: BotFeatureHandler;
    readonly #logic: BotLogic;

    readonly #commands = new Map<
        string,
        Listener<APIApplicationCommandInteraction>
    >();
    readonly #messageComponents = new Map<
        string,
        Listener<APIMessageComponentInteraction>
    >();
    readonly #modals = new Map<string, Listener<APIModalSubmitInteraction>>();

    readonly #statefulMessageComponents: string[] = [];
    readonly #statefulModals: string[] = [];

    constructor({
        logger,
        client,
        cache,
        db,
        features,
        logic,
    }: BotInteractionHandlerOptions) {
        this.#logger = logger;
        this.#client = client;
        this.#cache = cache;
        this.#db = db;
        this.#features = features;
        this.#logic = logic;
    }

    setup() {
        this.#logger.trace('registering interaction handler');

        this.#client.on(
            GatewayDispatchEvents.InteractionCreate,
            async (...args) => {
                await this.#interactionCreate(...args);
            },
        );
    }

    async deployCommands() {
        this.#logger.trace('fetching command info');

        const application = await this.#cache.getApplication();
        const globalCommands =
            await this.#client.api.applicationCommands.getGlobalCommands(
                application.id,
                { with_localizations: true },
            );

        const defaultIntegrationTypes = Object.keys(
            application.integration_types_config ?? {},
        )
            .map((t) => Number.parseInt(t, 10))
            .filter((t) => typeof t === 'number' && !Number.isNaN(t));

        const commands: RESTPutAPIApplicationCommandsJSONBody = this.#commands
            .values()
            .toArray()
            .map((command) => ({
                integration_types: defaultIntegrationTypes,
                ...command.data,
            }));

        if (!haveCommandsChanged(commands, globalCommands)) {
            this.#logger.info("not deploying commands as they haven't changed");

            return;
        }

        this.#logger.info('deploying commands');

        await this.#client.api.applicationCommands.bulkOverwriteGlobalCommands(
            application.id,
            commands,
        );
    }

    enable({ commands, messageComponents, modals }: BotInteractionListeners) {
        for (const command of commands) {
            this.#enable(this.#commands, command);
        }

        for (const component of messageComponents) {
            this.#enable(this.#messageComponents, component);
        }

        for (const modal of modals) {
            this.#enable(this.#modals, modal);
        }
    }

    disable({ commands, messageComponents, modals }: BotInteractionListeners) {
        for (const command of commands) {
            this.#disable(this.#commands, command);
        }

        for (const component of messageComponents) {
            this.#disable(this.#messageComponents, component);
        }

        for (const modal of modals) {
            this.#disable(this.#modals, modal);
        }
    }

    bind({
        commands = [],
        messageComponents = [],
        modals = [],
    }: Partial<BotInteractions>): BotInteractionListeners {
        this.#registerStatefuls(
            messageComponents,
            this.#statefulMessageComponents,
        );
        this.#registerStatefuls(modals, this.#statefulModals);

        return {
            commands: this.#bindAll(
                commands,
                this.#commands,
                (c) => c.data.name,
            ),
            messageComponents: this.#bindAll(
                messageComponents,
                this.#messageComponents,
                (c) => c.data.custom_id,
            ),
            modals: this.#bindAll(
                modals,
                this.#modals,
                (m) => m.data.custom_id,
            ),
        };
    }

    #registerStatefuls<
        Interaction extends ApiStatefulInteraction,
        T extends GenericBotInteraction<Interaction>,
    >(interactions: T[], statefuls: string[]) {
        for (const interaction of interactions.filter((i) =>
            isStatefulInteraction<Interaction>(i),
        )) {
            statefuls.push(interaction.data.custom_id);
        }

        statefuls.sort((a, b) => b.length - a.length);
    }

    #bindAll<
        Interaction extends APIInteraction,
        T extends GenericBotInteraction<Interaction>,
    >(
        interactions: T[],
        registry: Map<string, Listener<Interaction>>,
        getId: (interaction: T) => string,
    ): string[] {
        const ids: string[] = [];

        for (const interaction of interactions) {
            const id = this.#bind(interaction, registry, getId);

            if (typeof id !== 'undefined') {
                ids.push(id);
            }
        }

        return ids;
    }

    #bind<
        Interaction extends APIInteraction,
        T extends GenericBotInteraction<Interaction>,
    >(
        interaction: T,
        registry: Map<string, Listener<Interaction>>,
        getId: (interaction: T) => string,
    ): string | undefined {
        const id = getId(interaction);
        const logger = this.#logger.child({ interaction: id });

        if (registry.has(id)) {
            logger.warn('found duplicate interaction id');

            return;
        }

        logger.trace('adding interaction handler');

        const container: BotEventContainer = {
            logger,
            client: this.#client,
            cache: this.#cache,
            db: this.#db,
            features: this.#features,
            logic: this.#logic,
        };
        const handler = interaction.handler.bind(
            container,
        ) as OmitThisParameter<BotInteraction<Interaction>['handler']>;
        const autocomplete =
            'autocomplete' in interaction
                ? (interaction.autocomplete.bind(
                      container,
                  ) as OmitThisParameter<
                      Exclude<
                          BotInteraction<APIChatInputApplicationCommandInteraction>['autocomplete'],
                          undefined
                      >
                  >)
                : () => {
                      logger.warn(
                          'unhandled application command autocomplete interaction',
                      );
                  };

        const data: Listener<Interaction> = {
            data: interaction.data as InteractionData<Interaction>,
            async handler(props: ToEventProps<Interaction>) {
                logger.trace('interaction handled');

                if (!registry.get(id)?.enabled) {
                    await container.client.api.interactions.reply(
                        props.data.id,
                        props.data.token,
                        {
                            content:
                                'This feature is currently globally disabled.',
                            flags: MessageFlags.Ephemeral,
                        },
                    );

                    return;
                }

                try {
                    await handler(props);
                } catch (err) {
                    logger.error(`unhandled error in handler: ${inspect(err)}`);
                }
            },
            async autocomplete(props) {
                logger.trace('interaction handled');

                if (!registry.get(id)?.enabled) {
                    return;
                }

                try {
                    await autocomplete(props);
                } catch (err) {
                    logger.error(`unhandled error in handler: ${inspect(err)}`);
                }
            },
            enabled: false,
        };

        registry.set(id, data);

        return id;
    }

    #enable<Interaction extends APIInteraction>(
        registry: Map<string, Listener<Interaction>>,
        id: string,
    ) {
        const interaction = registry.get(id);

        if (typeof interaction === 'undefined') {
            this.#logger.warn(
                'tried enabling an interaction that does not exist',
                { id },
            );

            return;
        }

        if (interaction.enabled) {
            this.#logger.warn('interaction is already enabled', { id });

            return;
        }

        interaction.enabled = true;
    }

    #disable<Interaction extends APIInteraction>(
        registry: Map<string, Listener<Interaction>>,
        id: string,
    ) {
        const interaction = registry.get(id);

        if (typeof interaction === 'undefined') {
            this.#logger.warn(
                'tried disabling an interaction that does not exist',
                { id },
            );

            return;
        }

        if (!interaction.enabled) {
            this.#logger.warn('interaction is already disabled', { id });

            return;
        }

        interaction.enabled = false;
    }

    async #interactionCreate(props: ToEventProps<APIInteraction>) {
        const { data: interaction } = props;

        switch (interaction.type) {
            case InteractionType.ApplicationCommand: {
                this.#logger.debug('handling application command', {
                    id: interaction.data.name,
                });

                await this.#getInteraction(
                    this.#commands,
                    interaction.data.name,
                )?.handler({ ...props, data: interaction });

                break;
            }
            case InteractionType.MessageComponent: {
                this.#logger.debug('message component', {
                    id: interaction.data.custom_id,
                });

                await this.#getInteraction(
                    this.#messageComponents,
                    interaction.data.custom_id,
                    this.#statefulMessageComponents,
                )?.handler({ ...props, data: interaction });

                break;
            }
            case InteractionType.ApplicationCommandAutocomplete: {
                this.#logger.debug(
                    'handling application command autocomplete',
                    {
                        id: interaction.data.name,
                    },
                );

                await this.#getInteraction(
                    this.#commands,
                    interaction.data.name,
                )?.autocomplete({ ...props, data: interaction });

                break;
            }
            case InteractionType.ModalSubmit: {
                this.#logger.debug('handling modal submission', {
                    id: interaction.data.custom_id,
                });

                await this.#getInteraction(
                    this.#modals,
                    interaction.data.custom_id,
                    this.#statefulModals,
                )?.handler({ ...props, data: interaction });

                break;
            }

            default: {
                this.#logger.warn('unhandled interaction type', {
                    type: interaction.type,
                });

                break;
            }
        }
    }

    #getInteraction<
        Interaction extends APIInteraction,
        T extends Listener<Interaction>,
    >(
        registry: Map<string, T>,
        id: string,
        statefuls: string[] = [],
    ): T | undefined {
        let interaction = registry.get(id);

        if (typeof interaction === 'undefined') {
            const statefulId = statefuls.find((s) => id.startsWith(s));

            if (typeof statefulId !== 'undefined') {
                interaction = registry.get(statefulId);
            }
        }

        if (typeof interaction === 'undefined') {
            this.#logger.warn('unhandled interaction', { id });

            return;
        }

        return interaction;
    }
}
