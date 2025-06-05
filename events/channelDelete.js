// ===== 9. EVENTS/CHANNELDELETE.JS =====
import { EmbedBuilder, ChannelType } from 'discord.js';
import { getGuildSettings } from '../mongoManager.js';

export const channelDeleteLog = {
    name: 'channelDelete',
    async execute(channel) {
        if (!channel.guild) return;

        try {
            const guildSettings = await getGuildSettings(channel.guild.id);

            if (guildSettings.logChannelID && guildSettings.logEvents.includes('channelDelete')) {
                const logChannel = channel.guild.channels.cache.get(guildSettings.logChannelID);
                if (logChannel && logChannel.isTextBased()) {
                    const embed = new EmbedBuilder()
                        .setColor(0xff0000)
                        .setTitle('Canal Supprimé')
                        .setDescription(`Le canal **${channel.name}** a été supprimé.`)
                        .addFields(
                            { name: 'ID du Canal', value: channel.id, inline: true },
                            { name: 'Type', value: ChannelType[channel.type] || 'Inconnu', inline: true },
                            { name: 'Catégorie', value: channel.parent ? channel.parent.name : 'Aucune', inline: true }
                        )
                        .setTimestamp();
                    
                    try {
                        await logChannel.send({ embeds: [embed] });
                    } catch (sendError) {
                        console.error('Erreur lors de l\'envoi du log de suppression de canal:', sendError);
                    }
                }
            }
        } catch (error) {
            console.error('Erreur dans channelDeleteLog:', error);
        }
    },
};