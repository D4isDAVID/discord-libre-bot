import type { BotFeature } from '@internal/bot';
import { dashboardCommand } from './dashboard/command.ts';
import { globalDashboardButton } from './dashboard/global/button.ts';
import {
    cool,
    globalDashboardMenu,
    paginatedOne,
    paginatedTwo,
} from './dashboard/global/menu.ts';
import { pingCommand } from './ping.ts';
import { statusReadyEvent } from './status.ts';

export const coreFeature: BotFeature = {
    name: 'core',
    events: {
        gatewayDispatch: [statusReadyEvent],
    },
    interactions: {
        commands: [pingCommand, dashboardCommand],
        messageComponents: [
            globalDashboardButton,
            paginatedOne.pageButton,
            paginatedTwo.pageButton,
            globalDashboardMenu.sectionSelect,
            cool.button,
        ],
    },
};
