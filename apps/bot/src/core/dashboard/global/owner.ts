import type { APIApplication, APIInteraction } from '@discordjs/core';

export function checkOwner(
    application: APIApplication,
    interaction: APIInteraction,
) {
    const user = interaction.member?.user ?? interaction.user;

    if (typeof user === 'undefined') {
        return false;
    }

    if (application.team !== null) {
        return application.team.members.some((m) => m.user.id === user.id);
    }

    if ('owner' in application) {
        return application.owner.id === user.id;
    }

    return false;
}
