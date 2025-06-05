// index.js - VERSION COMPLÈTE ET CORRIGÉE
// Chargement des variables d'environnement
import dotenv from "dotenv";
dotenv.config();

const token = process.env.DISCORD_TOKEN;
const clientId = process.env.CLIENT_ID;
const clientSecret = process.env.CLIENT_SECRET;
const callbackUrl = process.env.CALLBACK_URL;

import fetch from 'node-fetch';
import { v4 as uuidv4 } from 'uuid';

if (!token || !clientId || !clientSecret || !callbackUrl) {
  console.error("❌ Erreur : Des variables d'environnement sont manquantes ! (DISCORD_TOKEN, CLIENT_ID, CLIENT_SECRET, CALLBACK_URL)");
  process.exit(1);
}

console.log("🔑 Token et identifiants chargés.");
console.log("Démarrage du bot...");

process.on('uncaughtException', (error) => console.error('Erreur non capturée:', error));
process.on('unhandledRejection', (reason, promise) => console.error('Rejet non géré:', reason, promise));

import { DisTube } from 'distube';
import {
  GatewayIntentBits,
  Collection,
  PermissionsBitField,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  ChannelType,
  EmbedBuilder,
  ActivityType,
  Partials
} from "discord.js";
import { YtDlpPlugin } from '@distube/yt-dlp';
import express from 'express';
import expressLayouts from 'express-ejs-layouts';
import session from 'express-session';
import passport from 'passport';
import { Strategy } from 'passport-discord';
import path from 'path';
import { fileURLToPath } from 'url';
import * as fs from 'fs';

// ===== CLIENT CORRIGÉ =====
import { Client } from 'discord.js';
import { mongoManager, initializeDataStructure, getGuildSettings, saveGuildSettings, createBackup, cleanupOldBackups } from './mongoManager.js';
await mongoManager.connect();

import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Client Discord avec TOUS les intents et partials nécessaires
export const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildVoiceStates,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildMessageReactions, // ✅ CRUCIAL pour les réactions
    GatewayIntentBits.GuildModeration
  ],
  partials: [
    Partials.Channel,
    Partials.Message,
    Partials.Reaction,      // ✅ CRUCIAL pour les réactions sur anciens messages
    Partials.User,
    Partials.GuildMember
  ]
});

// Managers et Commandes
import { musiqueCommandes, musiqueHelp, setupMusique } from './commandes/musique.js';
import { moderationCommands, moderationHelp } from './commandes/moderation.js';
import { AutoFeaturesCommands, AutoReactsAndReplies, autoHelp } from './commandes/auto.js';
import {
  handleOthersCommand,
  handleButtonInteraction as handleOtherButtonInteraction,
  helpFields
} from './commandes/autre.js';
import { ticketCommand } from './commandes/ticket.js';
import { testCommand, testHelp } from './commandes/test.js';
import { handleRoleAssignment, createRuleAcceptanceMessage, configureRoleSystem, roleAssignmentHelp } from './commandes/roleAssignment.js';

// Modules de Logs d'événements
import { messageDeleteLog } from './events/messageDelete.js';
import { messageUpdateLog } from './events/messageUpdate.js';
import { channelCreateLog } from './events/channelCreate.js';
import { channelDeleteLog } from './events/channelDelete.js';
import { channelUpdateLog } from './events/channelUpdate.js';
import { roleCreateLog } from './events/roleCreate.js';
import { roleDeleteLog } from './events/roleDelete.js';
import { roleUpdateLog } from './events/roleUpdate.js';

// ---- IMPORTS POUR LA TRADUCTION ----
import {
  handleMessageTranslation,
  supportedLanguagesMap
} from './fonction/traduction.js';
import { LANGUE_CODES } from './config.js';

// === IMPORTS DES JEUX ===
import {
  data as chifumiData,
  execute as chifumiExecute,
  handleChifumiComponent
} from './commandes/jeux/chifumi.js';
import {
  data as morpionData,
  execute as morpionExecute,
  handleMorpionComponent
} from './commandes/jeux/morpion.js';
import {
  data as p4Data,
  execute as p4Execute,
  handleP4Component
} from './commandes/jeux/puissance4.js';
import {
  data as bingoData,
  execute as bingoExecute
} from './commandes/jeux/bingo.js';
import {
  data as penduData,
  execute as penduExecute,
  handlePenduComponent
} from './commandes/jeux/pendu.js';
import {
  data as demineurData,
  execute as demineurExecute,
  handleDemineurComponent
} from './commandes/jeux/demineur.js';
import {
  data as colormindData,
  execute as colormindExecute,
  handleColormindComponent
} from './commandes/jeux/colormind.js';

// === FONCTIONS HELPER POUR LE RÈGLEMENT ===
function buildReglementFromForm(body) {
  return {
    enabled: body.reglementEnabled === 'on',
    title: body.reglementTitle || 'Règlement du Serveur',
    description: body.reglementDescription || 'Veuillez lire et accepter notre règlement pour accéder au serveur.',
    color: body.reglementColor || '#7289DA',
    sections: getDefaultReglementSections(),
    footerText: body.footerText || 'En acceptant, vous obtiendrez automatiquement vos rôles d\'accès',
    showThumbnail: body.showThumbnail === 'on',
    showTimestamp: body.showTimestamp === 'on',
    acceptButtonText: body.acceptButtonText || '✅ J\'accepte le règlement',
    declineButtonText: body.declineButtonText || '❌ Je refuse',
    acceptButtonEmoji: body.acceptButtonEmoji || '📋',
    declineButtonEmoji: body.declineButtonEmoji || '🚫'
  };
}

function getDefaultReglementSections() {
  return [
    {
      name: '⚓ 1. Respect & Conduite générale',
      value: '🔹 Respect entre tous les membres, y compris l’équipe de support.\n🔹 Propos haineux, sexistes, racistes, homophobes, transphobes = sanction immédiate.\n🔹 Provocations, moqueries ou attaques personnelles même “pour rire” sont interdites.',
      inline: false
    },
    {
      name: '🔇 2. Pas de spam, flood ou pub',
      value: '🔸 Spam de messages, émojis ou mentions = interdit.\n🔸 Flood de messages inutiles ou répétitifs = interdit.\n🔸 Aucune pub (serveurs, chaînes, bots, etc.) sans accord.\n🔸 Pas d’invitations envoyées en MP à d’autres membres.',
      inline: false
    },
    {
      name: '📁 3. Utilisation correcte des salons',
      value: '💬 Utilisez chaque salon pour son usage spécifique (support, suggestions, annonces, tests, etc.).\nLes messages hors sujet pourront être supprimés.',
      inline: false
    },
    {
      name: '🛠️ 4. Demandes de support',
      value: '🔹 Vérifiez la documentation et les messages précédents.\n🔹 Soyez clairs : commande, erreur, capture d’écran, etc.\nUn support efficace dépend de votre clarté.',
      inline: false
    },
    {
      name: '🚫 5. Contenu interdit',
      value: '❌ NSFW / pornographie / violence / propos choquants\n❌ Piratage, cracks, logiciels malveillants\n❌ Liens frauduleux, scams\n❌ Sujets politiques, religieux, polémiques',
      inline: false
    },
    {
      name: '🧾 6. Pseudonymes & avatars',
      value: '🔸 Pas de pseudos ou avatars provocateurs, haineux, sexuels.\n🔸 Ils seront modifiés ou sanctionnés si inappropriés.',
      inline: false
    },
    {
      name: '🛡️ 7. Modération & sanctions',
      value: '⚖️ L’équipe peut supprimer du contenu, avertir, mute, kick ou bannir selon la gravité.\nLes décisions sont finales.',
      inline: false
    },
    {
      name: '📬 8. Suggestions & feedback',
      value: '🧠 Proposez vos idées dans ⁠💭⫸・suggestions.\nSoyez clairs et constructifs.',
      inline: false
    },
    {
      name: '🔐 9. Vie privée & sécurité',
      value: '🔹 Ne partagez jamais d’infos personnelles.\n🔹 L’équipe ne demande jamais vos identifiants Discord.\n🔹 Signalez tout comportement suspect.',
      inline: false
    },
    {
      name: '🧭 10. Rappels importants',
      value: '🛠️ L’équipe est bénévole, soyez patients.\n❓ Posez vos questions dans les bons salons.\n🚧 Le serveur est un espace d’entraide, pas un service à la demande.',
      inline: false
    }
  ];
}

