// ===== 7. EVENTS/MESSAGEUPDATE.JS =====
import { EmbedBuilder } from 'discord.js';
import { getGuildSettings } from '../mongoManager.js';

export const messageUpdateLog = {
    name: 'messageUpdate',
    async execute(oldMessage, newMessage) {
        if (!oldMessage.guild || oldMessage.author?.bot || oldMessage.content === newMessage.content) return;

        try {
            const guildSettings = await getGuildSettings(oldMessage.guild.id);

            if (guildSettings.logChannelID && guildSettings.logEvents.includes('messageUpdate')) {
                const logChannel = oldMessage.guild.channels.cache.get(guildSettings.logChannelID);
                if (logChannel && logChannel.isTextBased()) {
                    const embed = new EmbedBuilder()
                        .setColor(0xffa500)
                        .setTitle('Message Modifié')
                        .setDescription(`Un message de ${oldMessage.author?.tag || 'Utilisateur inconnu'} a été modifié dans ${oldMessage.channel}. [Voir le message original](${newMessage.url})`)
                        .addFields(
                            { name: 'Auteur', value: oldMessage.author ? `<@${oldMessage.author.id}>` : 'Utilisateur inconnu', inline: true },
                            { name: 'Canal', value: `<#${oldMessage.channel.id}>`, inline: true },
                            { name: 'Ancien contenu', value: oldMessage.content ? oldMessage.content.substring(0, 1024) : 'Contenu non disponible' },
                            { name: 'Nouveau contenu', value: newMessage.content ? newMessage.content.substring(0, 1024) : 'Contenu non disponible' }
                        )
                        .setTimestamp();
                    
                    try {
                        await logChannel.send({ embeds: [embed] });
                    } catch (sendError) {
                        console.error('Erreur lors de l\'envoi du log de modification de message:', sendError);
                    }
                }
            }
        } catch (error) {
            console.error('Erreur dans messageUpdateLog:', error);
        }
    },
};