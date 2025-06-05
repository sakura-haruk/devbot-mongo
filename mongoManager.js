// mongoManager.js - Version adaptée pour remplacer mongoManager.js
import mongoose from 'mongoose';
import { v4 as uuidv4 } from 'uuid';
import { DEFAULT_GUILD_SETTINGS, mergeGuildSettings } from './config.js';

// Import du modèle GuildSettings
import GuildSettings from './models/GuildSettings.js'; // ✅ si models est dans le même dossier


class MongoManager {
  constructor() {
    this.isConnected = false;
    this.connectionLocks = new Map(); // Remplacement des fileLocks
  }

   async getGuildSettings(guildId) {
    try {
      console.log(`[mongoManager] 📖 Récupération des settings pour ${guildId}`);
      
      let settings = await GuildSettings.findOne({ guildId });
      
      if (!settings) {
        console.log(`[mongoManager] 🆕 Aucun settings trouvé pour ${guildId}, création par défaut`);
        const defaultSettings = this.normalizeGuildSettings({});
        const preparedData = this.prepareDataForMongoDB({ guildId, ...defaultSettings });
        
        settings = new GuildSettings(preparedData);
        await settings.save();
        console.log(`[mongoManager] ✅ Settings par défaut créés pour ${guildId}`);
      }

      // Convertir et normaliser pour la compatibilité
      const converted = this.convertFromMongoDB(settings);
      const normalized = this.normalizeGuildSettings(converted);
      
      console.log(`[mongoManager] ✅ Settings récupérés pour ${guildId}`);
      return normalized;
      
    } catch (err) {
      console.error(`[mongoManager] ❌ Erreur récupération settings ${guildId}:`, err);
      return this.normalizeGuildSettings({});
    }
  }

  async saveGuildSettings(guildId, newSettingsFromIndexJs) {
    const lockKey = `guildSettings_${guildId}`;
    
    console.log(`[mongoManager] Début sauvegarde pour ${guildId}`);
    console.log(`[mongoManager] Données reçues:`, JSON.stringify(newSettingsFromIndexJs, null, 2));
    
    // Gestion des locks (comme l'original)
    while (this.connectionLocks.has(lockKey)) {
      console.log(`[mongoManager] Attente libération du lock pour ${guildId}`);
      await new Promise(resolve => setTimeout(resolve, 100));
    }
    
    try {
      this.connectionLocks.set(lockKey, true);
      console.log(`[mongoManager] Lock acquis pour ${guildId}`);
      
      // Chargement des paramètres actuels
      const currentSettingsRaw = await GuildSettings.findOne({ guildId });
      const currentSettingsFromFile = currentSettingsRaw ? 
        this.convertFromMongoDB(currentSettingsRaw) : {};
      
      console.log(`[mongoManager] Paramètres actuels pour ${guildId}:`, JSON.stringify(currentSettingsFromFile, null, 2));
      
      // Fusion des paramètres (comme l'original)
      let mergedForNormalization = mergeGuildSettings(currentSettingsFromFile, newSettingsFromIndexJs);
      console.log(`[mongoManager] Après fusion:`, JSON.stringify(mergedForNormalization, null, 2));
      
      let settingsToSave = this.normalizeGuildSettings(mergedForNormalization);
      console.log(`[mongoManager] Après normalisation:`, JSON.stringify(settingsToSave, null, 2));

      // Validation (comme l'original)
      const validationErrors = this.validateGuildSettings(settingsToSave);
      if (validationErrors.length > 0) {
        console.error(`[mongoManager] Erreurs de validation pour ${guildId}:`, validationErrors);
        throw new Error(`Erreurs de validation: ${validationErrors.join('; ')}`);
      }

      // Préparation pour MongoDB
      const preparedData = this.prepareDataForMongoDB(settingsToSave);

      // Sauvegarde dans MongoDB
      console.log(`[mongoManager] Tentative de sauvegarde MongoDB...`);
      const result = await GuildSettings.findOneAndUpdate(
        { guildId },
        { ...preparedData, guildId, updatedAt: new Date() },
        { upsert: true, new: true, runValidators: true }
      );
      
      console.log(`[mongoManager] ✅ Sauvegarde MongoDB réussie pour ${guildId}`);
      
      return settingsToSave;
      
    } catch (err) {
      console.error(`[mongoManager] ❌ Erreur sauvegarde pour ${guildId}:`, err);
      console.error(`[mongoManager] Stack trace:`, err.stack);
      throw err; 
    } finally {
      this.connectionLocks.delete(lockKey);
      console.log(`[mongoManager] Lock libéré pour ${guildId}`);
    }
  }

