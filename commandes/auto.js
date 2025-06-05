// Bloc d'aide exporté
export const autoHelp = {
  name: '🤖 Auto-react/message',
  value: '`[prefix]createcommande [message]` — Crée une commande auto-répondante\n' +
         '`[prefix]delcommande [message]` — Supprime une commande auto-répondante\n' +
         '`[prefix]listecommandes` — Liste toutes les commandes auto-répondantes\n' +
         '`[prefix]autorespond [mot] [message]` — Crée une auto-réponse\n' +
         '`[prefix]delrespond [numero]` — Supprime une auto-réponse\n' +
         '`[prefix]listrespond` — Liste toutes les auto-réponses\n' +
         '`[prefix]addreact [mot] [emoji]` — Ajoute une auto-réaction\n' +
         '`[prefix]delreact [numero]` — Supprime une auto-réaction\n' +
         '`[prefix]listreact` — Liste toutes les auto-réactions'
};

// Maps globales pour le cache (optionnel, pour de meilleures performances)
const customCommands = new Map();
const autoReplies = new Map();
const autoReacts = new Map();

// Fonctions MongoDB (à adapter selon votre structure de base de données)

// Fonction pour charger les commandes personnalisées depuis MongoDB
export async function loadCustomCommands(guildId) {
  try {
    // Remplacez par votre requête MongoDB
    // Exemple : const data = await db.collection('customCommands').findOne({ guildId });
    // customCommands.set(guildId, new Map(Object.entries(data?.commands || {})));
    
    console.log(`✅ Commandes personnalisées chargées pour le serveur ${guildId}`);
  } catch (error) {
    console.error('Erreur chargement commandes personnalisées:', error);
  }
}

// Fonction pour charger les auto-réponses depuis MongoDB
export async function loadAutoReplies(guildId) {
  try {
    // Remplacez par votre requête MongoDB
    // Exemple : const data = await db.collection('autoReplies').findOne({ guildId });
    // autoReplies.set(guildId, new Map(Object.entries(data?.replies || {})));
    
    console.log(`✅ Auto-réponses chargées pour le serveur ${guildId}`);
  } catch (error) {
    console.error('Erreur chargement auto-réponses:', error);
  }
}

// Fonction pour charger les auto-réactions depuis MongoDB
export async function loadAutoReacts(guildId) {
  try {
    // Remplacez par votre requête MongoDB
    // Exemple : const data = await db.collection('autoReacts').findOne({ guildId });
    // autoReacts.set(guildId, new Map(Object.entries(data?.reacts || {})));
    
    console.log(`✅ Auto-réactions chargées pour le serveur ${guildId}`);
  } catch (error) {
    console.error('Erreur chargement auto-réactions:', error);
  }
}

// Fonctions de sauvegarde MongoDB

// Sauvegarder les commandes personnalisées
export async function saveCustomCommands(guildId, commands) {
  try {
    // Remplacez par votre requête MongoDB
    // Exemple : 
    // await db.collection('customCommands').updateOne(
    //   { guildId },
    //   { $set: { commands: Object.fromEntries(commands) } },
    //   { upsert: true }
    // );
    
    console.log(`✅ Commandes personnalisées sauvegardées pour le serveur ${guildId}`);
  } catch (error) {
    console.error('Erreur sauvegarde commandes personnalisées:', error);
  }
}

// Sauvegarder les auto-réponses
export async function saveAutoReplies(guildId, replies) {
  try {
    // Remplacez par votre requête MongoDB
    // Exemple :
    // await db.collection('autoReplies').updateOne(
    //   { guildId },
    //   { $set: { replies: Object.fromEntries(replies) } },
    //   { upsert: true }
    // );
    
    console.log(`✅ Auto-réponses sauvegardées pour le serveur ${guildId}`);
  } catch (error) {
    console.error('Erreur sauvegarde auto-réponses:', error);
  }
}