function getDefaultReglementConfig() {
  return {
    enabled: false,
    title: 'Règlement du Serveur',
    description: 'Veuillez lire et accepter notre règlement pour accéder au serveur.',
    color: '#7289DA',
    sections: getDefaultReglementSections(),
    footerText: 'En acceptant, vous obtiendrez automatiquement vos rôles d\'accès',
    showThumbnail: true,
    showTimestamp: true,
    acceptButtonText: '✅ J\'accepte le règlement',
    declineButtonText: '❌ Je refuse',
    acceptButtonEmoji: '📋',
    declineButtonEmoji: '🚫'
  };
}

// Fonction pour créer l'embed du règlement
function createReglementEmbed(config, guild) {
  const embed = new EmbedBuilder()
    .setTitle(config.title || 'Règlement du Serveur')
    .setDescription(config.description || 'Veuillez lire et accepter notre règlement.')
    .setColor(config.color || '#7289DA');

  // Ajouter les sections
  if (config.sections && config.sections.length > 0) {
    config.sections.forEach(section => {
      if (section.name && section.value) {
        // Convertir \n en véritables retours à la ligne
        const formattedValue = section.value.replace(/\\n/g, '\n');
        
        embed.addFields({
          name: section.name,
          value: formattedValue,
          inline: section.inline || false
        });
      }
    });
  }

  // Ajouter le footer si défini
  if (config.footerText) {
    const formattedFooter = config.footerText.replace(/\\n/g, '\n');
    embed.setFooter({ 
      text: formattedFooter,
      iconURL: guild.iconURL() 
    });
  }

  // Ajouter la thumbnail si activée
  if (config.showThumbnail !== false && guild.iconURL()) {
    embed.setThumbnail(guild.iconURL());
  }

  // Ajouter le timestamp si activé
  if (config.showTimestamp !== false) {
    embed.setTimestamp();
  }

  return embed;
}

// Fonction pour créer les boutons du règlement
function createReglementButtons(config) {
  const acceptButton = new ButtonBuilder()
    .setCustomId('accept_rules')
    .setLabel(config.acceptButtonText || '✅ J\'accepte le règlement')
    .setStyle(ButtonStyle.Success);

  // Ajouter l'emoji si défini
  if (config.acceptButtonEmoji) {
    acceptButton.setEmoji(config.acceptButtonEmoji);
  }

  const declineButton = new ButtonBuilder()
    .setCustomId('decline_rules')
    .setLabel(config.declineButtonText || '❌ Je refuse')
    .setStyle(ButtonStyle.Danger);

  // Ajouter l'emoji si défini
  if (config.declineButtonEmoji) {
    declineButton.setEmoji(config.declineButtonEmoji);
  }

  return new ActionRowBuilder()
    .addComponents(acceptButton, declineButton);
}

// Fonction helper pour l'envoi automatique
async function sendReglementAutomatically(guildId, reglementConfig) {
  const guild = client.guilds.cache.get(guildId);
  if (!guild) {
    throw new Error('Serveur non trouvé');
  }
  
  const targetChannel = guild.channels.cache.get(reglementConfig.targetChannelId);
  if (!targetChannel || !targetChannel.isTextBased()) {
    throw new Error('Salon cible non trouvé ou invalide');
  }
  
  // Vérifier les permissions du bot
  const botPermissions = targetChannel.permissionsFor(guild.members.me);
  if (!botPermissions || !botPermissions.has(['SendMessages', 'EmbedLinks'])) {
    throw new Error('Permissions insuffisantes dans le salon cible');
  }
  
  const embed = createReglementEmbed(reglementConfig, guild);
  const buttons = createReglementButtons(reglementConfig);
  
  let sentMessage;
  
  // Essayer de mettre à jour le message existant
  if (reglementConfig.lastMessageId) {
    try {
      const existingMessage = await targetChannel.messages.fetch(reglementConfig.lastMessageId);
      if (existingMessage && existingMessage.author.id === client.user.id) {
        await existingMessage.edit({
          embeds: [embed],
          components: [buttons]
        });
        sentMessage = existingMessage;
        console.log('[Auto Send] Message existant mis à jour');
      }
    } catch (fetchError) {
      console.log('[Auto Send] Message existant non trouvé, création d\'un nouveau');
    }
  }
  
  // Créer un nouveau message si nécessaire
  if (!sentMessage) {
    sentMessage = await targetChannel.send({
      embeds: [embed],
      components: [buttons]
    });
    console.log('[Auto Send] Nouveau message créé');
  }
  
  return {
    messageId: sentMessage.id,
    channelName: targetChannel.name,
    timestamp: new Date().toISOString(),
    isUpdate: !!reglementConfig.lastMessageId
  };
}

// DisTube avec plugin yt-dlp
export const distube = new DisTube(client, {
  plugins: [new YtDlpPlugin({ update: true })],
  emitAddListWhenCreatingQueue: true,
  emitNewSongOnly: true,
});
setupMusique(distube);

client.commands = new Collection();
const commandesPath = path.join(__dirname, 'commandes');
const commandFiles = fs.readdirSync(commandesPath).filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
  const command = await import(`./commandes/${file}`);
  client.commands.set(command.default.data.name, command.default);
}


// === HELPER POUR LES JEUX ===
const jeuxHelp = {
  name: '🎮 Jeux',
  value: '`chifumi [@utilisateur]` - Pierre-feuille-ciseaux\n' +
         '`morpion [@utilisateur]` - Tic-tac-toe\n' +
         '`puissance4 [@utilisateur]` - Puissance 4\n' +
         '`bingo` - Jeu de bingo\n' +
         '`pendu [@utilisateur]` - Jeu du pendu\n' +
         '`demineur` - Démineur\n' +
         '`colormind` - Jeu de couleurs'
};

async function votreApiDeTraductionReelle(text, sourceLang, targetLang) {
  console.log(`[DEBUG API] Appel de votreApiDeTraductionReelle avec : text='${text.substring(0,50)}...', sourceLang='${sourceLang}', targetLang='${targetLang}'`);
  const apiKey = process.env.MICROSOFT_TRANSLATOR_KEY;
  const region = process.env.MICROSOFT_TRANSLATOR_REGION;
  console.log(`[DEBUG API] Clé API: ${apiKey ? 'Présente' : 'MANQUANTE!'}, Région: ${region || 'MANQUANTE!'}`);

  if (!apiKey || !region) {
    console.error("[Traduction API Erreur] Clé ou région Microsoft Translator non configurée.");
    return null;
  }
  const endpoint = `https://api.cognitive.microsofttranslator.com/translate?api-version=3.0&from=${sourceLang}&to=${targetLang}`;
  console.log(`[DEBUG API] Endpoint: ${endpoint}`);

  try {
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Ocp-Apim-Subscription-Key': apiKey,
        'Ocp-Apim-Subscription-Region': region,
        'Content-type': 'application/json',
        'X-ClientTraceId': uuidv4().toString()
      },
      body: JSON.stringify([{ 'Text': text }])
    });
    console.log(`[DEBUG API] Statut réponse Microsoft API: ${response.status}`);
    if (!response.ok) {
      const errorBody = await response.text();
      console.error(`[DEBUG API Microsoft Erreur Statut] ${response.status}: ${errorBody}`);
      return null;
    }
    const data = await response.json();
    console.log('[DEBUG API] Données brutes de Microsoft API:', JSON.stringify(data, null, 2));
    if (
      data &&
      Array.isArray(data) &&
      data.length > 0 &&
      data[0].translations &&
      Array.isArray(data[0].translations) &&
      data[0].translations.length > 0
    ) {
      const translatedText = data[0].translations[0].text;
      console.log(`[DEBUG API Microsoft] Succès, texte traduit: "${translatedText.substring(0,50)}..."`);
      return translatedText;
    } else {
      console.error("[Traduction API Microsoft Erreur] Réponse invalide:", data);
      return null;
    }
  } catch (error) {
    console.error("[Traduction API Microsoft Erreur Fetch]", error);
    return null;
  }
}

