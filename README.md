# Real Café — Expérience numérique pour un café de spécialité

Site web responsive conçu pour une marque de café de spécialité à Tunis. Le projet associe une présentation éditoriale, un menu interactif, des parcours de réservation, une boutique en ligne et un espace d’administration.

<p align="center">
  <a href="https://grain-et-cendre-dusky.vercel.app/"><strong>Voir la démonstration</strong></a>
  ·
  <a href="https://github.com/WissemAttouf/Real-Cafe"><strong>Consulter le code source</strong></a>
</p>

## Présentation

Real Café est un concept de site web pensé autour de visuels soignés, de la découverte du café et de parcours clients simples. Les visiteurs peuvent explorer la carte, découvrir les origines et méthodes de préparation du café, effectuer une réservation et parcourir une boutique en ligne.

Le frontend s’appuie sur des pages web et des modules JavaScript. Des fonctions côté serveur sont prévues via les API Vercel, avec Supabase pour la persistance et Resend pour les e-mails transactionnels selon la configuration du projet.

## Fonctionnalités

### Parcours client
- Site responsive présentant l’histoire du café, la carte et les origines du café.
- Menu interactif basé sur des données structurées.
- Informations sur les cafés, leur torréfaction et les méthodes d’extraction.
- Formulaire de réservation avec sélection de date et de créneau, validation et confirmation.
- Boutique avec fiches produits, panier et pages de commande.
- Contenus en français et en arabe.
- Ressources de Progressive Web App et navigation mobile adaptée.
- Animations et effets visuels au défilement.

### Administration et services
- Pages d’administration pour le suivi des réservations, commandes et produits.
- Routes API pour les disponibilités, réservations, produits et commandes.
- Intégration Supabase pour les données.
- Intégration Resend pour les e-mails.
- Validation des requêtes et mécanismes anti-abus configurés.
- En-têtes HTTP et politique de sécurité du contenu dans la configuration Vercel.

### Qualité et visibilité
- Tests navigateur avec Playwright.
- Intégration Sentry côté navigateur.
- Fichiers SEO, dont `robots.txt` et `sitemap.xml`.

## Technologies

| Domaine | Technologies |
|---|---|
| Frontend | HTML5, CSS3, JavaScript moderne (ES modules) |
| API | Fonctions Vercel, Node.js |
| Base de données | Supabase |
| E-mails | Resend |
| Suivi d’erreurs | Sentry |
| Tests navigateur | Playwright |
| Hébergement | Vercel |

## Aperçu visuel

Le dépôt contient des images de l’expérience dans `assets/`, notamment des visuels de comptoir, de grains, de torréfaction et de terrasse.

## Installation locale

### Prérequis
- Node.js et npm
- Git
- Comptes et paramètres de services externes uniquement si vous souhaitez tester les fonctionnalités qui les utilisent

### Étapes

```bash
git clone https://github.com/WissemAttouf/Real-Cafe.git
cd Real-Cafe
npm install
```

Consultez `package.json` pour les scripts disponibles. Configurez les variables d’environnement nécessaires à Supabase, Resend et aux autres intégrations avant de tester les fonctions correspondantes. Ne publiez jamais les clés secrètes.

## Tests

Si les dépendances de test sont installées, lancez les scripts Playwright définis dans `package.json`. Les tests et les services externes peuvent nécessiter une configuration locale spécifique.

## Démonstration

- **Site en ligne :** [grain-et-cendre-dusky.vercel.app](https://grain-et-cendre-dusky.vercel.app/)
- **Code source :** [WissemAttouf/Real-Cafe](https://github.com/WissemAttouf/Real-Cafe)


## Aperçu visuel

<p align="center">
  <img src="assets/og-cover.jpg" alt="Visuel de couverture — Real-Cafe" width="800">
  <br><strong>Visuel de couverture</strong>
  <br><em>Image de présentation utilisée pour illustrer le projet et ses aperçus de partage.</em>
</p>

---

## Auteur

**Wissem Attouf** — Ingénieur logiciel | Développeur Full Stack  
[GitHub](https://github.com/WissemAttouf) · [LinkedIn](https://www.linkedin.com/in/wissem-attouf-452509226/) · [Portfolio](https://wissem-portfolio.vercel.app/) · [E-mail](mailto:wattouf35@gmail.com)


---