// Sauvegarder les auto-réactions
export async function saveAutoReacts(guildId, reacts) {
  try {
    // Remplacez par votre requête MongoDB
    // Exemple :
    // await db.collection('autoReacts').updateOne(
    //   { guildId },
    //   { $set: { reacts: Object.fromEntries(reacts) } },
    //   { upsert: true }
    // );
    
    console.log(`✅ Auto-réactions sauvegardées pour le serveur ${guildId}`);
  } catch (error) {
    console.error('Erreur sauvegarde auto-réactions:', error);
  }
}

// Fonctions utilitaires pour accéder aux données

export function getCustomCommands(guildId) {
  return customCommands.get(guildId) || new Map();
}

export function getAutoReplies(guildId) {
  return autoReplies.get(guildId) || new Map();
}

export function getAutoReacts(guildId) {
  return autoReacts.get(guildId) || new Map();
}

// Fonction d'initialisation pour charger toutes les données au démarrage
export async function initializeAutoData(guildIds) {
  console.log('🔄 Initialisation des données auto depuis MongoDB...');
  
  for (const guildId of guildIds) {
    await loadCustomCommands(guildId);
    await loadAutoReplies(guildId);
    await loadAutoReacts(guildId);
  }
  
  console.log('✅ Données auto initialisées depuis MongoDB');
}

// Configuration du préfixe par défaut
const DEFAULT_PREFIX = '!';

// Fonction principale pour les auto-réactions et réponses
export async function AutoReactsAndReplies(message) {
  const guildId = message.guild?.id;
  if (!guildId) return;

  const content = message.content;

  // Réactions automatiques
  const guildAutoReacts = autoReacts.get(guildId);
  if (guildAutoReacts) {
    for (const [trigger, emoji] of guildAutoReacts) {
      if (content.toLowerCase().includes(trigger.toLowerCase())) {
        try {
          await message.react(emoji);
        } catch (err) {
          console.error('Erreur de réaction :', err);
        }
      }
    }
  }
  
  // Réponses automatiques
  const guildAutoReplies = autoReplies.get(guildId);
  if (guildAutoReplies) {
    for (const [trigger, response] of guildAutoReplies) {
      if (content.toLowerCase().includes(trigger.toLowerCase())) {
        try {
          await message.reply(response);
          return; // Une seule réponse auto par message
        } catch (err) {
          console.error('Erreur de réponse automatique :', err);
        }
      }
    }
  }
}