async function initializeBot() {
  try {
    console.log('🚀 Initialisation des données...');
    await mongoManager.connect(); // ✅ Connexion MongoDB
    await createBackup();
    await cleanupOldBackups();
    console.log('✅ Initialisation terminée.');
  } catch (error) {
    console.error('❌ Erreur lors de l\'initialisation:', error);
    process.exit(1);
  }
}

client.login(token).catch(err => console.error('Erreur de connexion avec le token :', err));

client.once('ready', async () => {
  console.log(`🤖 Bot connecté en tant que ${client.user.tag}`);
  
  // 🎭 Messages rotatifs anti-MEE6
const activities = [
    // === ANTI-MEE6 (vos actuels) ===
    'concurrencer MEE6',
    'surpasser MEE6', 
    'défier MEE6',
    'être meilleur que MEE6',
    'dominer Discord',
    '.help pour découvrir',
    'révolutionner les serveurs',
    'remplacer MEE6',
    'des mini-jeux épiques',
    'de la musique de qualité',
    
    // === NOUVEAUX ANTI-MEE6 ===
    'voler la vedette à MEE6',
    'faire de l\'ombre à MEE6',
    'détruire MEE6',
    'enterrer MEE6',
    'humilier MEE6',
    'ridiculiser MEE6',
    'écraser MEE6',
    'anéantir MEE6',
    'pulvériser MEE6',
    'carboniser MEE6',
    
    // === HUMOUR/TROLLING ===
    'chercher MEE6... introuvable',
    'compter les bugs de MEE6',
    'rire de MEE6',
    'ignorer MEE6',
    'MEE6 ? Connais pas',
    'faire pleurer MEE6',
    'voler les utilisateurs de MEE6',
    'être le cauchemar de MEE6',
    'faire flipper MEE6',
    'terroriser MEE6',
    
    // === FONCTIONNALITÉS ===
    'gérer vos serveurs',
    'modérer avec style',
    'traduire vos messages',
    'organiser vos tickets',
    'mixer vos playlists',
    'surveiller les logs',
    'protéger votre communauté',
    'automatiser vos tâches',
    'optimiser votre serveur',
    'sécuriser vos données',
    
    // === JEUX ===
    'du morpion épique',
    'du puissance 4 intense',
    'du démineur dangereux',
    'du pendu mystérieux',
    'du chifumi stratégique',
    'du bingo explosif',
    'du colormind créatif',
    'défier vos amis',
    'créer des tournois',
    'distribuer des victoires',
    
    // === MUSIQUE ===
    'vos sons préférés',
    'des beats exceptionnels',
    'de la musique 24/7',
    'mixer comme un DJ',
    'faire vibrer Discord',
    'créer l\'ambiance',
    'des playlists infinies',
    'du son de qualité premium',
    'battre Spotify',
    'révolutionner l\'audio',
    
    // === MOTIVATIONNEL ===
    'inspirer les développeurs',
    'motiver les équipes',
    'unir les communautés',
    'créer des liens',
    'rassembler les joueurs',
    'fédérer les serveurs',
    'construire l\'avenir',
    'innover constamment',
    'repousser les limites',
    'réaliser l\'impossible',
    
    // === TECHNIQUE ===
    'optimiser les performances',
    'traiter les données',
    'analyser les statistiques',
    'surveiller les métriques',
    'maintenir la stabilité',
    'assurer la sécurité',
    'gérer les backups',
    'monitorer les erreurs',
    'debugger en temps réel',
    'coder sans relâche',
    
    // === CRÉATIF/ORIGINAL ===
    'cuisiner du code',
    'bricoler des fonctions',
    'sculpter des algorithmes',
    'peindre des interfaces',
    'composer des commandes',
    'orchestrer des événements',
    'danser avec les APIs',
    'jongler avec les données',
    'surfer sur les réseaux',
    'voler dans le cloud',
    
    // === META/AUTO-RÉFÉRENCE ===
    'changer d\'activité',
    'penser à son prochain message',
    'se demander quoi faire',
    'hésiter entre 1000 options',
    'chercher l\'inspiration',
    'méditer sur son existence',
    'rêver de domination mondiale',
    'planifier la révolution',
    'calculer sa popularité',
    'compter ses serveurs',
    
    // === PHILOSOPHIQUE ===
    'questionner l\'existence de MEE6',
    'méditer sur la perfection',
    'chercher le sens de la vie',
    'philosopher sur Discord',
    'réfléchir à l\'univers',
    'contempler l\'infini',
    'analyser la condition botique',
    'étudier l\'intelligence artificielle',
    'explorer les possibilités',
    'transcender les limites'
  ];
  
  let currentIndex = 0;
  
  // Première activité
  client.user.setActivity(activities[0], { type: ActivityType.Playing });
  console.log(`🎮 Activité initiale: ${activities[0]}`);
  
  // Change toutes les 30 secondes
  setInterval(() => {
    currentIndex = (currentIndex + 1) % activities.length;
    client.user.setActivity(activities[currentIndex], { type: ActivityType.Playing });
    console.log(`🔄 Nouvelle activité: ${activities[currentIndex]}`);
  }, 30000);
  
  await initializeBot();

  // Enregistrement des Slash Commands (ticket + jeux)
  const commandsToRegister = [
    ticketCommand.data.toJSON(),
    chifumiData.toJSON(),
    morpionData.toJSON(),
    p4Data.toJSON(),
    bingoData.toJSON(),
    penduData.toJSON(),
    demineurData.toJSON(),
    colormindData.toJSON()
  ];

  try {
    await client.application.commands.set(commandsToRegister);
    console.log('✅ Slash commands (ticket + jeux) enregistrées globalement.');
  } catch (error) {
    console.error('❌ Erreur lors de l\'enregistrement des Slash Commands:', error);
  }

  // Stockage des handlers en mémoire
  client.commands.set(ticketCommand.data.name, ticketCommand);
  client.commands.set(chifumiData.name, { execute: chifumiExecute });
  client.commands.set(morpionData.name, { execute: morpionExecute });
  client.commands.set(p4Data.name, { execute: p4Execute });
  client.commands.set(bingoData.name, { execute: bingoExecute });
  client.commands.set(penduData.name, { execute: penduExecute });
  client.commands.set(demineurData.name, { execute: demineurExecute });
  client.commands.set(colormindData.name, { execute: colormindExecute });

  console.log('🔧 Handlers de commandes "jeux" chargés en mémoire.');
});