  // Connexion à MongoDB (remplace initializeDataStructure)
  async connect() {
    try {
      const mongoUri = process.env.MONGODB_URI;
      
      if (!mongoUri) {
        throw new Error('MONGODB_URI n\'est pas défini dans les variables d\'environnement');
      }

      console.log('📊 Connexion à MongoDB Atlas...');
      
      await mongoose.connect(mongoUri, {
        maxPoolSize: 5,
        serverSelectionTimeoutMS: 10000,
        socketTimeoutMS: 45000,
        retryWrites: true,
        retryReads: true,
        family: 4,
        authSource: 'admin'
      });

      this.isConnected = true;
      console.log('✅ Connexion MongoDB Atlas établie avec succès');
      
      // Gestion des événements de connexion
      mongoose.connection.on('error', (error) => {
        console.error('❌ Erreur MongoDB:', error);
        this.isConnected = false;
      });

      mongoose.connection.on('disconnected', () => {
        console.warn('⚠️ MongoDB déconnecté - tentative de reconnexion...');
        this.isConnected = false;
      });

      mongoose.connection.on('reconnected', () => {
        console.log('🔄 MongoDB reconnecté avec succès');
        this.isConnected = true;
      });

    } catch (error) {
      console.error('❌ Erreur de connexion MongoDB:', error);
      throw error;
    }
  }

  // Déconnexion propre
  async disconnect() {
    try {
      await mongoose.connection.close();
      this.isConnected = false;
      console.log('🔌 Connexion MongoDB fermée');
    } catch (error) {
      console.error('❌ Erreur lors de la fermeture MongoDB:', error);
    }
  }

  // Validation des paramètres (adaptée de l'original)
  validateGuildSettings(settings) {
    const errors = [];
    
    try {
      // Validation du préfixe
      if (settings.prefix && (typeof settings.prefix !== 'string' || settings.prefix.length > 5)) {
        errors.push("Le préfixe doit être une chaîne de caractères de 5 caractères maximum.");
      }
      
      // Validation des systèmes de traduction
      if (settings.translationSystems && Array.isArray(settings.translationSystems)) {
        settings.translationSystems.forEach((system, index) => {
          if (!system.id || typeof system.id !== 'string') {
            errors.push(`Système de traduction à l'index ${index} manque un ID valide.`);
          }
          if (typeof system.name !== 'string') {
            errors.push(`Système de traduction '${system.id}' manque un nom valide.`);
          }
          if (!system.channels || typeof system.channels !== 'object') {
            errors.push(`Système de traduction '${system.id}' manque un objet 'channels' valide.`);
          } else {
            for (const lang in system.channels) {
              if (typeof system.channels[lang] !== 'string' || !/^\d{17,20}$/.test(system.channels[lang])) {
                errors.push(`Système '${system.id}', langue '${lang}': ID de salon invalide '${system.channels[lang]}'.`);
              }
            }
          }
        });
      }

      // Validation des systèmes d'attribution de rôles
      if (settings.roleAssignmentSystems && Array.isArray(settings.roleAssignmentSystems)) {
        settings.roleAssignmentSystems.forEach((system, index) => {
          if (!system.id || typeof system.id !== 'string') {
            errors.push(`Système de rôles à l'index ${index} manque un ID valide.`);
          }
          if (typeof system.name !== 'string') {
            errors.push(`Système de rôles '${system.id}' manque un nom valide.`);
          }
          if (!['member_join', 'reaction_add', 'button_click', 'command_use'].includes(system.condition)) {
            errors.push(`Système de rôles '${system.id}' a une condition invalide: ${system.condition}`);
          }
          if (!system.targetRole || !/^\d{17,20}$/.test(system.targetRole)) {
            errors.push(`Système de rôles '${system.id}' a un rôle cible invalide: ${system.targetRole}`);
          }
        });
      }
      
      // Validation des IDs de salons
      const channelFields = ['welcomeChannel', 'ticketCategoryID', 'ticketLogChannelID', 'logChannelID'];
      channelFields.forEach(field => {
        if (settings[field] && !/^\d{17,20}$/.test(settings[field])) {
          errors.push(`${field} doit être un ID Discord valide.`);
        }
      });
      
      // Validation des rôles
      if (settings.setlanguesRequiredRoles && Array.isArray(settings.setlanguesRequiredRoles)) {
        settings.setlanguesRequiredRoles.forEach(roleId => {
          if (!/^\d{17,20}$/.test(roleId)) {
            errors.push(`ID de rôle invalide dans setlanguesRequiredRoles: ${roleId}`);
          }
        });
      }
      
      if (settings.ticketSupportRoles && Array.isArray(settings.ticketSupportRoles)) {
        settings.ticketSupportRoles.forEach(roleId => {
          if (!/^\d{17,20}$/.test(roleId)) {
            errors.push(`ID de rôle invalide dans ticketSupportRoles: ${roleId}`);
          }
        });
      }
      
      // Validation des rôles de langue
      if (settings.langueRoles && typeof settings.langueRoles === 'object') {
        Object.entries(settings.langueRoles).forEach(([lang, roleId]) => {
          if (roleId && !/^\d{17,20}$/.test(roleId)) {
            errors.push(`ID de rôle invalide pour la langue ${lang}: ${roleId}`);
          }
        });
      }
      
    } catch (validationError) {
      console.error('[mongoManager] Erreur lors de la validation:', validationError);
      errors.push(`Erreur de validation: ${validationError.message}`);
    }
    
    return errors;
  }

