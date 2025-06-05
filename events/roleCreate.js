// ===== 11. EVENTS/ROLECREATE.JS =====
import { EmbedBuilder } from 'discord.js';
import { getGuildSettings } from '../mongoManager.js';

export const roleCreateLog = {
    name: 'roleCreate',
    async execute(role) {
        try {
            const guildSettings = await getGuildSettings(role.guild.id);

            if (guildSettings.logChannelID && guildSettings.logEvents.includes('roleCreate')) {
                const logChannel = role.guild.channels.cache.get(guildSettings.logChannelID);
                if (logChannel && logChannel.isTextBased()) {
                    const embed = new EmbedBuilder()
                        .setColor(role.hexColor || 0x00ff00)
                        .setTitle('Nouveau Rôle Créé')
                        .setDescription(`Le rôle **${role.name}** a été créé.`)
                        .addFields(
                            { name: 'ID du Rôle', value: role.id, inline: true },
                            { name: 'Couleur', value: role.hexColor || '#000000', inline: true },
                            { name: 'Mentionnable', value: role.mentionable ? 'Oui' : 'Non', inline: true }
                        )
                        .setTimestamp();
                    
                    try {
                        await logChannel.send({ embeds: [embed] });
                    } catch (sendError) {
                        console.error('Erreur lors de l\'envoi du log de création de rôle:', sendError);
                    }
                }
            }
        } catch (error) {
            console.error('Erreur dans roleCreateLog:', error);
        }
    },
};