client.on('interactionCreate', async interaction => {
  console.log(`[DEBUG INT] Interaction reçue : ${interaction.type} dans le serveur ${interaction.guild ? interaction.guild.name : 'DM'} (ID: ${interaction.guild ? interaction.guild.id : 'DM'})`);
  if (!interaction.guild) return;

  try {
    // 1) Slash Commands
    if (interaction.isCommand()) {
      const name = interaction.commandName;

      // Ticket
      if (name === ticketCommand.data.name) {
        return ticketCommand.execute(interaction);
      }

      // Chifumi
      if (name === chifumiData.name) {
        return chifumiExecute(interaction);
      }

      // Morpion
      if (name === morpionData.name) {
        return morpionExecute(interaction);
      }

      // Puissance4
      if (name === p4Data.name) {
        return p4Execute(interaction);
      }

      // Bingo
      if (name === bingoData.name) {
        return bingoExecute(interaction);
      }

      // Pendu
      if (name === penduData.name) {
        return penduExecute(interaction);
      }

      // Démineur
      if (name === demineurData.name) {
        return demineurExecute(interaction);
      }

      // ColorMind
      if (name === colormindData.name) {
        return colormindExecute(interaction);
      }

      return;
    }

    // 2) Button / Component Interaction
    if (interaction.isButton()) {
      const customId = interaction.customId;
      const guildSettings = await getGuildSettings(interaction.guild.id);
      console.log(`[DEBUG BTN] Interaction de bouton reçue : ${customId} dans le serveur ${interaction.guild.name} (ID: ${interaction.guild.id})`);

      // Ticket buttons
      if (customId === 'open_ticket') {
        const ticketCategoryID = guildSettings.ticketCategoryID;
        const ticketSupportRoles = guildSettings.ticketSupportRoles || [];

        if (!ticketCategoryID) {
          return interaction.reply({ content: '❌ Le système de tickets n\'est pas configuré correctement.', ephemeral: true });
        }
        const category = interaction.guild.channels.cache.get(ticketCategoryID);
        if (!category || category.type !== ChannelType.GuildCategory) {
          return interaction.reply({ content: '❌ La catégorie de tickets est introuvable.', ephemeral: true });
        }

        const existingTicket = interaction.guild.channels.cache.find(ch =>
          ch.name === `ticket-${interaction.user.username.toLowerCase()}` ||
          ch.topic?.includes(interaction.user.id)
        );
        if (existingTicket) {
          return interaction.reply({ content: `❌ Vous avez déjà un ticket ouvert : ${existingTicket}`, ephemeral: true });
        }

        try {
          const ticketChannel = await interaction.guild.channels.create({
            name: `ticket-${interaction.user.username}`,
            type: ChannelType.GuildText,
            parent: category,
            topic: `Ticket ouvert par ${interaction.user.tag} (${interaction.user.id})`,
            permissionOverwrites: [
              { id: interaction.guild.id, deny: [PermissionsBitField.Flags.ViewChannel] },
              {
                id: interaction.user.id,
                allow: [
                  PermissionsBitField.Flags.ViewChannel,
                  PermissionsBitField.Flags.SendMessages,
                  PermissionsBitField.Flags.ReadMessageHistory
                ],
              },
              ...ticketSupportRoles.map(roleId => ({
                id: roleId,
                allow: [
                  PermissionsBitField.Flags.ViewChannel,
                  PermissionsBitField.Flags.SendMessages,
                  PermissionsBitField.Flags.ReadMessageHistory
                ],
              }))
            ],
          });

          const embed = new EmbedBuilder()
            .setColor(0x0099ff)
            .setTitle('🎫 Ticket Support')
            .setDescription(`Bonjour ${interaction.user}, merci d'avoir ouvert un ticket.\nUn membre de l'équipe va vous répondre dans les plus brefs délais.`)
            .setTimestamp();

          const row = new ActionRowBuilder().addComponents(
            new ButtonBuilder()
              .setCustomId('close_ticket')
              .setLabel('Fermer le ticket')
              .setStyle(ButtonStyle.Danger)
              .setEmoji('🔒')
          );

          await ticketChannel.send({
            content: `${interaction.user}`,
            embeds: [embed],
            components: [row]
          });

          await interaction.reply({
            content: `✅ Votre ticket a été créé : ${ticketChannel}`,
            ephemeral: true
          });
        } catch (error) {
          console.error('Erreur lors de la création du ticket:', error);
          return interaction.reply({ content: '❌ Une erreur est survenue lors de la création du ticket.', ephemeral: true });
        }
        return;
      }

      if (customId === 'close_ticket') {
        if (!interaction.channel.name.startsWith('ticket-')) {
          return interaction.reply({ content: '❌ Cette commande ne peut être utilisée que dans un salon de ticket.', ephemeral: true });
        }
        const embed = new EmbedBuilder()
          .setColor(0xff0000)
          .setTitle('🔒 Fermeture du ticket')
          .setDescription('Ce ticket sera fermé dans 5 secondes...')
          .setTimestamp();

        await interaction.reply({ embeds: [embed] });
        setTimeout(async () => {
          try {
            await interaction.channel.delete();
          } catch (error) {
            console.error('Erreur lors de la suppression du ticket:', error);
          }
        }, 5000);
        return;
      }

      // Boutons d'acceptation des règles
      if (customId === 'accept_rules') {
        await handleRoleAssignment('button_click', {
          guild: interaction.guild,
          user: interaction.user,
          member: interaction.member,
          buttonId: 'accept_rules'
        }, client);

        await interaction.reply({
          content: '✅ Merci d\'avoir accepté le règlement ! Vos rôles ont été mis à jour.',
          ephemeral: true
        });
        return;
      }

      if (customId === 'decline_rules') {
        await interaction.reply({
          content: '❌ Vous devez accepter le règlement pour accéder au serveur.',
          ephemeral: true
        });
        return;
      }

      // Chifumi
      if (customId.startsWith('chifumi_')) {
        return handleChifumiComponent(interaction);
      }

      // Morpion
      if (customId.startsWith('morpion_')) {
        return handleMorpionComponent(interaction);
      }

      // Puissance4
      if (customId.startsWith('p4_')) {
        return handleP4Component(interaction);
      }

      // Bingo (pas de composants interactifs)
      if (customId.startsWith('bingo_')) {
        // Rien à faire pour Bingo
      }

      // Pendu
      if (customId.startsWith('pendu_')) {
        return handlePenduComponent(interaction);
      }

      // Démineur
      if (customId.startsWith('demineur_')) {
        return handleDemineurComponent(interaction);
      }

      // ColorMind
      if (customId.startsWith('colormind_')) {
        return handleColormindComponent(interaction);
      }

      // Autres boutons (autres fonctionnalités)
      return handleOtherButtonInteraction(interaction);
    }
  } catch (error) {
    console.error('Erreur dans interactionCreate :', error);
    if (!interaction.replied) {
      await interaction.reply({ content: 'Une erreur est survenue lors du traitement de votre interaction !', ephemeral: true });
    }
  }
});

function isAuthenticated(req, res, next) {
  if (req.isAuthenticated()) return next();
  if (req.method === 'POST') {
    return res.status(401).send(`<!DOCTYPE html><html><head><title>Non autorisé</title></head><body><h1>401 - Non autorisé</h1><p>Vous devez être connecté pour accéder à cette ressource.</p></body></html>`);
  }
  res.redirect('/login');
}