  // Normalisation des paramètres (adaptée de l'original)
  normalizeGuildSettings(settings) {
    const validSettings = (settings && typeof settings === 'object') ? settings : {};
    const mergedWithDefaults = { ...DEFAULT_GUILD_SETTINGS, ...validSettings };
    
    // Fusion spécifique pour les objets imbriqués
    if (validSettings.langueRoles && typeof validSettings.langueRoles === 'object') {
       mergedWithDefaults.langueRoles = {...DEFAULT_GUILD_SETTINGS.langueRoles, ...validSettings.langueRoles};
    }
    
    // Pour translationSystems, on s'assure que c'est un tableau
    if (Array.isArray(validSettings.translationSystems)) {
       mergedWithDefaults.translationSystems = validSettings.translationSystems.map(sys => ({ 
          id: sys.id || uuidv4(),
          name: typeof sys.name === 'string' ? sys.name : '',
          channels: (sys.channels && typeof sys.channels === 'object') ? { ...sys.channels } : {}
       }));
    } else {
       mergedWithDefaults.translationSystems = [];
    }

    // Pour roleAssignmentSystems, on s'assure que c'est un tableau
    if (Array.isArray(validSettings.roleAssignmentSystems)) {
       mergedWithDefaults.roleAssignmentSystems = validSettings.roleAssignmentSystems.map(sys => ({ 
          id: sys.id || uuidv4(),
          name: typeof sys.name === 'string' ? sys.name : '',
          condition: sys.condition || 'member_join',
          targetRole: sys.targetRole || '',
          triggerData: (sys.triggerData && typeof sys.triggerData === 'object') ? { ...sys.triggerData } : {},
          enabled: sys.enabled !== false,
          description: typeof sys.description === 'string' ? sys.description : ''
       }));
    } else {
       mergedWithDefaults.roleAssignmentSystems = [];
    }

    // Ajout du support pour reglementConfig
    if (validSettings.reglementConfig && typeof validSettings.reglementConfig === 'object') {
      mergedWithDefaults.reglementConfig = {
        ...DEFAULT_GUILD_SETTINGS.reglementConfig,
        ...validSettings.reglementConfig
      };
    }

    // Fonctions utilitaires
    const cleanLanguageRoleId = (value) => (typeof value === 'string' && value.trim() !== '' ? value.trim() : '');
    const cleanRoleIdArray = (arr) => (Array.isArray(arr) ? arr.filter(id => typeof id === 'string' && /^\d{17,20}$/.test(id)) : []);
    const cleanNullableString = (value) => (typeof value === 'string' && value.trim() !== '' ? value.trim() : null);

    // Normalisation pour translationSystems (tableau de systèmes)
    const normalizedTranslationSystems = [];
    if (Array.isArray(mergedWithDefaults.translationSystems)) {
      mergedWithDefaults.translationSystems.forEach(system => {
        // Vérifie si le system est un objet et a la propriété channels
        if (system && typeof system === 'object' && system.channels && typeof system.channels === 'object') {
          const normalizedSystemChannels = {};
          for (const langCode in system.channels) {
            // Vérifie que langCode est une propriété directe de system.channels
            if (Object.prototype.hasOwnProperty.call(system.channels, langCode)) {
              const channelId = system.channels[langCode];
              if (typeof channelId === 'string' && channelId.trim() !== '') {
                normalizedSystemChannels[langCode] = channelId.trim();
              }
            }
          }
          // Chaque système doit avoir un ID (généré si absent) et un nom
          normalizedTranslationSystems.push({
            id: system.id || uuidv4(),
            name: typeof system.name === 'string' ? system.name.trim() : `Système de traduction ${normalizedTranslationSystems.length + 1}`,
            channels: normalizedSystemChannels
          });
        }
      });
    }

    // Normalisation pour roleAssignmentSystems (tableau de systèmes)
    const normalizedRoleAssignmentSystems = [];
    if (Array.isArray(mergedWithDefaults.roleAssignmentSystems)) {
      mergedWithDefaults.roleAssignmentSystems.forEach(system => {
        if (system && typeof system === 'object' && system.targetRole) {
          normalizedRoleAssignmentSystems.push({
            id: system.id || uuidv4(),
            name: typeof system.name === 'string' ? system.name.trim() : `Système de rôles ${normalizedRoleAssignmentSystems.length + 1}`,
            condition: ['member_join', 'reaction_add', 'button_click', 'command_use'].includes(system.condition) ? system.condition : 'member_join',
            targetRole: typeof system.targetRole === 'string' ? system.targetRole.trim() : '',
            triggerData: (system.triggerData && typeof system.triggerData === 'object') ? { ...system.triggerData } : {},
            enabled: system.enabled !== false,
            description: typeof system.description === 'string' ? system.description.trim() : ''
          });
        }
      });
    }

    const normalizedSettings = {
      prefix: typeof mergedWithDefaults.prefix === 'string' ? mergedWithDefaults.prefix.trim() || DEFAULT_GUILD_SETTINGS.prefix : DEFAULT_GUILD_SETTINGS.prefix,
      welcomeEnabled: typeof mergedWithDefaults.welcomeEnabled === 'boolean' ? mergedWithDefaults.welcomeEnabled : DEFAULT_GUILD_SETTINGS.welcomeEnabled,
      welcomeMessage: typeof mergedWithDefaults.welcomeMessage === 'string' ? mergedWithDefaults.welcomeMessage.trim() : DEFAULT_GUILD_SETTINGS.welcomeMessage,
      goodbyeEnabled: typeof mergedWithDefaults.goodbyeEnabled === 'boolean' ? mergedWithDefaults.goodbyeEnabled : DEFAULT_GUILD_SETTINGS.goodbyeEnabled,
      goodbyeMessage: typeof mergedWithDefaults.goodbyeMessage === 'string' ? mergedWithDefaults.goodbyeMessage.trim() : DEFAULT_GUILD_SETTINGS.goodbyeMessage,
      welcomeChannel: cleanNullableString(mergedWithDefaults.welcomeChannel),
      langueRoles: {
        fr: cleanLanguageRoleId(mergedWithDefaults.langueRoles?.fr),
        en: cleanLanguageRoleId(mergedWithDefaults.langueRoles?.en),
        es: cleanLanguageRoleId(mergedWithDefaults.langueRoles?.es),
        de: cleanLanguageRoleId(mergedWithDefaults.langueRoles?.de),
        pt: cleanLanguageRoleId(mergedWithDefaults.langueRoles?.pt),
        ru: cleanLanguageRoleId(mergedWithDefaults.langueRoles?.ru),
        hu: cleanLanguageRoleId(mergedWithDefaults.langueRoles?.hu),
        it: cleanLanguageRoleId(mergedWithDefaults.langueRoles?.it)
      },
      setlanguesRequiredRoles: cleanRoleIdArray(mergedWithDefaults.setlanguesRequiredRoles),
      ticketCategoryID: cleanNullableString(mergedWithDefaults.ticketCategoryID),
      ticketLogChannelID: cleanNullableString(mergedWithDefaults.ticketLogChannelID),
      ticketOpenMessageID: cleanNullableString(mergedWithDefaults.ticketOpenMessageID),
      logChannelID: cleanNullableString(mergedWithDefaults.logChannelID),
      logEvents: Array.isArray(mergedWithDefaults.logEvents) ? [...new Set(mergedWithDefaults.logEvents.filter(e => typeof e === 'string' && e.trim() !== ''))] : [],
      ticketSupportRoles: cleanRoleIdArray(mergedWithDefaults.ticketSupportRoles),
      translationSystems: normalizedTranslationSystems,
      roleAssignmentSystems: normalizedRoleAssignmentSystems
    };

    // Ajouter reglementConfig normalisé
    if (mergedWithDefaults.reglementConfig) {
      normalizedSettings.reglementConfig = mergedWithDefaults.reglementConfig;
    }

    return normalizedSettings;
  }

