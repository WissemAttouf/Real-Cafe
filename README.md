# Real Cafe — Site vitrine

Site vitrine du café de spécialité Real Cafe, Tunis.

## Structure

- `index.html` — page unique, sémantique
- `styles.css` — feuille de styles unique, variables CSS
- `main.js` — script unique, modules IIFE
- `data/menu.json` — carte du café (éditable sans toucher au HTML)
- `data/roast.json` — origine en torréfaction cette semaine
- `assets/fonts/` — polices auto-hébergées (Fraunces, Inter, Amiri)

## Éditer la carte

Modifier `data/menu.json`. Les items avec `"interactive": true`
ouvrent le panneau quick-view au clic.

## Éditer l'origine de la semaine

Modifier `data/roast.json`.

## Polices

Les fichiers `.woff2` doivent être placés dans `assets/fonts/` :

- `fraunces-variable.woff2` (variable, 400–650)
- `inter-variable.woff2` (variable, 400–600)
- `amiri-regular.woff2` (400)

À télécharger sur Google Fonts (bouton « Download family »),
puis extraire les `.woff2` nécessaires.

## Déploiement

Site statique : peut être déployé tel quel sur Vercel, Netlify
ou Cloudflare Pages. Aucune étape de build nécessaire.

## Étapes suivantes

- Étape 5 : API de réservation (serverless function)
- Étape 6 : Astro + CI GitHub Actions + en-têtes de sécurité
## Back-office

Accessible sur `/admin`. Mot de passe défini dans `ADMIN_PASSWORD`.

L'API `GET /api/admin/reservations` attend un header
`Authorization: Bearer <ADMIN_PASSWORD>`.

## Variables d'environnement

Voir `.env.example`. En production, les définir dans
Vercel → Settings → Environment Variables.

## Base de données

Supabase. Schéma dans `supabase/schema.sql`.

## Emails

Resend. Nécessite un domaine vérifié pour envoyer depuis
`reservation@realcafe.tn`. En développement, Resend
accepte `onboarding@resend.dev` mais uniquement vers
l'adresse du compte Resend.

## Sécurité

- Validation serveur dans `lib/validate.js` (ne jamais faire confiance au client)
- Honeypot `website` : si rempli, on répond `ok` sans rien faire
- Rate-limit en mémoire (5/heure par IP, 200/heure global)
  → à remplacer par Upstash Redis si plusieurs instances
- Headers de sécurité dans `vercel.json` (CSP, X-Frame-Options, etc.)