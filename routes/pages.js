// routes/pages.js
const express = require('express');
const router = express.Router();
const { lireVilla } = require('../data/store');

router.get('/', (req, res) => {
  const villa = lireVilla();
  res.render('index', {
    pageTitle: villa.nom,
    pageDescription: villa.accroche,
    villa,
  });
});

router.get('/chambres', (req, res) => {
  const villa = lireVilla();
  res.render('chambres', {
    pageTitle: 'Chambres & Suites — ' + villa.nom,
    pageDescription: "Découvrez nos chambres Standard, nos Suites et notre Suite Premium.",
    villa,
  });
});

router.get('/galerie', (req, res) => {
  const villa = lireVilla();
  res.render('galerie', {
    pageTitle: 'Galerie — ' + villa.nom,
    pageDescription: "Un aperçu en images de la résidence, des chambres et des espaces communs.",
    villa,
  });
});

router.get('/contact', (req, res) => {
  const villa = lireVilla();
  const anciennesValeurs = {};

  if (req.query.hebergement) {
    if (req.query.hebergement === 'privatisation') {
      anciennesValeurs.type_hebergement = villa.privatisation.nom;
    } else {
      const trouve = villa.hebergements.find((h) => h.id === req.query.hebergement);
      if (trouve) {
        anciennesValeurs.type_hebergement = trouve.nom;
      }
    }
  }

  res.render('contact', {
    pageTitle: 'Contact & Réservation — ' + villa.nom,
    pageDescription: "Contactez-nous pour réserver votre séjour à la Résidence Habili Saly.",
    villa,
    succes: req.query.succes === '1',
    erreurs: [],
    anciennesValeurs,
  });
});

module.exports = router;
