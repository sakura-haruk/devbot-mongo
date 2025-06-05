// ===== 6. EVENTS/MESSAGEDELETE.JS =====
import { EmbedBuilder } from 'discord.js';
import { getGuildSettings } from '../mongoManager.js';

export const messageDeleteLog = {
    name: 'messageDelete',
    async execute(message) {
        if (!message.guild || message.author?.bot) return;

        try {
            const guildSettings = await getGuildSettings(message.guild.id);

            if (guildSettings.logChannelID && guildSettings.logEvents.includes('messageDelete')) {
                const logChannel = message.guild.channels.cache.get(guildSettings.logChannelID);
                if (logChannel && logChannel.isTextBased()) {
                    const embed = new EmbedBuilder()
                        .setColor(0xff0000)
                        .setTitle('Message Supprimé')
                        .setDescription(`Un message de ${message.author?.tag || 'Utilisateur inconnu'} a été supprimé dans ${message.channel}.`)
                        .addFields(
                            { name: 'Auteur', value: message.author ? `<@${message.author.id}>` : 'Utilisateur inconnu', inline: true },
                            { name: 'Canal', value: `<#${message.channel.id}>`, inline: true },
                            { name: 'Contenu du message', value: message.content ? message.content.substring(0, 1024) : 'Contenu non disponible ou message embed/fichier.' }
                        )
                        .setTimestamp();
                    
                    try {
                        await logChannel.send({ embeds: [embed] });
                    } catch (sendError) {
                        console.error('Erreur lors de l\'envoi du log de suppression de message:', sendError);
                    }
                }
            }
        } catch (error) {
            console.error('Erreur dans messageDeleteLog:', error);
        }
    },
};