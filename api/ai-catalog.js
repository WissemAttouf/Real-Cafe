/* ============================================================
   GET /api/ai-catalog
   Manifeste Agentic Resource Discovery (ARD)
   Sert via rewrite sur /.well-known/ai-catalog.json
   ============================================================ */

const BASE_URL = process.env.SITE_URL || 'https://grain-et-cendre-dusky.vercel.app';
const HOST = new URL(BASE_URL).host;

export default function handler(req, res){
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Cache-Control', 'public, max-age=3600');

  res.status(200).json({
    specVersion: '1.0',
    host: {
      displayName: 'Real Cafe',
      identifier: 'did:web:' + HOST,
      url: BASE_URL,
      description: 'Café de spécialité à Tunis. Grains torréfiés sur place, carte courte, terrasse ouverte sur la rue de la Casbah.',
      language: 'fr',
      region: 'TN'
    },
    entries: [
      {
        identifier: 'urn:air:' + HOST + ':site:home',
        displayName: 'Page d\'accueil Real Cafe',
        type: 'text/html',
        url: BASE_URL + '/',
        representativeQueries: [
          'café de spécialité Tunis',
          'réserver une table Tunis',
          'café torréfié sur place',
          'carte café Tunis'
        ]
      },
      {
        identifier: 'urn:air:' + HOST + ':api:reservation',
        displayName: 'API Réservation',
        type: 'application/json',
        url: BASE_URL + '/api/reservation',
        representativeQueries: [
          'réserver une table',
          'formulaire de réservation café Tunis',
          'disponibilité table Tunis'
        ]
      },
      {
        identifier: 'urn:air:' + HOST + ':api:availability',
        displayName: 'API Disponibilités',
        type: 'application/json',
        url: BASE_URL + '/api/availability',
        representativeQueries: [
          'créneaux disponibles',
          'disponibilité réservation',
          'horaires disponibles'
        ]
      },
      {
        identifier: 'urn:air:' + HOST + ':data:menu',
        displayName: 'Carte du café',
        type: 'application/json',
        url: BASE_URL + '/data/menu.json',
        representativeQueries: [
          'carte du café',
          'prix des cafés',
          'menu boissons'
        ]
      }
    ]
  });
}