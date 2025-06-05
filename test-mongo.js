import mongoose from 'mongoose';

const MONGODB_URI = "mongodb+srv://botdiscord:a5ebDqtb96ZLLhQx@cluster0.cwtftxo.mongodb.net/discordbot?retryWrites=true&w=majority";

async function testConnection() {
  try {
    console.log('🔄 Test de connexion MongoDB Atlas...');
    
    await mongoose.connect(MONGODB_URI, {
      maxPoolSize: 5,
      serverSelectionTimeoutMS: 10000
    });
    
    console.log('✅ Connexion réussie à MongoDB Atlas !');
    console.log('📊 Base de données :', mongoose.connection.name);
    
    await mongoose.disconnect();
    console.log('👋 Déconnexion propre');
    
  } catch (error) {
    console.error('❌ Erreur de connexion :', error.message);
  }
}

testConnection();