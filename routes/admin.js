// routes/admin.js
// Zone d'administration protégée par mot de passe.
// Permet de consulter les demandes de réservation reçues via le formulaire de contact,
// et de changer le mot de passe d'accès (voir data/adminAuth.js pour le détail).

const express = require('express');
const router = express.Router();
const { lireMessages, marquerMessageTraite } = require('../data/store');
const { verifierMotDePasse, definirNouveauMotDePasse } = require('../data/adminAuth');

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

router.post('/connexion', async (req, res) => {
  try {
    const motDePasseValide = await verifierMotDePasse(req.body.motDePasse || '');

    if (motDePasseValide) {
      req.session.adminConnecte = true;
      return res.redirect('/admin');
    }

    return res.render('admin-login', { erreur: 'Mot de passe incorrect.' });
  } catch (err) {
    console.error('Erreur lors de la vérification du mot de passe admin :', err);
    return res.render('admin-login', {
      erreur: 'Une erreur est survenue, merci de réessayer.',
    });
  }
});

router.post('/deconnexion', (req, res) => {
  req.session.destroy(() => res.redirect('/admin/connexion'));
});

// --- Tableau de bord ---
router.get('/', exigerConnexion, async (req, res) => {
  const messages = await lireMessages();
  res.render('admin-dashboard', { messages });
});

// --- Marquer une demande comme traitée / non traitée ---
router.post('/messages/:id/traite', exigerConnexion, async (req, res) => {
  const traite = req.body.traite === '1';
  await marquerMessageTraite(req.params.id, traite);
  res.redirect('/admin');
});

// --- Modifier le mot de passe ---
router.get('/mot-de-passe', exigerConnexion, (req, res) => {
  res.render('admin-mot-de-passe', { erreur: null, succes: false });
});

router.post('/mot-de-passe', exigerConnexion, async (req, res) => {
  const { motDePasseActuel, nouveauMotDePasse, confirmationMotDePasse } = req.body;

  try {
    const motDePasseActuelValide = await verifierMotDePasse(motDePasseActuel || '');

    if (!motDePasseActuelValide) {
      return res.render('admin-mot-de-passe', {
        erreur: 'Le mot de passe actuel est incorrect.',
        succes: false,
      });
    }

    if (!nouveauMotDePasse || nouveauMotDePasse.length < 6) {
      return res.render('admin-mot-de-passe', {
        erreur: 'Le nouveau mot de passe doit contenir au moins 6 caractères.',
        succes: false,
      });
    }

    if (nouveauMotDePasse !== confirmationMotDePasse) {
      return res.render('admin-mot-de-passe', {
        erreur: 'La confirmation ne correspond pas au nouveau mot de passe.',
        succes: false,
      });
    }

    await definirNouveauMotDePasse(nouveauMotDePasse);

    return res.render('admin-mot-de-passe', { erreur: null, succes: true });
  } catch (err) {
    console.error('Erreur lors du changement de mot de passe admin :', err);
    return res.render('admin-mot-de-passe', {
      erreur: 'Une erreur est survenue, merci de réessayer.',
      succes: false,
    });
  }
});

module.exports = router;
