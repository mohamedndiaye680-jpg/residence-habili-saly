# Résidence Habili Saly — Site web dynamique

Site web dynamique (Node.js + Express + EJS) pour la Résidence Habili Saly,
un établissement d'hébergement situé à Saly Joseph, derrière Diambars (Sénégal).

## 1. Installation

Prérequis : **Node.js >= 18**.

```bash
npm install
npm start
```

Le site est alors accessible sur : **http://localhost:3000**

Pour le développement (redémarrage automatique à chaque modification) :
```bash
npm run dev
```

## 2. Arborescence

```
/
├── server.js                # Point d'entrée Express
├── package.json
├── data/
│   ├── villa.json           # Source unique de vérité : toutes les infos affichées
│   ├── messages.json        # Demandes reçues via le formulaire de contact
│   └── store.js             # Petite couche d'accès aux données (lecture/écriture JSON)
├── routes/
│   ├── pages.js              # Routes des pages rendues (/, /chambres, /galerie, /contact)
│   └── api.js                 # Routes API JSON (/api/villa, /api/rooms, /api/gallery, POST /api/contact)
├── views/
│   ├── partials/header.ejs, footer.ejs
│   └── index.ejs, chambres.ejs, galerie.ejs, contact.ejs, 404.ejs
└── public/
    ├── css/style.css          # CSS custom (pas de framework)
    ├── js/main.js              # JS vanilla (menu mobile, lightbox, formulaire AJAX)
    └── images/villa/ + images/rooms/   # Vraies photos de la résidence
```

## 3. Modifier les informations affichées sur le site

**Toutes** les données visibles sur le site (tarifs, nombre de chambres,
coordonnées, description, photos de la galerie...) proviennent d'un seul
fichier : **`data/villa.json`**.

Pour changer un prix, une description ou ajouter une photo à la galerie,
il suffit de modifier ce fichier — aucune ligne de code à toucher.
Exemple : changer le tarif d'une Suite :

```json
{
  "id": "suite",
  "nom": "Suite",
  "tarif": 35000,   <-- modifier ici
  ...
}
```

Pour ajouter une photo à la galerie, ajouter une entrée dans le tableau
`galerie` du même fichier, en pointant vers une image placée dans
`public/images/villa/` ou `public/images/rooms/`.

## 4. Pages du site

| Route | Description |
|---|---|
| `/` | Accueil — hero, statistiques, aperçu des hébergements et prestations |
| `/chambres` | Détail de chaque type d'hébergement + bloc "Privatisation complète" |
| `/galerie` | Grille de photos avec lightbox (agrandissement au clic) |
| `/contact` | Formulaire de contact / réservation |

## 5. API JSON

| Route | Méthode | Description |
|---|---|---|
| `/api/villa` | GET | Informations générales de la résidence |
| `/api/rooms` | GET | Liste des types de chambres, tarifs et la privatisation |
| `/api/gallery` | GET | Liste des photos de la galerie |
| `/api/contact` | POST | Réception d'une demande (voir ci-dessous) |

### Formulaire de contact — comportement à deux niveaux

Le formulaire de `/contact` fonctionne **avec et sans JavaScript** :

- **Avec JS** (comportement par défaut) : le formulaire est envoyé en AJAX vers
  `POST /api/contact` avec l'en-tête `Accept: application/json`. La réponse
  (succès ou erreurs de validation) est affichée directement sur la page,
  sans rechargement.
- **Sans JS** : le `<form>` a un `action="/api/contact"` et une `method="POST"`
  classiques. Le serveur détecte alors l'en-tête `Accept: text/html` du
  navigateur et répond par une redirection vers `/contact?succes=1`
  (ou réaffiche le formulaire avec les erreurs en cas de problème de
  validation).

La validation des champs (nom, téléphone, email, type d'hébergement, message)
est faite côté serveur avec `express-validator`, donc fiable même si le
JavaScript du client a été désactivé ou contourné.

Les demandes reçues sont stockées dans `data/messages.json` (à remplacer par
une vraie base de données en production — voir section Évolutions).

## 6. Choix techniques

- **Pas de framework CSS** : la palette (terracotta, sable, océan) est reprise
  directement de la façade réelle de la résidence et de ses photos.
- **Polices** : Playfair Display (titres) + Mulish (texte), chargées via
  Google Fonts.
- **JS vanilla**, sans dépendance de build : menu mobile, lightbox de galerie,
  et amélioration progressive du formulaire de contact.
- **Accessibilité** : lien d'évitement vers le contenu principal, focus
  clavier visible (`:focus-visible`), respect de `prefers-reduced-motion`,
  attributs ARIA sur le menu mobile et la lightbox.
- **Responsive** : mobile, tablette, desktop — menu mobile en panneau
  latéral avec fermeture au clic/Échap.

## 7. Évolutions possibles (hors périmètre de cette V1)

- Calendrier de disponibilité et paiement en ligne (Wave, Orange Money, carte).
- Panneau d'administration pour éditer `villa.json` sans toucher au code.
- Envoi d'un email de confirmation (Nodemailer) à chaque nouvelle demande.
- Version multilingue (FR/EN) pour la clientèle internationale de Saly.
- Migration de `messages.json` / `villa.json` vers une vraie base de données
  (MongoDB, PostgreSQL ou SQLite).

## 8. Informations de la résidence (rappel)

- **Adresse** : Saly Joseph, derrière Diambars (Sénégal)
- **Téléphones** : 78 958 12 08 / 77 572 73 94 / 77 332 67 23
- **Email** : residencehabilisaly@gmail.com
- **Localisation** : https://maps.google.com/?q=14.450926,-17.002497