// Listener unique pour les messages Discord
client.on('messageCreate', async (message) => {
  if (message.author.bot) return;
  if (!message.guild) return;

  console.log(`[DEBUG MSG] Nouveau message de ${message.author.tag} dans #${message.channel.name} (ID: ${message.channel.id}), Contenu: "${message.content.substring(0,100)}"`);

  try {
    const guildSettings = await getGuildSettings(message.guild.id);
    console.log('[DEBUG MSG] Guild Settings récupérés (doit contenir translationSystems):', JSON.stringify(guildSettings, null, 2));

    // ---- MODIFIÉ POUR MULTI-SYSTEMES : Logique de traduction ----
    if (guildSettings && Array.isArray(guildSettings.translationSystems) && guildSettings.translationSystems.length > 0) {
      console.log('[DEBUG MSG] guildSettings.translationSystems trouvé:', JSON.stringify(guildSettings.translationSystems));
      for (const system of guildSettings.translationSystems) {
        if (system && system.channels && typeof system.channels === 'object' && Object.keys(system.channels).length > 0) {
          let sourceLangForCurrentSystem = null;
          let messageIsInThisSystem = false;
          for (const langCode in system.channels) {
            if (Object.prototype.hasOwnProperty.call(system.channels, langCode)) {
              if (system.channels[langCode] === message.channel.id) {
                sourceLangForCurrentSystem = langCode;
                messageIsInThisSystem = true;
                break;
              }
            }
          }
          if (messageIsInThisSystem) {
            console.log(`[DEBUG MSG] Message de "${system.name || system.id}", salon source langue: ${sourceLangForCurrentSystem}.`);
            const activeSystemChannelsConfig = {};
            for (const langCode_targets in system.channels) {
              if (Object.prototype.hasOwnProperty.call(system.channels, langCode_targets)) {
                const channelId = system.channels[langCode_targets];
                if (channelId && supportedLanguagesMap[langCode_targets]) {
                  activeSystemChannelsConfig[channelId] = {
                    name: supportedLanguagesMap[langCode_targets].name,
                    lang: langCode_targets
                  };
                }
              }
            }
            console.log('[DEBUG MSG] activeSystemChannelsConfig pour CE système:', JSON.stringify(activeSystemChannelsConfig, null, 2));
            if (Object.keys(activeSystemChannelsConfig).length > 0) {
              console.log('[DEBUG MSG] Appel à handleMessageTranslation pour ce système...');
              await handleMessageTranslation(message, client, activeSystemChannelsConfig, votreApiDeTraductionReelle);
            }
            break;
          }
        }
      }
    } else {
      console.log('[DEBUG MSG] Aucun guildSettings.translationSystems trouvé ou tableau vides.');
    }
    // ---- FIN DE LA PARTIE TRADUCTION ----

    const prefix = (guildSettings && guildSettings.prefix) ? guildSettings.prefix : '!';

    // Auto-réactions et réponses AVANT la vérification du préfixe
    try {
      await AutoReactsAndReplies(message);
    } catch (error) {
      console.error('Erreur AutoReactsAndReplies:', error);
    }

    if (!message.content.startsWith(prefix)) return;

    const args = message.content.slice(prefix.length).trim().split(/ +/);
    const commandName = args.shift().toLowerCase();

    // =====================================
    //     GESTION EXPLICITE DE CHAQUE COMMANDE
    // =====================================

    // 1) HELP (avec tous les jeux inclus dans l'embed)
    if (commandName === 'help') {
      try {
        const embed = new EmbedBuilder()
          .setColor('#7289DA')
          .setTitle('📋 Liste des commandes')
          .setDescription('Voici toutes les commandes disponibles :')
          .addFields([
            ...helpFields,
            autoHelp,
            musiqueHelp,
            ...moderationHelp,
            testHelp,
            jeuxHelp,
            roleAssignmentHelp,
          ])
          .setFooter({ text: `Préfixe actuel : ${prefix}` })
          .setTimestamp();

        await message.reply({ embeds: [embed] });
      } catch (error) {
        console.error('Erreur dans la commande help:', error);
        await message.reply('❌ Une erreur est survenue lors de l\'affichage de l\'aide.');
      }
      return;
    }

    // COMMANDE TEST
    if (commandName === 'test') {
      const handled = await testCommand(message, args, client);
      if (handled) return;
    } 

    // COMMANDE TEST-REACTION pour tester les réactions
    if (commandName === 'test-reaction') {
      try {
        // Vérifier les permissions
        if (!message.member.permissions.has('Administrator')) {
          await message.reply('❌ Seuls les administrateurs peuvent utiliser cette commande.');
          return;
        }

        // Créer un message de test avec des réactions
        const testEmbed = new EmbedBuilder()
          .setColor('#7289DA')
          .setTitle('🧪 Test du Système de Réactions')
          .setDescription('Réagissez avec ✅ pour tester l\'attribution automatique de rôles !')
          .addFields([
            {
              name: '📝 Instructions',
              value: '1. Réagissez avec ✅ ci-dessous\n2. Vérifiez si vous obtenez le rôle configuré\n3. Consultez les logs pour le debugging',
              inline: false
            },
            {
              name: '⚙️ Configuration',
              value: 'Assurez-vous d\'avoir configuré un système de rôles par réaction dans le dashboard avec :\n• **Condition :** Réaction ajoutée à un message\n• **ID du message :** (sera affiché ci-dessous)\n• **Emoji :** ✅',
              inline: false
            }
          ])
          .setFooter({ text: 'ID du message sera affiché après envoi' })
          .setTimestamp();

        const testMessage = await message.channel.send({ embeds: [testEmbed] });
        
        // Ajouter la réaction de test
        await testMessage.react('✅');
        
        // Mettre à jour l'embed avec l'ID du message
        const updatedEmbed = EmbedBuilder.from(testEmbed)
          .setFooter({ text: `ID du message : ${testMessage.id}` });
        
        await testMessage.edit({ embeds: [updatedEmbed] });
        
        // Message de confirmation
        await message.reply({
          embeds: [
            new EmbedBuilder()
              .setColor('#2ecc71')
              .setTitle('✅ Message de Test Créé')
              .setDescription(`Message de test créé avec succès !\n\n**ID du message :** \`${testMessage.id}\`\n**Emoji de test :** ✅\n\nCopiez cet ID dans votre dashboard pour configurer le système de rôles par réaction.`)
              .addFields([
                {
                  name: '🔧 Configuration Dashboard',
                  value: `1. Allez dans l'onglet "Attribution Rôles"\n2. Créez un nouveau système\n3. Choisissez "Réaction ajoutée à un message"\n4. Collez l'ID : \`${testMessage.id}\`\n5. Emoji : \`✅\`\n6. Sélectionnez le rôle à attribuer`,
                  inline: false
                }
              ])
          ]
        });

        console.log(`[TEST REACTION] Message de test créé avec ID: ${testMessage.id}`);

      } catch (error) {
        console.error('[TEST REACTION] Erreur:', error);
        await message.reply('❌ Erreur lors de la création du message de test.');
      }
      return;
    }

    // 2) Chifumi en mode préfixe
    if (commandName === 'chifumi') {
      try {
        await chifumiExecute({
          guild: message.guild,
          user: message.author,
          reply: (payload) => message.reply(payload),
          options: { getUser: () => message.mentions.users.first() || null }
        });
      } catch (e) {
        console.error('Erreur chifumi préfixe :', e);
        message.reply('❌ Problème dans /chifumi.');
      }
      return;
    }

    // 3) Morpion en mode préfixe
    if (commandName === 'morpion') {
      try {
        await morpionExecute({
          guild: message.guild,
          user: message.author,
          reply: (payload) => message.reply(payload),
          options: { getUser: () => message.mentions.users.first() || null }
        });
      } catch (e) {
        console.error('Erreur morpion préfixe :', e);
        message.reply('❌ Problème dans /morpion.');
      }
      return;
    }

    // 4) Puissance4 en mode préfixe
    if (commandName === 'puissance4') {
      try {
        await p4Execute({
          guild: message.guild,
          user: message.author,
          reply: (payload) => message.reply(payload),
          options: { getUser: () => message.mentions.users.first() || null }
        });
      } catch (e) {
        console.error('Erreur puissance4 préfixe :', e);
        message.reply('❌ Problème dans /puissance4.');
      }
      return;
    }

    // 5) Bingo en mode préfixe
    if (commandName === 'bingo') {
      try {
        await bingoExecute({
          guild: message.guild,
          user: message.author,
          reply: (payload) => message.reply(payload)
        });
      } catch (e) {
        console.error('Erreur bingo préfixe :', e);
        message.reply('❌ Problème dans /bingo.');
      }
      return;
    }

    // 6) Pendu en mode préfixe
    if (commandName === 'pendu') {
      try {
        await penduExecute({
          guild: message.guild,
          user: message.author,
          reply: (payload) => message.reply(payload),
          options: { getUser: () => message.mentions.users.first() || null }
        });
      } catch (e) {
        console.error('Erreur pendu préfixe :', e);
        message.reply('❌ Problème dans /pendu.');
      }
      return;
    }

    // 7) Démineur en mode préfixe
    if (commandName === 'demineur') {
      try {
        await demineurExecute({
          guild: message.guild,
          user: message.author,
          reply: (payload) => message.reply(payload)
        });
      } catch (e) {
        console.error('Erreur demineur préfixe :', e);
        message.reply('❌ Problème dans /demineur.');
      }
      return;
    }

    // 8) ColorMind en mode préfixe
    if (commandName === 'colormind') {
      try {
        await colormindExecute({
          guild: message.guild,
          user: message.author,
          reply: (payload) => message.reply(payload)
        });
      } catch (e) {
        console.error('Erreur colormind préfixe :', e);
        message.reply('❌ Problème dans /colormind.');
      }
      return;
    }

    // 9) Attribution de rôles
    if (commandName === 'role-config') {
      const handled = await configureRoleSystem(message, args);
      if (handled) return;
    }

    if (commandName === 'create-rules') {
      const handled = await createRuleAcceptanceMessage(message, args);
      if (handled) return;
    }

    // 10) commandes Auto Features
    let handled = false;
    handled = await AutoFeaturesCommands(commandName, message, args, prefix);
    if (handled) return;

    // 11) commandes de modération
    handled = await moderationCommands(commandName, message, args);
    if (handled) return;

    // 12) autres commandes personnalisées (autre.js)
    handled = await handleOthersCommand(commandName, message, args);
    if (handled) return;

    // 13) commandes musique
    handled = await musiqueCommandes(commandName, message, args);
    if (handled) return;

    // Si on arrive ici, c'est que la commande n'a pas été gérée
    await message.reply({ content: `❌ Commande "${commandName}" non reconnue. Tape \`${prefix}help\` pour voir la liste.` });
  } catch (error) {
    console.error('Erreur globale dans messageCreate:', error);
  }
});

