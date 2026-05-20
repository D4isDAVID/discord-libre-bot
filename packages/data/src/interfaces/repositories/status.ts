import type { Repository } from '../base/index.ts';

export const statusTableName = 'statuses';

export interface StatusReadObject extends StatusWriteObject {
    id: number;
}

export interface StatusWriteObject {
    status: string;
    afk: boolean;
    activityType: number;
    activityName: string;
    activityState: string | null;
    activityUrl: string | null;
}

export interface StatusRepository
    extends Repository<StatusReadObject, StatusWriteObject, 'id'> {}
