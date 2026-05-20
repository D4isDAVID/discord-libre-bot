import type { ConfigRepository } from './config.ts';
import type { StatusRepository } from './status.ts';

export interface Repositories {
    config: ConfigRepository;
    status: StatusRepository;
}

export * from './config.ts';
export * from './status.ts';
