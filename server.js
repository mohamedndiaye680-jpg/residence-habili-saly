// server.js
require('dotenv').config();

const express = require('express');
const path = require('path');
const session = require('express-session');
const MongoStore = require('connect-mongo').default || require('connect-mongo');

const pagesRouter = require('./routes/pages');
const apiRouter = require('./routes/api');
const adminRouter = require('./routes/admin');
const { lireVilla } = require('./data/store');
const { connecterMongo } = require('./data/db');

const app = express();
const PORT = process.env.PORT || 3000;

// --- Connexion à la base de données ---
connecterMongo();

// --- Configuration du moteur de vues ---
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// --- Middlewares ---
app.use(express.json());
app.use(express.urlencoded({ extended: true })); // nécessaire pour le repli HTML du formulaire
app.use(express.static(path.join(__dirname, 'public')));

app.use(
  session({
    secret: process.env.SESSION_SECRET || 'residence-habili-saly-cle-secrete',
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({ mongoUrl: process.env.MONGODB_URI }),
    cookie: { maxAge: 1000 * 60 * 60 * 8 }, // 8 heures
  })
);

// Rend les infos générales de la résidence disponibles dans toutes les vues
// (nom, téléphone, email...) sans avoir à les repasser à chaque render().
app.use((req, res, next) => {
  const villa = lireVilla();
  res.locals.villa = villa;
  res.locals.currentPath = req.path;
  res.locals.pageTitle = villa.nom;
  res.locals.pageDescription = villa.accroche;
  next();
});

// --- Routes ---
app.use('/api', apiRouter);
app.use('/admin', adminRouter);
app.use('/', pagesRouter);

// --- 404 ---
app.use((req, res) => {
  res.status(404).render('404');
});

// --- Gestion d'erreurs générique ---
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).send("Une erreur interne est survenue. Merci de réessayer un peu plus tard.");
});

app.listen(PORT, () => {
  console.log(`Résidence Habili Saly — serveur démarré sur http://localhost:${PORT}`);
});