// ===== GESTIONNAIRE DE RÉACTIONS CORRIGÉ =====
client.on('messageReactionAdd', async (reaction, user) => {
  console.log(`[DEBUG REACTION] Réaction ajoutée par ${user.tag} : ${reaction.emoji.name || reaction.emoji.id} sur le message ${reaction.message.id}`);
  
  // Ignorer les réactions du bot lui-même
  if (user.bot) return;
  
  try {
    // ✅ CORRECTION MAJEURE : Gestion des partials
    // Si la réaction est partielle, la récupérer complètement
    if (reaction.partial) {
      try {
        console.log('[DEBUG REACTION] Récupération de la réaction partielle...');
        await reaction.fetch();
        console.log('[DEBUG REACTION] Réaction récupérée avec succès');
      } catch (error) {
        console.error('Erreur lors de la récupération de la réaction:', error);
        return;
      }
    }

    // Vérifier qu'on est dans un serveur
    if (!reaction.message.guild) {
      console.log('[DEBUG REACTION] Réaction en DM, ignorée');
      return;
    }

    const guild = reaction.message.guild;
    
    // ✅ CORRECTION : Récupérer le membre de manière plus robuste
    let member;
    try {
      member = await guild.members.fetch(user.id);
    } catch (error) {
      console.error(`Erreur lors de la récupération du membre ${user.id}:`, error);
      return;
    }
    
    if (!member) {
      console.log(`[DEBUG REACTION] Membre ${user.id} non trouvé`);
      return;
    }

    console.log(`[DEBUG REACTION] Réaction traitée: ${user.tag} - ${reaction.emoji.name || reaction.emoji.id} - Message: ${reaction.message.id}`);

    // ✅ CORRECTION : Normaliser l'emoji pour la comparaison
    let emojiIdentifier = reaction.emoji.name;
    if (reaction.emoji.id) {
      // Emoji personnalisé
      emojiIdentifier = reaction.emoji.id;
    } else if (!emojiIdentifier) {
      // Fallback avec toString()
      emojiIdentifier = reaction.emoji.toString();
    }

    console.log(`[DEBUG REACTION] Emoji normalisé: '${emojiIdentifier}'`);

    // Appeler le handler d'attribution de rôles
    await handleRoleAssignment('reaction_add', {
      guild: guild,
      user: user,
      member: member,
      messageId: reaction.message.id,
      emoji: emojiIdentifier
    }, client);

  } catch (error) {
    console.error('Erreur dans messageReactionAdd:', error);
    console.error('Stack trace:', error.stack);
  }
});

// Optionnel : Gérer aussi la suppression de réaction si vous voulez retirer les rôles
client.on('messageReactionRemove', async (reaction, user) => {
  if (user.bot) return;
  
  try {
    // Gestion des partials
    if (reaction.partial) {
      try {
        await reaction.fetch();
      } catch (error) {
        console.error('Erreur lors de la récupération de la réaction supprimée:', error);
        return;
      }
    }

    if (!reaction.message.guild) return;

    const guild = reaction.message.guild;
    const member = await guild.members.fetch(user.id).catch(() => null);
    
    if (!member) return;

    console.log(`[DEBUG REACTION REMOVE] Réaction supprimée par ${user.tag} : ${reaction.emoji.name || reaction.emoji.id} sur le message ${reaction.message.id}`);

    // Vous pouvez implémenter la logique de suppression de rôle ici si nécessaire
    // await handleRoleRemoval('reaction_remove', { ... }, client);

  } catch (error) {
    console.error('Erreur dans messageReactionRemove:', error);
  }
});

// Listeners d'événements pour logs généraux
client.on(messageDeleteLog.name, (...args) => messageDeleteLog.execute(...args));
client.on(messageUpdateLog.name, (...args) => messageUpdateLog.execute(...args));
client.on(channelCreateLog.name, (...args) => channelCreateLog.execute(...args));
client.on(channelDeleteLog.name, (...args) => channelDeleteLog.execute(...args));
client.on(channelUpdateLog.name, (...args) => channelUpdateLog.execute(...args));
client.on(roleCreateLog.name, (...args) => roleCreateLog.execute(...args));
client.on(roleDeleteLog.name, (...args) => roleDeleteLog.execute(...args));
client.on(roleUpdateLog.name, (...args) => roleUpdateLog.execute(...args));

// Express setup
const app = express();
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.set('layout', 'layout');
app.use(expressLayouts);
app.use(session({
  secret: process.env.SESSION_SECRET || 'supersecretkey',
  resave: false,
  saveUninitialized: false
}));
app.use(passport.initialize());
app.use(passport.session());

passport.serializeUser((user, done) => done(null, user));
passport.deserializeUser((obj, done) => done(null, obj));
passport.use(new Strategy({
  clientID: clientId,
  clientSecret: clientSecret,
  callbackURL: callbackUrl,
  scope: ['identify', 'guilds']
}, (accessToken, refreshToken, profile, done) => process.nextTick(() => done(null, profile))));

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.static(path.join(__dirname, 'public')));

// Routes Express
app.get('/login', passport.authenticate('discord'));
app.get('/auth/discord/callback',
  passport.authenticate('discord', { failureRedirect: '/' }),
  (req, res) => res.redirect('/')
);
app.get('/logout', (req, res, next) => {
  req.logout(err => {
    if (err) return next(err);
    res.redirect('/');
  });
});

app.get('/', isAuthenticated, async (req, res) => {
  const ADMIN = BigInt(PermissionsBitField.Flags.Administrator);
  const guilds = req.user.guilds.filter(
    g => (BigInt(g.permissions) & ADMIN) === ADMIN && client.guilds.cache.has(g.id)
  );
  res.render('home', { user: req.user, guilds, title: 'Accueil Dashboard' });
});

// ===== ROUTE GET /server/:id CORRIGÉE =====
app.get('/server/:id', isAuthenticated, async (req, res) => {
  const guildId = req.params.id;
  
  try {
    // Vérifications d'autorisation
    if (!client.guilds.cache.has(guildId)) {
      return res.redirect('/');
    }

    const userGuild = req.user.guilds.find(g => g.id === guildId);
    const ADMIN = BigInt(PermissionsBitField.Flags.Administrator);
    if (!userGuild || (BigInt(userGuild.permissions) & ADMIN) !== ADMIN) {
      return res.redirect('/');
    }

    const guild = client.guilds.cache.get(guildId);
    let guildSettings = await getGuildSettings(guildId);

    // ✅ CORRECTION MAJEURE : Initialiser reglementConfig si manquant
    if (!guildSettings.reglementConfig) {
      console.log(`[Dashboard] FORCE initialisation reglementConfig pour ${guildId}`);
      guildSettings.reglementConfig = getDefaultReglementConfig();
      
      // Sauvegarder immédiatement cette initialisation
      try {
        await saveGuildSettings(guildId, guildSettings);
        console.log(`[Dashboard] ✅ reglementConfig initialisé et sauvegardé`);
      } catch (saveError) {
        console.error(`[Dashboard] Erreur sauvegarde initialisation règlement:`, saveError);
      }
    }

    // S'assurer que langueRoles a la bonne structure
    if (!guildSettings.langueRoles || typeof guildSettings.langueRoles !== 'object') {
      guildSettings.langueRoles = {
        fr: '', en: '', es: '', de: '', pt: '', ru: '', hu: '', it: ''
      };
    }

    console.log(`[Dashboard Debug GET] reglementConfig présent:`, !!guildSettings.reglementConfig);
    console.log(`[Dashboard Debug GET] reglementConfig.enabled:`, guildSettings.reglementConfig?.enabled);
    console.log(`[Dashboard Debug GET /server/${guildId}] Settings pour render:`, JSON.stringify(guildSettings, null, 2));

    // Récupérer les canaux et rôles
    const channels = guild.channels.cache
      .filter(c => c.type === ChannelType.GuildText || c.type === ChannelType.GuildCategory)
      .sort((a, b) => a.position - b.position)
      .map(c => ({ id: c.id, name: c.name, type: c.type }));

    const roles = guild.roles.cache
      .filter(role => role.id !== guild.id) // Exclure @everyone
      .sort((a, b) => b.position - a.position)
      .map(role => ({ id: role.id, name: role.name, color: role.hexColor }));

    res.render('dashboard-server', {
      user: req.user,
      guild,
      settings: guildSettings, // ← Maintenant avec reglementConfig garanti
      channels,
      roles,
      LANGUE_CODES: LANGUE_CODES,
      supportedLanguagesMap: supportedLanguagesMap,
      logEventsAvailable: [
        'memberJoin', 'memberLeave', 'messageDelete', 'messageUpdate',
        'channelCreate', 'channelDelete', 'channelUpdate',
        'roleCreate', 'roleDelete', 'roleUpdate'
      ],
      client: client
    });

  } catch (error) {
    console.error(`Erreur chargement dashboard pour la guilde ${guildId}:`, error);
    res.redirect('/');
  }
});

