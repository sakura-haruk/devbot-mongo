// Gestionnaire d'événements pour les interactions des boutons
// À placer dans votre fichier d'événements (ex: events/interactionCreate.js)

const { Events } = require('discord.js');

module.exports = {
    name: Events.InteractionCreate,
    async execute(interaction) {
        // Vérifier si c'est une interaction de bouton
        if (!interaction.isButton()) return;

        // Gérer les boutons du règlement
        if (interaction.customId === 'accept_rules' || interaction.customId === 'decline_rules') {
            await handleReglementButtonInteraction(interaction);
        }
    },
};

async function handleReglementButtonInteraction(interaction) {
    try {
        const { customId, user, guild } = interaction;
        
        // Récupérer les paramètres du serveur
        const guildSettings = await getGuildSettings(guild.id);
        
        if (customId === 'accept_rules') {
            // L'utilisateur accepte le règlement
            await interaction.reply({
                content: '✅ Merci d\'avoir accepté le règlement ! Vous allez recevoir vos rôles automatiquement.',
                ephemeral: true
            });
            
            // Attribuer les rôles via le système d'attribution de rôles
            await processRoleAssignment(interaction, 'accept_rules');
            
            // Logger l'acceptation
            await logReglementAcceptance(interaction, true);
            
        } else if (customId === 'decline_rules') {
            // L'utilisateur refuse le règlement
            await interaction.reply({
                content: '❌ Vous avez refusé le règlement. Vous ne pourrez pas accéder aux fonctionnalités du serveur tant que vous n\'acceptez pas les règles.',
                ephemeral: true
            });
            
            // Logger le refus
            await logReglementAcceptance(interaction, false);
        }
        
    } catch (error) {
        console.error('Erreur lors du traitement de l\'interaction du règlement:', error);
        
        if (!interaction.replied) {
            await interaction.reply({
                content: '❌ Une erreur s\'est produite lors du traitement de votre réponse.',
                ephemeral: true
            });
        }
    }
}

// Fonction pour traiter l'attribution de rôles
async function processRoleAssignment(interaction, buttonId) {
    try {
        const guildSettings = await getGuildSettings(interaction.guild.id);
        
        // Chercher les systèmes d'attribution de rôles qui correspondent au bouton
        if (!guildSettings.roleAssignmentSystems) return;
        
        const relevantSystems = guildSettings.roleAssignmentSystems.filter(system => 
            system.enabled && 
            system.condition === 'button_click' && 
            system.triggerData?.buttonId === buttonId &&
            system.targetRole
        );
        
        const member = await interaction.guild.members.fetch(interaction.user.id);
        
        for (const system of relevantSystems) {
            try {
                const role = interaction.guild.roles.cache.get(system.targetRole);
                
                if (role && !member.roles.cache.has(role.id)) {
                    await member.roles.add(role);
                    console.log(`Rôle ${role.name} attribué à ${member.user.tag} via le système ${system.name}`);
                    
                    // Envoyer une notification de succès
                    if (interaction.replied || interaction.deferred) {
                        await interaction.followUp({
                            content: `🎭 Vous avez reçu le rôle **${role.name}** !`,
                            ephemeral: true
                        });
                    }
                }
            } catch (roleError) {
                console.error(`Erreur lors de l'attribution du rôle pour le système ${system.name}:`, roleError);
            }
        }
        
    } catch (error) {
        console.error('Erreur lors du traitement de l\'attribution de rôles:', error);
    }
}

// Fonction pour logger les acceptations/refus du règlement
async function logReglementAcceptance(interaction, accepted) {
    try {
        const guildSettings = await getGuildSettings(interaction.guild.id);
        
        // Vérifier s'il y a un salon de logs configuré
        const logChannelId = guildSettings.logChannelID;
        if (!logChannelId) return;
        
        const logChannel = interaction.guild.channels.cache.get(logChannelId);
        if (!logChannel || !logChannel.isTextBased()) return;
        
        const { EmbedBuilder } = require('discord.js');
        
        const logEmbed = new EmbedBuilder()
            .setTitle('📋 Interaction Règlement')
            .setColor(accepted ? '#2ecc71' : '#e74c3c')
            .addFields(
                { name: '👤 Utilisateur', value: `${interaction.user.tag} (${interaction.user.id})`, inline: true },
                { name: '📅 Date', value: new Date().toLocaleString('fr-FR'), inline: true },
                { name: '✅ Action', value: accepted ? 'Accepté' : 'Refusé', inline: true },
                { name: '💬 Salon', value: `${interaction.channel}`, inline: true }
            )
            .setThumbnail(interaction.user.displayAvatarURL())
            .setTimestamp();
        
        await logChannel.send({ embeds: [logEmbed] });
        
    } catch (error) {
        console.error('Erreur lors du logging de l\'acceptation du règlement:', error);
    }
}

// Fonction helper pour récupérer les paramètres (à adapter selon votre système)
async function getGuildSettings(guildId) {
    // Implémentez selon votre système de base de données
    // Exemple avec un fichier JSON :
    const fs = require('fs').promises;
    const path = require('path');
    
    try {
        const settingsPath = path.join(__dirname, '..', 'data', `${guildId}.json`);
        const data = await fs.readFile(settingsPath, 'utf8');
        return JSON.parse(data);
    } catch (error) {
        return {
            roleAssignmentSystems: [],
            reglementConfig: { enabled: false }
        };
    }
}