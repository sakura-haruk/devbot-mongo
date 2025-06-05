// ===== 12. EVENTS/ROLEDELETE.JS =====
import { EmbedBuilder } from 'discord.js';
import { getGuildSettings } from '../mongoManager.js';

export const roleDeleteLog = {
    name: 'roleDelete',
    async execute(role) {
        try {
            const guildSettings = await getGuildSettings(role.guild.id);

            if (guildSettings.logChannelID && guildSettings.logEvents.includes('roleDelete')) {
                const logChannel = role.guild.channels.cache.get(guildSettings.logChannelID);
                if (logChannel && logChannel.isTextBased()) {
                    const embed = new EmbedBuilder()
                        .setColor(0xff0000)
                        .setTitle('Rôle Supprimé')
                        .setDescription(`Le rôle **${role.name}** a été supprimé.`)
                        .addFields(
                            { name: 'ID du Rôle', value: role.id, inline: true },
                            { name: 'Couleur', value: role.hexColor || '#000000', inline: true }
                        )
                        .setTimestamp();
                    
                    try {
                        await logChannel.send({ embeds: [embed] });
                    } catch (sendError) {
                        console.error('Erreur lors de l\'envoi du log de suppression de rôle:', sendError);
                    }
                }
            }
        } catch (error) {
            console.error('Erreur dans roleDeleteLog:', error);
        }
    },
};
