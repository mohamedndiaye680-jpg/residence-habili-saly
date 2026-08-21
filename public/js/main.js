// public/js/main.js
// JavaScript vanilla — progressive enhancement.
// Le site fonctionne sans JS (navigation classique, formulaire en POST classique) ;
// ce script vient simplement améliorer l'expérience quand JS est disponible.

document.addEventListener('DOMContentLoaded', function () {
    initMenuMobile();
    initLightbox();
    initFormulaireContact();
});

/* ---------------------------------------------------------
   Menu mobile
--------------------------------------------------------- */
function initMenuMobile() {
    var bouton = document.getElementById('boutonMenu');
    var nav = document.getElementById('navPrincipale');
    if (!bouton || !nav) return;

    bouton.addEventListener('click', function () {
        var ouvert = nav.classList.toggle('ouvert');
        bouton.setAttribute('aria-expanded', ouvert ? 'true' : 'false');
    });

    // Fermer le menu si on clique sur un lien (utile en navigation one-page mobile)
    nav.querySelectorAll('a').forEach(function (lien) {
        lien.addEventListener('click', function () {
            nav.classList.remove('ouvert');
            bouton.setAttribute('aria-expanded', 'false');
        });
    });

    // Fermer avec Échap
    document.addEventListener('keydown', function (e) {
        if (e.key === 'Escape' && nav.classList.contains('ouvert')) {
            nav.classList.remove('ouvert');
            bouton.setAttribute('aria-expanded', 'false');
            bouton.focus();
        }
    });
}

/* ---------------------------------------------------------
   Lightbox galerie
--------------------------------------------------------- */
function initLightbox() {
    var grille = document.getElementById('grilleGalerie');
    var lightbox = document.getElementById('lightbox');
    if (!grille || !lightbox) return;

    var photos = window.GALERIE_PHOTOS || [];
    var indexActuel = 0;

    var image = document.getElementById('lightboxImage');
    var legende = document.getElementById('lightboxLegende');
    var boutonFermer = document.getElementById('lightboxFermer');
    var boutonPrecedent = document.getElementById('lightboxPrecedent');
    var boutonSuivant = document.getElementById('lightboxSuivant');

    function ouvrir(index) {
        indexActuel = index;
        afficherPhoto();
        lightbox.classList.add('actif');
        lightbox.setAttribute('aria-hidden', 'false');
        boutonFermer.focus();
        document.body.style.overflow = 'hidden';
    }

    function fermer() {
        lightbox.classList.remove('actif');
        lightbox.setAttribute('aria-hidden', 'true');
        document.body.style.overflow = '';
    }

    function afficherPhoto() {
        var photo = photos[indexActuel];
        if (!photo) return;
        image.src = photo.src;
        image.alt = photo.legende;
        legende.textContent = photo.legende;
    }

    function suivante() {
        indexActuel = (indexActuel + 1) % photos.length;
        afficherPhoto();
    }

    function precedente() {
        indexActuel = (indexActuel - 1 + photos.length) % photos.length;
        afficherPhoto();
    }

    grille.querySelectorAll('.grille-galerie__item').forEach(function (item) {
        item.addEventListener('click', function () {
            ouvrir(parseInt(item.getAttribute('data-index'), 10));
        });
    });

    boutonFermer.addEventListener('click', fermer);
    boutonSuivant.addEventListener('click', suivante);
    boutonPrecedent.addEventListener('click', precedente);

    lightbox.addEventListener('click', function (e) {
        if (e.target === lightbox) fermer();
    });

    document.addEventListener('keydown', function (e) {
        if (!lightbox.classList.contains('actif')) return;
        if (e.key === 'Escape') fermer();
        if (e.key === 'ArrowRight') suivante();
        if (e.key === 'ArrowLeft') precedente();
    });
}

/* ---------------------------------------------------------
   Formulaire de contact — envoi en AJAX
   (repli HTML classique déjà géré nativement par le <form>
   si ce script ne s'exécute pas, grâce à action="/api/contact")
--------------------------------------------------------- */
function initFormulaireContact() {
    var form = document.getElementById('formulaireContact');
    if (!form) return;

    form.addEventListener('submit', function (e) {
        e.preventDefault();

        var boutonEnvoi = form.querySelector('button[type="submit"]');
        var libelleInitial = boutonEnvoi.textContent;
        boutonEnvoi.disabled = true;
        boutonEnvoi.textContent = 'Envoi en cours...';

        // On retire les anciens messages d'erreur affichés côté serveur
        var ancienneAlerteErreur = form.parentElement.querySelector('.alerte--erreur');
        if (ancienneAlerteErreur) ancienneAlerteErreur.remove();

        var donnees = new FormData(form);
        var params = new URLSearchParams();
        donnees.forEach(function (valeur, cle) { params.append(cle, valeur); });

        fetch(form.getAttribute('action'), {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                'Accept': 'application/json',
            },
            body: params.toString(),
        })
            .then(function (reponse) {
                return reponse.json().then(function (data) {
                    return { statut: reponse.status, data: data };
                });
            })
            .then(function (resultat) {
                if (resultat.data.success) {
                    afficherSucces();
                    form.reset();
                } else {
                    afficherErreurs(resultat.data.errors || []);
                }
            })
            .catch(function () {
                afficherErreurs([{ msg: "Une erreur réseau est survenue. Vous pouvez aussi nous appeler directement." }]);
            })
            .finally(function () {
                boutonEnvoi.disabled = false;
                boutonEnvoi.textContent = libelleInitial;
            });
    });

    function afficherSucces() {
        var alerte = document.getElementById('alerteSucces');
        if (alerte) {
            alerte.hidden = false;
            alerte.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
    }

    function afficherErreurs(erreurs) {
        var conteneur = document.createElement('div');
        conteneur.className = 'alerte alerte--erreur';
        var liste = document.createElement('ul');
        erreurs.forEach(function (erreur) {
            var li = document.createElement('li');
            li.textContent = erreur.msg;
            liste.appendChild(li);
        });
        conteneur.appendChild(liste);
        form.parentElement.insertBefore(conteneur, form);
        conteneur.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
}
