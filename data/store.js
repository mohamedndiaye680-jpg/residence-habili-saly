// data/store.js
// Petite couche d'accès aux données. Aujourd'hui basée sur des fichiers JSON,
// pensée pour être remplacée facilement par une vraie base de données
// (MongoDB, PostgreSQL, SQLite...) sans changer les routes qui l'utilisent.

const fs = require('fs');
const path = require('path');

const VILLA_PATH = path.join(__dirname, 'villa.json');
const MESSAGES_PATH = path.join(__dirname, 'messages.json');

function lireVilla() {
  const brut = fs.readFileSync(VILLA_PATH, 'utf-8');
  return JSON.parse(brut);
}

function lireMessages() {
  try {
    const brut = fs.readFileSync(MESSAGES_PATH, 'utf-8');
    return JSON.parse(brut);
  } catch (err) {
    return [];
  }
}

function ajouterMessage(message) {
  const messages = lireMessages();
  const nouveauMessage = {
    id: Date.now(),
    dateReception: new Date().toISOString(),
    ...message,
  };
  messages.push(nouveauMessage);
  fs.writeFileSync(MESSAGES_PATH, JSON.stringify(messages, null, 2), 'utf-8');
  return nouveauMessage;
}

module.exports = { lireVilla, lireMessages, ajouterMessage };
