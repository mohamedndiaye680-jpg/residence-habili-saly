// models/AdminConfig.js
// Stocke le mot de passe de la page /admin (haché, jamais en clair).
// Un seul document existe dans cette collection.

const mongoose = require('mongoose');

const adminConfigSchema = new mongoose.Schema({
  motDePasseHash: { type: String, required: true },
  misAJourLe: { type: Date, default: Date.now },
});

module.exports = mongoose.model('AdminConfig', adminConfigSchema);
