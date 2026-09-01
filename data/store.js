// data/store.js
// Couche d'accès aux données.
// - Les infos de la villa restent dans data/villa.json (peu changeant, simple à éditer).
// - Les messages/réservations sont stockés dans MongoDB (persistant, ne disparaît pas
//   au redémarrage du serveur). Si MongoDB n'est pas configuré (pas de MONGODB_URI),
//   on utilise en secours le fichier data/messages.json, comme avant.

const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');
const Message = require('../models/Message');

const VILLA_PATH = path.join(__dirname, 'villa.json');
const MESSAGES_PATH = path.join(__dirname, 'messages.json');

function lireVilla() {
  const brut = fs.readFileSync(VILLA_PATH, 'utf-8');
  return JSON.parse(brut);
}

function mongoConnecte() {
  return mongoose.connection.readyState === 1;
}

// --- Secours fichier JSON (utilisé seulement si MongoDB n'est pas connecté) ---
function lireMessagesFichier() {
  try {
    const brut = fs.readFileSync(MESSAGES_PATH, 'utf-8');
    return JSON.parse(brut);
  } catch (err) {
    return [];
  }
}

function ajouterMessageFichier(message) {
  const messages = lireMessagesFichier();
  const nouveauMessage = {
    id: Date.now(),
    dateReception: new Date().toISOString(),
    traite: false,
    ...message,
  };
  messages.push(nouveauMessage);
  fs.writeFileSync(MESSAGES_PATH, JSON.stringify(messages, null, 2), 'utf-8');
  return nouveauMessage;
}

// --- Fonctions principales (utilisées par les routes) ---

async function ajouterMessage(message) {
  if (mongoConnecte()) {
    const nouveauMessage = await Message.create(message);
    return nouveauMessage;
  }
  return ajouterMessageFichier(message);
}

async function lireMessages() {
  if (mongoConnecte()) {
    return Message.find().sort({ dateReception: -1 }).lean();
  }
  return lireMessagesFichier().sort(
    (a, b) => new Date(b.dateReception) - new Date(a.dateReception)
  );
}

async function marquerMessageTraite(id, traite) {
  if (mongoConnecte()) {
    return Message.findByIdAndUpdate(id, { traite }, { new: true }).lean();
  }
  const messages = lireMessagesFichier();
  const msg = messages.find((m) => String(m.id) === String(id));
  if (msg) {
    msg.traite = traite;
    fs.writeFileSync(MESSAGES_PATH, JSON.stringify(messages, null, 2), 'utf-8');
  }
  return msg;
}

async function supprimerMessage(id) {
  if (mongoConnecte()) {
    await Message.findByIdAndDelete(id);
    return;
  }
  const messages = lireMessagesFichier().filter((m) => String(m.id) !== String(id));
  fs.writeFileSync(MESSAGES_PATH, JSON.stringify(messages, null, 2), 'utf-8');
}

module.exports = {
  lireVilla,
  lireMessages,
  ajouterMessage,
  marquerMessageTraite,
  supprimerMessage,
};
