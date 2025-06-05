// ===== 13. EVENTS/ROLEUPDATE.JS =====
import { EmbedBuilder } from 'discord.js';
import { getGuildSettings } from '../mongoManager.js';

export const roleUpdateLog = {
    name: 'roleUpdate',
    async execute(oldRole, newRole) {
        if (oldRole.name === newRole.name && oldRole.color === newRole.color && oldRole.permissions.equals(newRole.permissions)) return;

        try {
            const guildSettings = await getGuildSettings(oldRole.guild.id);

            if (guildSettings.logChannelID && guildSettings.logEvents.includes('roleUpdate')) {
                const logChannel = oldRole.guild.channels.cache.get(guildSettings.logChannelID);
                if (logChannel && logChannel.isTextBased()) {
                    const embed = new EmbedBuilder()
                        .setColor(newRole.hexColor || 0xffa500)
                        .setTitle('Rôle Modifié')
                        .setDescription(`Le rôle **${oldRole.name}** a été modifié.`)
                        .setTimestamp();

                    if (oldRole.name !== newRole.name) {
                        embed.addFields(
                            { name: 'Ancien Nom', value: oldRole.name, inline: true }, 
                            { name: 'Nouveau Nom', value: newRole.name, inline: true }
                        );
                    }
                    if (oldRole.color !== newRole.color) {
                        embed.addFields(
                            { name: 'Ancienne Couleur', value: oldRole.hexColor || '#000000', inline: true }, 
                            { name: 'Nouvelle Couleur', value: newRole.hexColor || '#000000', inline: true }
                        );
                    }
                    if (!oldRole.permissions.equals(newRole.permissions)) {
                        embed.addFields({ name: 'Permissions Modifiées', value: 'Voir les logs Discord pour les détails', inline: false });
                    }

                    try {
                        await logChannel.send({ embeds: [embed] });
                    } catch (sendError) {
                        console.error('Erreur lors de l\'envoi du log de modification de rôle:', sendError);
                    }
                }
            }
        } catch (error) {
            console.error('Erreur dans roleUpdateLog:', error);
        }
    },
};