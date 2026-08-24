// routes/api.js
const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const { lireVilla, ajouterMessage, lirePeriodesReservees } = require('../data/store');
const { envoyerNotificationReservation } = require('../data/mailer');

// --- GET /api/villa : informations générales ---
router.get('/villa', (req, res) => {
  const villa = lireVilla();
  const { hebergements, galerie, ...infosGenerales } = villa;
  res.json(infosGenerales);
});

// --- GET /api/rooms : types de chambres et tarifs ---
router.get('/rooms', (req, res) => {
  const villa = lireVilla();
  res.json({
    hebergements: villa.hebergements,
    privatisation: villa.privatisation,
  });
});

// --- GET /api/gallery : liste des photos ---
router.get('/gallery', (req, res) => {
  const villa = lireVilla();
  res.json(villa.galerie);
});

// --- GET /api/dates-reservees : plages de dates déjà prises (pour le calendrier) ---
router.get('/dates-reservees', async (req, res) => {
  try {
    const periodes = await lirePeriodesReservees();
    res.json(periodes);
  } catch (err) {
    console.error('Erreur lors de la lecture des périodes réservées :', err);
    res.status(500).json([]);
  }
});

// --- POST /api/contact : réception d'une demande de réservation/contact ---
const regleValidation = [
  body('nom')
    .trim()
    .notEmpty().withMessage('Le nom est obligatoire.')
    .isLength({ min: 2, max: 100 }).withMessage('Le nom doit contenir entre 2 et 100 caractères.'),
  body('telephone')
    .trim()
    .notEmpty().withMessage('Le téléphone est obligatoire.')
    .matches(/^[0-9+\s.-]{6,20}$/).withMessage('Le numéro de téléphone semble invalide.'),
  body('email')
    .trim()
    .optional({ checkFalsy: true })
    .isEmail().withMessage('L\'adresse email semble invalide.'),
  body('type_hebergement')
    .trim()
    .notEmpty().withMessage('Merci de préciser le type d\'hébergement souhaité.'),
  body('date_arrivee')
    .notEmpty().withMessage('La date d\'arrivée est obligatoire.')
    .isISO8601().withMessage('La date d\'arrivée est invalide.'),
  body('date_depart')
    .notEmpty().withMessage('La date de départ est obligatoire.')
    .isISO8601().withMessage('La date de départ est invalide.')
    .custom((value, { req }) => {
      if (new Date(value) <= new Date(req.body.date_arrivee)) {
        throw new Error('La date de départ doit être après la date d\'arrivée.');
      }
      return true;
    }),
  body('message')
    .trim()
    .notEmpty().withMessage('Le message ne peut pas être vide.')
    .isLength({ min: 5, max: 2000 }).withMessage('Le message doit contenir entre 5 et 2000 caractères.'),
];

router.post('/contact', regleValidation, async (req, res) => {
  const resultatValidation = validationResult(req);
  const prefereJson = req.accepts(['html', 'json']) === 'json';

  if (!resultatValidation.isEmpty()) {
    const erreurs = resultatValidation.array();

    if (prefereJson) {
      return res.status(422).json({ success: false, errors: erreurs });
    }

    const villa = lireVilla();
    return res.status(422).render('contact', {
      pageTitle: 'Contact & Réservation — ' + villa.nom,
      pageDescription: "Contactez-nous pour réserver votre séjour à la Résidence Habili Saly.",
      villa,
      succes: false,
      erreurs,
      anciennesValeurs: req.body,
    });
  }

  try {
    const dateArrivee = new Date(req.body.date_arrivee);
    const dateDepart = new Date(req.body.date_depart);

    const demande = {
      nom: req.body.nom.trim(),
      telephone: req.body.telephone.trim(),
      email: (req.body.email || '').trim(),
      typeHebergement: req.body.type_hebergement.trim(),
      message: req.body.message.trim(),
      dateArrivee,
      dateDepart,
    };

    const message = await ajouterMessage(demande);

    // Envoi de l'email en arrière-plan : on ne fait pas attendre le visiteur.
    envoyerNotificationReservation(demande);

    if (prefereJson) {
      return res.status(201).json({
        success: true,
        message: 'Votre demande a bien été envoyée. Nous vous recontactons très vite !',
        id: message.id || message._id,
      });
    }

    return res.redirect('/contact?succes=1');
  } catch (err) {
    console.error('Erreur lors de l\'enregistrement de la demande :', err);
    if (prefereJson) {
      return res.status(500).json({
        success: false,
        message: "Une erreur est survenue, merci de réessayer.",
      });
    }
    const villa = lireVilla();
    return res.status(500).render('contact', {
      pageTitle: 'Contact & Réservation — ' + villa.nom,
      pageDescription: "Contactez-nous pour réserver votre séjour à la Résidence Habili Saly.",
      villa,
      succes: false,
      erreurs: [{ msg: "Une erreur est survenue, merci de réessayer." }],
      anciennesValeurs: req.body,
    });
  }
});

module.exports = router;
