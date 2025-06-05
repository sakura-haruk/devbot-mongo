// models/GuildSettings.js - Version étendue
import mongoose from 'mongoose';

const ReglementConfigSchema = new mongoose.Schema({
  enabled: { type: Boolean, default: false },
  title: { type: String, default: 'Règlement du Serveur' },
  description: { type: String, default: 'Veuillez lire et accepter notre règlement pour accéder au serveur.' },
  color: { type: String, default: '#7289DA' },
  sections: [{
    name: { type: String, required: true },
    value: { type: String, required: true },
    inline: { type: Boolean, default: false }
  }],
  footerText: { type: String, default: 'En acceptant, vous obtiendrez automatiquement vos rôles d\'accès' },
  showThumbnail: { type: Boolean, default: true },
  showTimestamp: { type: Boolean, default: true },
  acceptButtonText: { type: String, default: '✅ J\'accepte le règlement' },
  declineButtonText: { type: String, default: '❌ Je refuse' },
  acceptButtonEmoji: { type: String, default: '📋' },
  declineButtonEmoji: { type: String, default: '🚫' }
}, { _id: false });

const TranslationSystemSchema = new mongoose.Schema({
  id: { type: String, required: true },
  name: { type: String, required: true },
  channels: { type: Map, of: String, default: {} }
}, { _id: false });

const RoleAssignmentSystemSchema = new mongoose.Schema({
  id: { type: String, required: true },
  name: { type: String, required: true },
  description: { type: String, default: '' },
  condition: { 
    type: String, 
    enum: ['member_join', 'button_click', 'reaction_add', 'command_use'], 
    required: true 
  },
  targetRole: { type: String, required: true },
  enabled: { type: Boolean, default: true },
  triggerData: { type: Map, of: mongoose.Schema.Types.Mixed, default: {} }
}, { _id: false });

const GuildSettingsSchema = new mongoose.Schema({
  guildId: { 
    type: String, 
    required: true, 
    unique: true,
    index: true 
  },
  prefix: { type: String, default: '.' },
  
  // Messages de bienvenue/au revoir
  welcomeEnabled: { type: Boolean, default: false },
  welcomeMessage: { type: String, default: '' },
  goodbyeEnabled: { type: Boolean, default: false },
  goodbyeMessage: { type: String, default: '' },
  welcomeChannel: { type: String, default: null },
  
  // Rôles de langue
  langueRoles: { type: Map, of: String, default: {} },
  setlanguesRequiredRoles: [{ type: String }],
  
  // Système de tickets
  ticketCategoryID: { type: String, default: null },
  ticketLogChannelID: { type: String, default: null },
  ticketOpenMessageID: { type: String, default: null },
  ticketSupportRoles: [{ type: String }],
  
  // Logs
  logChannelID: { type: String, default: null },
  logEvents: [{ 
    type: String, 
    enum: ['memberJoin', 'memberLeave', 'messageDelete', 'messageUpdate', 
           'channelCreate', 'channelDelete', 'channelUpdate', 
           'roleCreate', 'roleDelete', 'roleUpdate'] 
  }],
  
  // Systèmes avancés
  translationSystems: [TranslationSystemSchema],
  roleAssignmentSystems: [RoleAssignmentSystemSchema],
  
  // ✅ AJOUT CRUCIAL : Support du règlement
  reglementConfig: { 
    type: ReglementConfigSchema, 
    default: () => ({
      enabled: false,
      title: 'Règlement du Serveur',
      description: 'Veuillez lire et accepter notre règlement pour accéder au serveur.',
      color: '#7289DA',
      sections: [
        {
          name: 'Règles Générales',
          value: '• Respectez tous les membres\n• Pas de spam ou contenu inapproprié\n• Utilisez les bons salons\n• Suivez les instructions des modérateurs',
          inline: false
        }
      ],
      footerText: 'En acceptant, vous obtiendrez automatiquement vos rôles d\'accès',
      showThumbnail: true,
      showTimestamp: true,
      acceptButtonText: '✅ J\'accepte le règlement',
      declineButtonText: '❌ Je refuse',
      acceptButtonEmoji: '📋',
      declineButtonEmoji: '🚫'
    })
  },
  
  // Métadonnées
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// Middleware pour mettre à jour updatedAt
GuildSettingsSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

// Méthodes statiques utiles
GuildSettingsSchema.statics.findByGuildId = function(guildId) {
  return this.findOne({ guildId });
};

GuildSettingsSchema.statics.createOrUpdate = async function(guildId, updateData) {
  const options = { 
    upsert: true, 
    new: true, 
    runValidators: true,
    setDefaultsOnInsert: true
  };
  
  return this.findOneAndUpdate(
    { guildId }, 
    { ...updateData, updatedAt: new Date() }, 
    options
  );
};

const GuildSettings = mongoose.model("GuildSettings", GuildSettingsSchema);
export default GuildSettings;
