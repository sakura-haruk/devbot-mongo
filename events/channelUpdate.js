// ===== 10. EVENTS/CHANNELUPDATE.JS =====
import { EmbedBuilder, ChannelType } from 'discord.js';
import { getGuildSettings } from '../mongoManager.js';

export const channelUpdateLog = {
    name: 'channelUpdate',
    async execute(oldChannel, newChannel) {
        if (!oldChannel.guild || oldChannel.name === newChannel.name && oldChannel.topic === newChannel.topic && oldChannel.nsfw === newChannel.nsfw) return;

        try {
            const guildSettings = await getGuildSettings(oldChannel.guild.id);

            if (guildSettings.logChannelID && guildSettings.logEvents.includes('channelUpdate')) {
                const logChannel = oldChannel.guild.channels.cache.get(guildSettings.logChannelID);
                if (logChannel && logChannel.isTextBased()) {
                    const embed = new EmbedBuilder()
                        .setColor(0xffa500)
                        .setTitle('Canal Modifié')
                        .setDescription(`Le canal <#${newChannel.id}> a été modifié.`)
                        .addFields(
                            { name: 'Nom Ancien', value: oldChannel.name, inline: true },
                            { name: 'Nom Nouveau', value: newChannel.name, inline: true },
                            { name: 'ID du Canal', value: newChannel.id, inline: true },
                            { name: 'Type', value: ChannelType[newChannel.type] || 'Inconnu', inline: true }
                        )
                        .setTimestamp();

                    if (oldChannel.topic !== newChannel.topic) {
                        embed.addFields(
                            { name: 'Ancien Sujet', value: oldChannel.topic || 'Aucun', inline: false },
                            { name: 'Nouveau Sujet', value: newChannel.topic || 'Aucun', inline: false }
                        );
                    }
                    if (oldChannel.nsfw !== newChannel.nsfw) {
                        embed.addFields({ name: 'NSFW Changé', value: `${oldChannel.nsfw} -> ${newChannel.nsfw}`, inline: false });
                    }

                    try {
                        await logChannel.send({ embeds: [embed] });
                    } catch (sendError) {
                        console.error('Erreur lors de l\'envoi du log de modification de canal:', sendError);
                    }
                }
            }
        } catch (error) {
            console.error('Erreur dans channelUpdateLog:', error);
        }
    },
};