export async function AutoFeaturesCommands(command, message, args, prefix = DEFAULT_PREFIX) {
  if (!message.guild) return false;
  
  const guildId = message.guild.id;

  // Commandes personnalisées
  const guildCommands = customCommands.get(guildId);
  if (guildCommands && guildCommands.has(command)) {
    try {
      await message.reply(guildCommands.get(command));
      return true;
    } catch (err) {
      console.error('Erreur commande personnalisée:', err);
    }
  }

  if (!command) return false;

  // Commande pour créer une commande personnalisée
  if (command === 'createcommande') {
    // Vérification permission administrateur
    if (!message.member.permissions.has('Administrator')) {
      await message.reply("🚫 Tu n'as pas la permission d'utiliser cette commande.");
      return true;
    }

    // Vérifie les arguments
    const [name, ...response] = args;
    if (!name || response.length === 0) {
      await message.reply(`❌ Utilisation : \`${prefix}createcommande [nom] [réponse]\``);
      return true;
    }

    // Crée ou récupère la Map des commandes pour ce serveur
    if (!customCommands.has(guildId)) {
      customCommands.set(guildId, new Map());
    }
    const guildCommands = customCommands.get(guildId);

    guildCommands.set(name.toLowerCase(), response.join(' '));

    // Sauvegarde dans le fichier JSON (conversion Map -> objet)
    const objToSave = {};
    for (const [gId, cmdsMap] of customCommands.entries()) {
      objToSave[gId] = Object.fromEntries(cmdsMap);
    }
    await saveJson(customCommandsPath, objToSave);

    await message.reply(`✅ Commande \`${name}\` créée.`);
    return true;
  }

  if (command === 'listecommandes') {
    if (!customCommands.has(guildId)) {
      await message.reply('📭 Aucune commande personnalisée enregistrée pour ce serveur.');
      return true;
    }

    const guildCommands = customCommands.get(guildId);
    const commandNames = [...guildCommands.keys()];

    if (commandNames.length === 0) {
      await message.reply('📭 Aucune commande personnalisée enregistrée pour ce serveur.');
      return true;
    }

    // Filtrage des noms non pertinents
    const filtered = commandNames.filter(name => /^[a-zA-Z0-9_]{2,32}$/.test(name));

    const formatted = filtered
      .sort()
      .map(name => `• \`${prefix}${name}\``)
      .join('\n');

    await message.reply(`📜 Commandes personnalisées :\n${formatted}`);
    return true;
  }

  if (command === 'delcommande') {
    if (!message.member.permissions.has('Administrator')) {
      await message.reply("🚫 Tu n'as pas la permission d'utiliser cette commande.");
      return true;
    }

    const name = args[0];
    if (!name) {
      await message.reply(`❌ Utilisation : \`${prefix}delcommande [nom]\``);
      return true;
    }

    // Vérifie que le serveur a bien des commandes personnalisées
    if (!customCommands.has(guildId)) {
      await message.reply('📭 Aucune commande personnalisée enregistrée.');
      return true;
    }

    const guildCommands = customCommands.get(guildId);

    // Vérifie que la commande existe
    if (!guildCommands.has(name)) {
      await message.reply(`❌ La commande \`${name}\` n'existe pas.`);
      return true;
    }

    // Supprime et sauvegarde
    guildCommands.delete(name);

    // Sauvegarde dans le fichier JSON
    const objToSave = {};
    for (const [gId, cmdsMap] of customCommands.entries()) {
      objToSave[gId] = Object.fromEntries(cmdsMap);
    }
    await saveJson(customCommandsPath, objToSave);

    await message.reply(`🗑 Commande \`${name}\` supprimée.`);
    return true;
  }

  if (command === 'listreact') {
    const guildAutoReacts = autoReacts.get(guildId);
    
    if (!guildAutoReacts || guildAutoReacts.size === 0) {
      await message.reply("❌ Aucune réaction automatique définie.");
      return true;
    }

    const list = [...guildAutoReacts.entries()]
      .map(([trigger, emoji], index) => `${index + 1}. ${trigger} → ${emoji}`)
      .join('\n');

    await message.reply(`📜 Réactions automatiques enregistrées :\n${list}`);
    return true;
  }

  if (command === 'delreact') {
    if (!message.member.permissions.has('Administrator')) {
      await message.reply("🚫 Tu n'as pas la permission d'utiliser cette commande.");
      return true;
    }

    const index = parseInt(args[0], 10) - 1;
    const guildAutoReacts = autoReacts.get(guildId);
    
    if (!guildAutoReacts || isNaN(index) || index < 0 || index >= guildAutoReacts.size) {
      await message.reply(`❌ Utilisation : \`${prefix}delreact [numéro]\` où le numéro est un indice valide.`);
      return true;
    }

    const keys = [...guildAutoReacts.keys()];
    const triggerToDelete = keys[index];
    guildAutoReacts.delete(triggerToDelete);
    
    // Sauvegarde
    const objToSave = {};
    for (const [gId, reactsMap] of autoReacts.entries()) {
      objToSave[gId] = Object.fromEntries(reactsMap);
    }
    await saveJson(autoReactsPath, objToSave);

    await message.reply(`✅ Réaction associée au déclencheur \`${triggerToDelete}\` supprimée.`);
    return true;
  }

  // autoreact - ajout d'un alias pour addreact
  if (command === 'autoreact') {
    if (!message.member.permissions.has('Administrator')) {
      await message.reply("🚫 Tu n'as pas la permission d'utiliser cette commande.");
      return true;
    }

    const [trigger, emoji] = args;
    if (!trigger || !emoji) {
      await message.reply(`❌ Utilisation : \`${prefix}autoreact [mot/phrase] [emoji]\``);
      return true;
    }

    if (!autoReacts.has(guildId)) {
      autoReacts.set(guildId, new Map());
    }
    
    const guildAutoReacts = autoReacts.get(guildId);
    guildAutoReacts.set(trigger.toLowerCase(), emoji);
    
    // Sauvegarde
    const objToSave = {};
    for (const [gId, reactsMap] of autoReacts.entries()) {
      objToSave[gId] = Object.fromEntries(reactsMap);
    }
    await saveJson(autoReactsPath, objToSave);
    
    await message.reply(`✅ Réaction ajoutée : \`${trigger}\` → ${emoji}`);
    return true;
  }

  // addreact (conservé pour compatibilité)
  if (command === 'addreact') {
    if (!message.member.permissions.has('Administrator')) {
      await message.reply("🚫 Tu n'as pas la permission d'utiliser cette commande.");
      return true;
    }

    const trigger = args[0];
    const emoji = args[1];

    if (!trigger || !emoji) {
      await message.reply(`❌ Utilisation : \`${prefix}addreact [mot] [emoji]\``);
      return true;
    }

    if (!autoReacts.has(guildId)) {
      autoReacts.set(guildId, new Map());
    }
    
    const guildAutoReacts = autoReacts.get(guildId);
    guildAutoReacts.set(trigger.toLowerCase(), emoji);
    
    // Sauvegarde
    const objToSave = {};
    for (const [gId, reactsMap] of autoReacts.entries()) {
      objToSave[gId] = Object.fromEntries(reactsMap);
    }
    await saveJson(autoReactsPath, objToSave);

    await message.reply(`✅ Je réagirai maintenant à **${trigger}** avec : ${emoji}`);
    return true;
  }

  if (command === 'autorespond') {
    if (!message.member.permissions.has('Administrator')) {
      await message.reply("🚫 Tu n'as pas la permission d'utiliser cette commande.");
      return true;
    }

    const trigger = args[0];
    const response = args.slice(1).join(' ');

    if (!trigger || !response) {
      await message.reply(`❌ Utilisation : \`${prefix}autorespond [mot] [message]\``);
      return true;
    }

    if (!autoReplies.has(guildId)) {
      autoReplies.set(guildId, new Map());
    }
    
    const guildAutoReplies = autoReplies.get(guildId);
    guildAutoReplies.set(trigger.toLowerCase(), response);
    
    // Sauvegarde
    const objToSave = {};
    for (const [gId, repliesMap] of autoReplies.entries()) {
      objToSave[gId] = Object.fromEntries(repliesMap);
    }
    await saveJson(autoRepliesPath, objToSave);

    await message.reply(`✅ Je répondrai maintenant à **${trigger}** par : ${response}`);
    return true;
  }

  // listrespond
  if (command === 'listrespond') {
    const guildAutoReplies = autoReplies.get(guildId);
    
    if (!guildAutoReplies || guildAutoReplies.size === 0) {
      await message.reply('📭 Aucune auto-réponse enregistrée.');
      return true;
    }

    const list = [...guildAutoReplies.entries()]
      .map(([trigger, response], i) => `${i + 1}. ${trigger} → ${response}`)
      .join('\n');

    await message.reply(`📜 Auto-réponses enregistrées :\n${list}`);
    return true;
  }

  // delrespond
  if (command === 'delrespond') {
    if (!message.member.permissions.has('Administrator')) {
      await message.reply("🚫 Tu n'as pas la permission d'utiliser cette commande.");
      return true;
    }

    const index = parseInt(args[0], 10) - 1;
    const guildAutoReplies = autoReplies.get(guildId);
    
    if (!guildAutoReplies || isNaN(index) || index < 0 || index >= guildAutoReplies.size) {
      await message.reply(`❌ Utilisation : \`${prefix}delrespond [numéro]\``);
      return true;
    }

    const key = [...guildAutoReplies.keys()][index];
    guildAutoReplies.delete(key);
    
    // Sauvegarde
    const objToSave = {};
    for (const [gId, repliesMap] of autoReplies.entries()) {
      objToSave[gId] = Object.fromEntries(repliesMap);
    }
    await saveJson(autoRepliesPath, objToSave);

    await message.reply(`🗑 Auto-réponse pour \`${key}\` supprimée.`);
    return true;
  }

  return false; // Commande non trouvée
}