  // Préparer les données pour MongoDB
  prepareDataForMongoDB(data) {
    const prepared = { ...data };
    
    // Convertir les objets en Maps pour MongoDB
    if (prepared.langueRoles && typeof prepared.langueRoles === 'object') {
      prepared.langueRoles = new Map(Object.entries(prepared.langueRoles));
    }
    
    // Traiter les roleAssignmentSystems
    if (prepared.roleAssignmentSystems) {
      prepared.roleAssignmentSystems = prepared.roleAssignmentSystems.map(system => ({
        ...system,
        triggerData: system.triggerData && typeof system.triggerData === 'object' ?
          new Map(Object.entries(system.triggerData)) : new Map()
      }));
    }

    // Traiter les translationSystems
    if (prepared.translationSystems) {
      prepared.translationSystems = prepared.translationSystems.map(system => ({
        ...system,
        channels: system.channels && typeof system.channels === 'object' ?
          new Map(Object.entries(system.channels)) : new Map()
      }));
    }
    
    return prepared;
  }

  // Convertir les données MongoDB en format compatible
  convertFromMongoDB(mongoData) {
    if (!mongoData) return null;

    const converted = mongoData.toObject ? mongoData.toObject() : { ...mongoData };
    
    // Convertir les Maps en objets
    if (converted.langueRoles instanceof Map) {
      converted.langueRoles = Object.fromEntries(converted.langueRoles);
    }
    
    // Convertir les triggerData dans roleAssignmentSystems
    if (converted.roleAssignmentSystems) {
      converted.roleAssignmentSystems = converted.roleAssignmentSystems.map(system => ({
        ...system,
        triggerData: system.triggerData instanceof Map ? 
          Object.fromEntries(system.triggerData) : system.triggerData
      }));
    }

    // Convertir les channels dans translationSystems
    if (converted.translationSystems) {
      converted.translationSystems = converted.translationSystems.map(system => ({
        ...system,
        channels: system.channels instanceof Map ? 
          Object.fromEntries(system.channels) : system.channels
      }));
    }

    return converted;
  }
}

// Instance globale du manager
// ✅ CORRECTION CRUCIALE : Exports avec instance
const mongoManager = new MongoManager();

export async function getGuildSettings(guildId) {
  return await mongoManager.getGuildSettings(guildId);
}

export async function saveGuildSettings(guildId, settings) {
  return await mongoManager.saveGuildSettings(guildId, settings);
}

export async function initializeDataStructure() {
  return await mongoManager.connect();
}

// Compatible avec l'original


// Remplace createBackup (optionnel avec MongoDB)
export async function createBackup() {
  try {
    console.log(`✅ Backup automatique avec MongoDB Atlas (pas d'action nécessaire)`);
  } catch (err) {
    console.error('❌ Erreur backup MongoDB:', err);
  }
}

// Remplace cleanupOldBackups (pas nécessaire avec MongoDB)
export async function cleanupOldBackups() {
  try {
    console.log(`✅ Nettoyage automatique avec MongoDB Atlas (pas d'action nécessaire)`);
  } catch (err) {
    console.error('❌ Erreur nettoyage MongoDB:', err);
  }
}

// Export de l'instance pour les fonctions avancées
export { mongoManager };