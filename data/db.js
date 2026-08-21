// data/db.js
// Connexion à la base de données MongoDB (MongoDB Atlas — gratuit).
// L'URL de connexion vient de la variable d'environnement MONGODB_URI,
// à définir sur Render (Settings > Environment) et dans un fichier .env en local.

const mongoose = require('mongoose');

async function connecterMongo() {
  const uri = process.env.MONGODB_URI;

  if (!uri) {
    console.warn(
      "⚠️  MONGODB_URI n'est pas définie. Les réservations ne seront pas sauvegardées en base."
    );
    return;
  }

  try {
    await mongoose.connect(uri);
    console.log('✅ Connecté à MongoDB');
  } catch (err) {
    console.error('❌ Échec de connexion à MongoDB :', err.message);
  }
}

module.exports = { connecterMongo };
