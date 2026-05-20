import type { Repositories } from '../../interfaces/index.ts';
import {
    MockConfigRepository,
    type MockConfigRepositoryOptions,
} from './config.ts';
import {
    MockStatusRepository,
    type MockStatusRepositoryOptions,
} from './status.ts';

export interface MockRepositoriesOptions {
    config?: MockConfigRepositoryOptions;
    status?: MockStatusRepositoryOptions;
}

export class MockRepositories implements Repositories {
    config: MockConfigRepository;
    status: MockStatusRepository;

    constructor(options: MockRepositoriesOptions = {}) {
        this.config = new MockConfigRepository(options.config);
        this.status = new MockStatusRepository(options.status);
    }
}
