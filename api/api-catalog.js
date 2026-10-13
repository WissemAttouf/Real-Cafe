/* ============================================================
   GET /api/api-catalog
   API Catalog au format RFC 9727 (linkset+json)
   Sert via rewrite sur /.well-known/api-catalog
   ============================================================ */

const BASE_URL = process.env.SITE_URL || 'https://grain-et-cendre-dusky.vercel.app';

export default function handler(req, res){
  res.setHeader('Content-Type', 'application/linkset+json; charset=utf-8');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Cache-Control', 'public, max-age=3600');

  const linkset = [
    {
      anchor: BASE_URL + '/',
      item: [
        { href: BASE_URL + '/', rel: 'alternate', type: 'text/html' },
        { href: BASE_URL + '/api/ai-catalog', rel: 'service-desc', type: 'application/json' }
      ]
    },
    {
      anchor: BASE_URL + '/api/reservation',
      item: [
        { href: BASE_URL + '/api/reservation', rel: 'service', type: 'application/json' },
        { href: BASE_URL + '/api/ai-catalog', rel: 'service-desc', type: 'application/json' }
      ]
    },
    {
      anchor: BASE_URL + '/api/availability',
      item: [
        { href: BASE_URL + '/api/availability', rel: 'service', type: 'application/json' },
        { href: BASE_URL + '/api/ai-catalog', rel: 'service-desc', type: 'application/json' }
      ]
    },
    {
      anchor: BASE_URL + '/data/menu.json',
      item: [
        { href: BASE_URL + '/data/menu.json', rel: 'service', type: 'application/json' }
      ]
    }
  ];

  res.status(200).json({ linkset });
}