// data/adminAuth.js
// Gère le mot de passe de la page /admin.
//
// Fonctionnement :
// - Au tout premier lancement, aucun mot de passe personnalisé n'existe encore.
//   La connexion se fait alors avec la variable d'environnement ADMIN_PASSWORD
//   (mot de passe "de démarrage", défini sur Render).
// - Dès que quelqu'un utilise "Modifier le mot de passe", un nouveau mot de passe
//   (haché, jamais stocké en clair) est enregistré en base et prend le dessus.
//   ADMIN_PASSWORD n'est alors plus utilisé.

const fs = require('fs');
const path = require('path');
const bcrypt = require('bcryptjs');
const mongoose = require('mongoose');
const AdminConfig = require('../models/AdminConfig');

const ADMIN_PATH = path.join(__dirname, 'admin.json');

function mongoConnecte() {
  return mongoose.connection.readyState === 1;
}

// --- Secours fichier JSON ---
function lireAdminFichier() {
  try {
    const brut = fs.readFileSync(ADMIN_PATH, 'utf-8');
    return JSON.parse(brut);
  } catch (err) {
    return null;
  }
}

function ecrireAdminFichier(motDePasseHash) {
  fs.writeFileSync(
    ADMIN_PATH,
    JSON.stringify({ motDePasseHash, misAJourLe: new Date().toISOString() }, null, 2),
    'utf-8'
  );
}

// --- Fonctions principales ---

// Renvoie le hash du mot de passe personnalisé, ou null si aucun n'a encore été défini.
async function obtenirHashPersonnalise() {
  if (mongoConnecte()) {
    const config = await AdminConfig.findOne().lean();
    return config ? config.motDePasseHash : null;
  }
  const config = lireAdminFichier();
  return config ? config.motDePasseHash : null;
}

// Vérifie un mot de passe saisi par rapport au mot de passe actuel
// (personnalisé s'il existe, sinon ADMIN_PASSWORD de démarrage).
async function verifierMotDePasse(motDePasseSaisi) {
  const hashPersonnalise = await obtenirHashPersonnalise();

  if (hashPersonnalise) {
    return bcrypt.compare(motDePasseSaisi, hashPersonnalise);
  }

  // Aucun mot de passe personnalisé : on compare au mot de passe de démarrage.
  const motDePasseDemarrage = process.env.ADMIN_PASSWORD;
  if (!motDePasseDemarrage) return false;
  return motDePasseSaisi === motDePasseDemarrage;
}

// Enregistre un nouveau mot de passe personnalisé (remplace définitivement ADMIN_PASSWORD).
async function definirNouveauMotDePasse(nouveauMotDePasse) {
  const hash = await bcrypt.hash(nouveauMotDePasse, 10);

  if (mongoConnecte()) {
    await AdminConfig.deleteMany({});
    await AdminConfig.create({ motDePasseHash: hash });
    return;
  }
  ecrireAdminFichier(hash);
}

module.exports = {
  verifierMotDePasse,
  definirNouveauMotDePasse,
  obtenirHashPersonnalise,
};
