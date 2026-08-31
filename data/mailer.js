// data/mailer.js
// Envoi d'un email de notification à chaque nouvelle demande de réservation.
// Utilise Gmail via nodemailer. Nécessite deux variables d'environnement :
//   GMAIL_USER  -> l'adresse Gmail qui envoie ET reçoit la notification
//   GMAIL_PASS  -> un "mot de passe d'application" Gmail (PAS le mot de passe normal)
//
// Comment obtenir un mot de passe d'application Gmail :
// 1. Aller sur https://myaccount.google.com/security
// 2. Activer la validation en 2 étapes si ce n'est pas déjà fait
// 3. Aller sur https://myaccount.google.com/apppasswords
// 4. Créer un mot de passe d'application pour "Mail", le copier dans GMAIL_PASS

const nodemailer = require('nodemailer');

function creerTransporteur() {
  const user = process.env.GMAIL_USER;
  const pass = process.env.GMAIL_PASS;

  if (!user || !pass) {
    console.warn(
      '⚠️  GMAIL_USER / GMAIL_PASS non définies. Les emails de notification sont désactivés.'
    );
    return null;
  }

  return nodemailer.createTransport({
    service: 'gmail',
    auth: { user, pass },
  });
}

const transporteur = creerTransporteur();

async function envoyerNotificationReservation(demande) {
  if (!transporteur) return;

  const destinataire = process.env.GMAIL_USER;

  const texte = `Nouvelle demande de réservation reçue sur le site Résidence Habili Saly :

Nom : ${demande.nom}
Téléphone : ${demande.telephone}
Email : ${demande.email || 'non renseigné'}
Type d'hébergement souhaité : ${demande.typeHebergement}

Message :
${demande.message}

---
Consultez toutes les demandes sur : ${process.env.SITE_URL || ''}/admin
`;

  try {
    await transporteur.sendMail({
      from: `"Résidence Habili Saly — Site web" <${destinataire}>`,
      to: destinataire,
      subject: `Nouvelle demande de réservation — ${demande.nom}`,
      text: texte,
    });
  } catch (err) {
    // On ne bloque jamais la réponse au visiteur si l'email échoue.
    console.error("❌ Échec de l'envoi de l'email de notification :", err.message);
  }
}

function formaterDate(date) {
  return new Date(date).toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' });
}

async function envoyerConfirmationClient(demande) {
  if (!transporteur) return;
  if (!demande.email) {
    console.warn('⚠️  Impossible d\'envoyer la confirmation : aucune adresse email fournie par le client.');
    return;
  }

  const expediteur = process.env.GMAIL_USER;

  const texte = `Bonjour ${demande.nom},

Bonne nouvelle : votre demande de réservation à la Résidence Habili Saly a été validée !

Séjour : du ${formaterDate(demande.dateArrivee)} au ${formaterDate(demande.dateDepart)}
Type d'hébergement : ${demande.typeHebergement}

Pour finaliser votre réservation, merci d'effectuer le règlement via Wave Business.
Un lien de paiement Wave vous sera transmis séparément si ce n'est pas déjà fait.
Délai de paiement : 48h.

À très bientôt,
L'équipe de la Résidence Habili Saly
`;

  try {
    await transporteur.sendMail({
      from: `"Résidence Habili Saly" <${expediteur}>`,
      to: demande.email,
      subject: 'Votre réservation à la Résidence Habili Saly est confirmée',
      text: texte,
    });
  } catch (err) {
    console.error("❌ Échec de l'envoi de l'email de confirmation au client :", err.message);
  }
}

module.exports = { envoyerNotificationReservation, envoyerConfirmationClient };
