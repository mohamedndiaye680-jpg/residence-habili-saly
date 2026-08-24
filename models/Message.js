// models/Message.js
const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  nom: { type: String, required: true },
  telephone: { type: String, required: true },
  email: { type: String, default: '' },
  typeHebergement: { type: String, required: true },
  message: { type: String, required: true },
  dateArrivee: { type: Date, required: true },
  dateDepart: { type: Date, required: true },
  traite: { type: Boolean, default: false }, // pour cocher les demandes déjà traitées
  annulee: { type: Boolean, default: false }, // libère les dates si la demande est invalide/annulée
  dateReception: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Message', messageSchema);