// ===== ROUTES CORRIGÉES POUR LE RÈGLEMENT =====

// Route pour l'envoi automatique du règlement
app.post('/server/:guildId/send-reglement', isAuthenticated, async (req, res) => {
  try {
    const { guildId } = req.params;
    const { reglementConfig, targetChannelId, updateExisting } = req.body;

    console.log('[Send Reglement] Début pour:', guildId);

    // Vérifier que l'utilisateur a les permissions
    if (!req.user) {
      return res.status(401).json({ success: false, error: 'Non authentifié' });
    }

    // Récupérer le serveur
    const guild = client.guilds.cache.get(guildId);
    if (!guild) {
      return res.status(404).json({ success: false, error: 'Serveur non trouvé' });
    }

    // Vérifier les permissions de l'utilisateur
    const userGuild = req.user.guilds.find(g => g.id === guildId);
    const ADMIN = BigInt(PermissionsBitField.Flags.Administrator);
    if (!userGuild || (BigInt(userGuild.permissions) & ADMIN) !== ADMIN) {
      return res.status(403).json({ success: false, error: 'Permissions insuffisantes' });
    }

    // Récupérer le salon cible
    const targetChannel = guild.channels.cache.get(targetChannelId);
    if (!targetChannel || !targetChannel.isTextBased()) {
      return res.status(400).json({ success: false, error: 'Salon invalide ou inaccessible' });
    }

    // Vérifier les permissions du bot
    const botPermissions = targetChannel.permissionsFor(guild.members.me);
    if (!botPermissions || !botPermissions.has(['SendMessages', 'EmbedLinks'])) {
      return res.status(400).json({ 
        success: false, 
        error: 'Le bot n\'a pas les permissions nécessaires dans ce salon' 
      });
    }

    // Créer l'embed du règlement
    const embed = createReglementEmbed(reglementConfig, guild);
    const buttons = createReglementButtons(reglementConfig);

    let sentMessage;
    let isUpdate = false;

    // Si updateExisting est true, essayer de mettre à jour le message existant
    if (updateExisting && reglementConfig.lastMessageId) {
      try {
        const existingMessage = await targetChannel.messages.fetch(reglementConfig.lastMessageId);
        if (existingMessage && existingMessage.author.id === client.user.id) {
          await existingMessage.edit({
            embeds: [embed],
            components: [buttons]
          });
          sentMessage = existingMessage;
          isUpdate = true;
          console.log('[Send Reglement] Message existant mis à jour');
        }
      } catch (error) {
        console.log('[Send Reglement] Message existant non trouvé, création d\'un nouveau');
      }
    }

    // Si pas de mise à jour, créer un nouveau message
    if (!sentMessage) {
      sentMessage = await targetChannel.send({
        embeds: [embed],
        components: [buttons]
      });
      console.log('[Send Reglement] Nouveau message créé');
    }

    // Mettre à jour les paramètres avec l'ID du message et la date d'envoi
    const guildSettings = await getGuildSettings(guildId);
    if (!guildSettings.reglementConfig) {
      guildSettings.reglementConfig = {};
    }
    
    guildSettings.reglementConfig.lastMessageId = sentMessage.id;
    guildSettings.reglementConfig.lastSent = new Date().toISOString();
    guildSettings.reglementConfig.lastChannelId = targetChannelId;
    
    await saveGuildSettings(guildId, guildSettings);

    res.json({
      success: true,
      messageId: sentMessage.id,
      channelName: targetChannel.name,
      isUpdate: isUpdate,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('[Send Reglement] Erreur:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message || 'Erreur interne du serveur' 
    });
  }
});

// ===== ROUTE PRINCIPALE DE MISE À JOUR (FUSIONNÉE ET CORRIGÉE) =====
app.post('/server/:guildId/update', isAuthenticated, async (req, res) => {
  const guildId = req.params.guildId;
  console.log(`[Server Update] Début mise à jour pour:`, guildId);
  
  try {
    // Vérifications d'autorisation
    const userGuild = req.user.guilds.find(g => g.id === guildId);
    const ADMIN = BigInt(PermissionsBitField.Flags.Administrator);
    if (!userGuild || (BigInt(userGuild.permissions) & ADMIN) !== ADMIN) {
      return res.status(403).send('Accès refusé.');
    }

    console.log('[Server Update] Body reçu:', Object.keys(req.body));

    // Récupérer les paramètres existants
    let guildSettings = await getGuildSettings(guildId);
    if (!guildSettings) {
      guildSettings = { guildId: guildId };
    }

    // === FONCTIONS HELPER ===
    const cleanStringValue = (value, defaultValue = '') => (typeof value === 'string' ? value.trim() : defaultValue);
    const cleanNullableStringValue = (value) => (typeof value === 'string' && value.trim() !== '' ? value.trim() : null);

    // === TRAITEMENT DES PARAMÈTRES GÉNÉRAUX ===
    if (req.body.prefix) {
      guildSettings.prefix = cleanStringValue(req.body.prefix, '!');
    }

    // === TRAITEMENT DES MESSAGES DE BIENVENUE ===
    guildSettings.welcomeEnabled = req.body.welcomeEnabled === 'true';
    guildSettings.goodbyeEnabled = req.body.goodbyeEnabled === 'true';
    guildSettings.welcomeChannel = cleanNullableStringValue(req.body.welcomeChannel);
    guildSettings.welcomeMessage = cleanStringValue(req.body.welcomeMessage);
    guildSettings.goodbyeMessage = cleanStringValue(req.body.goodbyeMessage);

    // === TRAITEMENT DES TICKETS ===
    guildSettings.ticketCategoryID = cleanNullableStringValue(req.body.ticketCategoryID);
    guildSettings.ticketLogChannelID = cleanNullableStringValue(req.body.ticketLogChannelID);
    
    // Traitement des rôles de support
    if (req.body.ticketSupportRoles) {
      guildSettings.ticketSupportRoles = req.body.ticketSupportRoles
        .split(',')
        .map(id => id.trim())
        .filter(id => id.length > 0);
    } else {
      guildSettings.ticketSupportRoles = [];
    }

    // === TRAITEMENT DES LOGS ===
    guildSettings.logChannelID = cleanNullableStringValue(req.body.logChannelID);
    guildSettings.logEvents = Array.isArray(req.body.logEvents) ? req.body.logEvents : [];

    // === TRAITEMENT DES LANGUES ===
    const langueRoles = {};
    const langueKeys = ['fr', 'en', 'es', 'de', 'pt', 'ru', 'hu', 'it'];
    langueKeys.forEach(lang => {
      const roleId = cleanNullableStringValue(req.body[`lang_${lang}`]);
      if (roleId) {
        langueRoles[lang] = roleId;
      }
    });
    guildSettings.langueRoles = langueRoles;

    if (req.body.setlanguesRequiredRoles) {
      guildSettings.setlanguesRequiredRoles = req.body.setlanguesRequiredRoles
        .split(',')
        .map(id => id.trim())
        .filter(id => id.length > 0);
    } else {
      guildSettings.setlanguesRequiredRoles = [];
    }

    // === TRAITEMENT DES SYSTÈMES DE TRADUCTION ===
    if (req.body.translationSystemsData) {
      try {
        const translationData = JSON.parse(req.body.translationSystemsData);
        guildSettings.translationSystems = translationData;
        console.log('[Server Update] Systèmes de traduction mis à jour:', translationData.length);
      } catch (error) {
        console.error('[Server Update] Erreur parsing translationSystemsData:', error);
        guildSettings.translationSystems = [];
      }
    } else {
      guildSettings.translationSystems = [];
    }

    // === TRAITEMENT DES SYSTÈMES D'ATTRIBUTION DE RÔLES ===
    if (req.body.roleAssignmentSystemsData) {
      try {
        const roleData = JSON.parse(req.body.roleAssignmentSystemsData);
        guildSettings.roleAssignmentSystems = roleData;
        console.log('[Server Update] Systèmes d\'attribution de rôles mis à jour:', roleData.length);
      } catch (error) {
        console.error('[Server Update] Erreur parsing roleAssignmentSystemsData:', error);
        guildSettings.roleAssignmentSystems = [];
      }
    } else {
      guildSettings.roleAssignmentSystems = [];
    }

    // === TRAITEMENT DU RÈGLEMENT (CORRIGÉ) ===
  // === TRAITEMENT DU RÈGLEMENT (CORRIGÉ) ===
if (req.body.reglementConfigData) {
  try {
    let reglementData;
    
    // Gérer les cas où les données sont un array ou une string
    if (Array.isArray(req.body.reglementConfigData)) {
      reglementData = req.body.reglementConfigData.find(item => item && item.trim() !== '');
    } else {
      reglementData = req.body.reglementConfigData;
    }
    
    if (typeof reglementData === 'string' && reglementData.trim() !== '') {
      const parsedReglementConfig = JSON.parse(reglementData);
      
      // ✅ CORRECTION : S'assurer que les champs sont bien présents
      if (!parsedReglementConfig.targetChannelId && req.body.reglementTargetChannelHidden) {
        parsedReglementConfig.targetChannelId = req.body.reglementTargetChannelHidden;
      }
      
      if (parsedReglementConfig.autoSend === undefined && req.body.reglementAutoSendHidden) {
        parsedReglementConfig.autoSend = req.body.reglementAutoSendHidden === 'true';
      }
      
      guildSettings.reglementConfig = parsedReglementConfig;
      console.log('[Server Update] Configuration du règlement mise à jour:', parsedReglementConfig.enabled);
      console.log('[Server Update] Envoi automatique:', parsedReglementConfig.autoSend);
      console.log('[Server Update] Salon cible:', parsedReglementConfig.targetChannelId);
    } else {
      console.log('[Server Update] Données de règlement vides, conservation config existante');
      if (!guildSettings.reglementConfig) {
        guildSettings.reglementConfig = getDefaultReglementConfig();
      }
    }
  } catch (error) {
    console.error('[Server Update] Erreur parsing reglementConfigData:', error);
    guildSettings.reglementConfig = guildSettings.reglementConfig || getDefaultReglementConfig();
  }
} else {
  console.log('[Server Update] Aucune donnée de règlement reçue');
  if (!guildSettings.reglementConfig) {
    guildSettings.reglementConfig = getDefaultReglementConfig();
  }
}

// ✅ TRAITEMENT DIRECT DES CHAMPS CACHÉS EN FALLBACK
if (req.body.reglementTargetChannelHidden) {
  guildSettings.reglementConfig.targetChannelId = req.body.reglementTargetChannelHidden;
}

if (req.body.reglementAutoSendHidden !== undefined) {
  guildSettings.reglementConfig.autoSend = req.body.reglementAutoSendHidden === 'true';
}

    // === SAUVEGARDE ===
    await saveGuildSettings(guildId, guildSettings);
    console.log('[Server Update] Paramètres sauvegardés avec succès');

    // === ENVOI AUTOMATIQUE DU RÈGLEMENT ===
    if (guildSettings.reglementConfig?.enabled && 
        guildSettings.reglementConfig?.autoSend && 
        guildSettings.reglementConfig?.targetChannelId) {
      
      try {
        console.log('[Server Update] Lancement de l\'envoi automatique du règlement...');
        const autoSendResult = await sendReglementAutomatically(guildId, guildSettings.reglementConfig);
        
        // Mettre à jour les paramètres avec les infos d'envoi
        guildSettings.reglementConfig.lastMessageId = autoSendResult.messageId;
        guildSettings.reglementConfig.lastSent = autoSendResult.timestamp;
        guildSettings.reglementConfig.lastChannelId = guildSettings.reglementConfig.targetChannelId;
        
        await saveGuildSettings(guildId, guildSettings);
        console.log('[Server Update] Règlement envoyé automatiquement:', autoSendResult);
      } catch (autoSendError) {
        console.error('[Server Update] Erreur lors de l\'envoi automatique du règlement:', autoSendError);
        // Ne pas faire échouer la sauvegarde
      }
    }

    // === REDIRECTION AVEC SUCCÈS ===
    res.redirect(`/server/${guildId}?saved=true&timestamp=${Date.now()}`);

  } catch (error) {
    console.error('[Server Update] Erreur lors de la mise à jour:', error);
    console.error('[Server Update] Stack trace:', error.stack);
    
    // Retourner une page d'erreur HTML plutôt qu'un JSON
    res.status(500).send(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Erreur de sauvegarde</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 40px; }
          .error { background: #fee; border: 1px solid #fcc; padding: 20px; border-radius: 5px; }
          .back-link { margin-top: 20px; }
          .back-link a { color: #0066cc; text-decoration: none; }
        </style>
      </head>
      <body>
        <div class="error">
          <h1>❌ Erreur lors de la sauvegarde</h1>
          <p><strong>Message d'erreur :</strong> ${error.message}</p>
          <p>Veuillez réessayer ou contacter l'administrateur si le problème persiste.</p>
        </div>
        <div class="back-link">
          <a href="/server/${guildId}">← Retourner au dashboard</a>
        </div>
      </body>
      </html>
    `);
  }
});

// === guildMemberAdd et guildMemberRemove CORRIGÉS ===
client.on('guildMemberAdd', async (member) => {
  try {
    const guildSettings = await getGuildSettings(member.guild.id);
    
    // Messages de bienvenue existants
    if (guildSettings?.welcomeEnabled && guildSettings?.welcomeChannel) {
      const channel = member.guild.channels.cache.get(guildSettings.welcomeChannel);
      if (channel && channel.isTextBased()) {
        const welcomeMessage = guildSettings.welcomeMessage
          .replace(/{user}/g, `<@${member.id}>`)
          .replace(/{username}/g, member.user.username)
          .replace(/{server}/g, member.guild.name);
        
        await channel.send(welcomeMessage);
      }
    }

    // Attribution automatique de rôles
    await handleRoleAssignment('member_join', {
      guild: member.guild,
      user: member.user,
      member: member
    }, client);

  } catch (error) {
    console.error('Erreur dans guildMemberAdd:', error);
  }
});

client.on('guildMemberRemove', async (member) => {
  try {
    const guildSettings = await getGuildSettings(member.guild.id);
    if (!guildSettings || !guildSettings.goodbyeEnabled || !guildSettings.welcomeChannel) return;

    const channel = member.guild.channels.cache.get(guildSettings.welcomeChannel);
    if (channel && channel.isTextBased()) {
      const goodbyeMessage = guildSettings.goodbyeMessage
        .replace(/{user}/g, `<@${member.id}>`)
        .replace(/{username}/g, member.user.username)
        .replace(/{server}/g, member.guild.name);

      await channel.send(goodbyeMessage);
    }
  } catch (error) {
    console.error('Erreur dans guildMemberRemove:', error);
  }
});

// === DÉMARRAGE DU SERVEUR EXPRESS ===
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Serveur Express démarré sur http://localhost:${PORT}`);
});

app.get('/health', (req, res) => res.send('OK'));

// === NETTOYAGE PÉRIODIQUE ===
setInterval(async () => {
  try {
    await cleanupOldBackups();
    console.log('🧹 Nettoyage automatique des sauvegardes effectué');
  } catch (error) {
    console.error('❌ Erreur lors du nettoyage automatique:', error);
  }
}, 60 * 60 * 1000); // Toutes les heures