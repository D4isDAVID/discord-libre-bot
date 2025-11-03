import { inspect } from 'node:util';
import { Collection } from '@discordjs/collection';
import {
    type APIApplicationCommandInteraction,
    type APIChatInputApplicationCommandInteraction,
    type APIInteraction,
    type APIMessageApplicationCommandInteractionData,
    type APIMessageComponentInteraction,
    type APIModalSubmitInteraction,
    type APIPrimaryEntryPointCommandInteraction,
    type APIUserApplicationCommandInteraction,
    GatewayDispatchEvents,
    InteractionType,
    type RESTPutAPIApplicationCommandsJSONBody,
    type ToEventProps,
} from '@discordjs/core';
import type { Awaitable } from '@discordjs/util';
import type { Database } from '@internal/data';
import type { Logger } from '@internal/logger';
import type { BotCache } from '../cache.ts';
import type { BotClient } from '../client.ts';
import {
    type ApiStatefulInteraction,
    isStatefulInteraction,
} from './extensions/stateful.ts';
import type { BotInteraction, GenericBotInteraction } from './interaction.ts';
import { haveCommandsChanged } from './predicates.ts';

export interface BotInteractions {
    commands: GenericBotInteraction<APIApplicationCommandInteraction>[];
    messageComponents: GenericBotInteraction<APIMessageComponentInteraction>[];
    modals: GenericBotInteraction<APIModalSubmitInteraction>[];
}

export interface BotInteractionHandlerOptions {
    logger: Logger;
    client: BotClient;
    cache: BotCache;
    db: Database;
}

export class BotInteractionHandler {
    #logger: Logger;
    #client: BotClient;
    #cache: BotCache;
    #db: Database;

    #commands = new Collection<
        string,
        GenericBotInteraction<APIApplicationCommandInteraction>
    >();
    #messageComponents = new Collection<
        string,
        GenericBotInteraction<APIMessageComponentInteraction>
    >();
    #modals = new Collection<
        string,
        GenericBotInteraction<APIModalSubmitInteraction>
    >();

    #statefulMessageComponents: string[] = [];
    #statefulModals: string[] = [];

    constructor({ logger, client, cache, db }: BotInteractionHandlerOptions) {
        this.#logger = logger;
        this.#client = client;
        this.#cache = cache;
        this.#db = db;
    }

    register({
        commands = [],
        messageComponents = [],
        modals = [],
    }: Partial<BotInteractions>) {
        this.#register(commands, this.#commands, (c) => c.data.name);
        this.#register(
            messageComponents,
            this.#messageComponents,
            (c) => c.data.custom_id,
        );
        this.#register(modals, this.#modals, (m) => m.data.custom_id);

        this.#registerStateful(
            messageComponents,
            this.#statefulMessageComponents,
        );
        this.#registerStateful(modals, this.#statefulModals);
    }

    registerInteractionCreateListener() {
        this.#logger.trace('registering interaction create handler');

        this.#client.on(
            GatewayDispatchEvents.InteractionCreate,
            async (...args) => {
                this.#logger.trace('interaction created');
                try {
                    await this.#interactionCreate(...args);
                } catch (err) {
                    this.#logger.error(
                        `unhandled error in handler: ${inspect(err)}`,
                    );
                }
            },
        );
    }

    async deployCommands() {
        this.#logger.trace('deploying commands');

        const application = await this.#client.api.applications.getCurrent();
        const globalCommands =
            await this.#client.api.applicationCommands.getGlobalCommands(
                application.id,
                { with_localizations: true },
            );

        const commands: RESTPutAPIApplicationCommandsJSONBody =
            this.#commands.map((command) => command.data);

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

    #register<I extends APIInteraction, T extends GenericBotInteraction<I>>(
        interactions: T[],
        collection: Collection<string, T>,
        getId: (interaction: T) => string,
    ) {
        for (const interaction of interactions) {
            const id = getId(interaction);

            this.#logger.trace('adding interaction handler', { id });

            const logger = this.#logger.child(id);
            const handler = interaction.handler.bind({
                client: this.#client,
                logger,
                cache: this.#cache,
                db: this.#db,
            });

            collection.set(id, {
                ...interaction,
                handler: async (...args: Parameters<T['handler']>) => {
                    logger.trace('interaction handled');
                    try {
                        //@ts-ignore we're just wrapping the function, the parameters are the same
                        await handler(...args);
                    } catch (err) {
                        logger.error(
                            `unhandled error in interaction: ${inspect(err)}`,
                        );
                    }
                },
            });
        }
    }

    #registerStateful<
        I extends ApiStatefulInteraction,
        T extends GenericBotInteraction<I>,
    >(interactions: T[], statefuls: string[]) {
        for (const interaction of interactions.filter((i) =>
            isStatefulInteraction(i as BotInteraction<I>),
        )) {
            statefuls.push(interaction.data.custom_id);
        }
        statefuls.sort((a, b) => b.length - a.length);
    }

    async #interactionCreate(props: ToEventProps<APIInteraction>) {
        const { data: interaction } = props;

        switch (interaction.type) {
            case InteractionType.ApplicationCommand: {
                this.#logger.trace('handling application command', {
                    id: interaction.data.name,
                });
                await this.#handleInteraction(
                    interaction.data.name,
                    this.#commands,
                    {
                        ...props,
                        data: interaction as APIChatInputApplicationCommandInteraction &
                            APIMessageApplicationCommandInteractionData &
                            APIUserApplicationCommandInteraction &
                            APIPrimaryEntryPointCommandInteraction,
                    },
                    (i) => i.handler,
                );
                break;
            }

            case InteractionType.MessageComponent: {
                this.#logger.trace('handling message component', {
                    id: interaction.data.custom_id,
                });
                await this.#handleInteraction(
                    interaction.data.custom_id,
                    this.#messageComponents,
                    { ...props, data: interaction },
                    (i) => i.handler,
                    this.#statefulMessageComponents,
                );
                break;
            }

            case InteractionType.ApplicationCommandAutocomplete: {
                this.#logger.trace(
                    'handling application command autocomplete',
                    { id: interaction.data.name },
                );
                await this.#handleInteraction(
                    interaction.data.name,
                    this.#commands,
                    { ...props, data: interaction },
                    (i) => ('autocomplete' in i ? i.autocomplete : null),
                );
                break;
            }

            case InteractionType.ModalSubmit: {
                this.#logger.trace('handling modal submission', {
                    id: interaction.data.custom_id,
                });
                await this.#handleInteraction(
                    interaction.data.custom_id,
                    this.#modals,
                    { ...props, data: interaction },
                    (i) => i.handler,
                    this.#statefulModals,
                );
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

    async #handleInteraction<
        I extends APIInteraction,
        T extends GenericBotInteraction<I>,
        P extends ToEventProps<I>,
    >(
        id: string,
        collection: Collection<string, T>,
        props: P,
        getHandler: (interaction: T) => ((props: P) => Awaitable<void>) | null,
        statefuls: string[] = [],
    ) {
        let interaction = collection.get(id);

        if (typeof interaction === 'undefined') {
            const statefulId = statefuls.find((s) => id.startsWith(s));
            if (typeof statefulId !== 'undefined') {
                interaction = collection.get(statefulId);
            }
        }

        if (typeof interaction === 'undefined') {
            this.#logger.warn('unhandled interaction', { interaction: id });
            return;
        }

        const handler = getHandler(interaction);
        if (handler === null) {
            this.#logger.warn('missing handler', { interaction: id });
            return;
        }

        await handler(props);
    }
}
