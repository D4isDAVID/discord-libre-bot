import { Client, type ClientOptions } from '@discordjs/core';
import { REST, type RESTOptions } from '@discordjs/rest';
import {
    type CreateWebSocketManagerOptions,
    WebSocketManager,
} from '@discordjs/ws';

export interface BotClientOptions extends ClientOptions {
    gateway: WebSocketManager;
}

export class BotClient extends Client {
    declare gateway: WebSocketManager;

    // biome-ignore lint/complexity/noUselessConstructor: changes the types
    constructor(options: BotClientOptions) {
        super(options);
    }
}

export interface CreateBotClientOptions {
    rest?: Partial<RESTOptions>;
    ws?: Omit<CreateWebSocketManagerOptions, 'token' | 'rest'>;
    token?: string;
}

export function createBotClient(
    options: CreateBotClientOptions = {},
): BotClient {
    const rest = new REST(options.rest);
    const ws = new WebSocketManager({
        intents: 0,
        ...options.ws,
        rest,
    });

    if ('token' in options) {
        rest.setToken(options.token);
        ws.setToken(options.token);
    }

    return new BotClient({ rest, gateway: ws });
}
