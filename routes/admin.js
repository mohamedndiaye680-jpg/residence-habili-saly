// routes/admin.js
// Zone d'administration protégée par mot de passe (variable d'environnement ADMIN_PASSWORD).
// Permet de consulter les demandes de réservation reçues via le formulaire de contact.

const express = require('express');
const router = express.Router();
const { lireMessages, marquerMessageTraite, annulerMessage, lireVilla } = require('../data/store');

function estConnecte(req) {
  return req.session && req.session.adminConnecte === true;
}

function exigerConnexion(req, res, next) {
  if (estConnecte(req)) return next();
  return res.redirect('/admin/connexion');
}

// --- Page de connexion ---
router.get('/connexion', (req, res) => {
  if (estConnecte(req)) return res.redirect('/admin');
  res.render('admin-login', { erreur: null });
});

router.post('/connexion', (req, res) => {
  const motDePasseAttendu = process.env.ADMIN_PASSWORD;

  if (!motDePasseAttendu) {
    return res.render('admin-login', {
      erreur:
        "Aucun mot de passe admin n'est configuré sur le serveur (ADMIN_PASSWORD manquant).",
    });
  }

  if (req.body.motDePasse === motDePasseAttendu) {
    req.session.adminConnecte = true;
    return res.redirect('/admin');
  }

  return res.render('admin-login', { erreur: 'Mot de passe incorrect.' });
});

router.post('/deconnexion', (req, res) => {
  req.session.destroy(() => res.redirect('/admin/connexion'));
});

// --- Tableau de bord ---
router.get('/', exigerConnexion, async (req, res) => {
  const messages = await lireMessages();
  res.render('admin-dashboard', { messages, erreur: req.query.erreur || null });
});

// --- Marquer une demande comme traitée / non traitée ---
router.post('/messages/:id/traite', exigerConnexion, async (req, res) => {
  const traite = req.body.traite === '1';
  const resultat = await marquerMessageTraite(req.params.id, traite);
  if (resultat && resultat.erreur) {
    return res.redirect('/admin?erreur=' + encodeURIComponent(resultat.erreur));
  }
  res.redirect('/admin');
});

// --- Annuler une demande (libère les dates) / la réactiver ---
router.post('/messages/:id/annuler', exigerConnexion, async (req, res) => {
  const annulee = req.body.annulee === '1';
  await annulerMessage(req.params.id, annulee);
  res.redirect('/admin');
});

module.exports = router;
