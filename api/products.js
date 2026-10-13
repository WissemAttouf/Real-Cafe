/* ============================================================
   GET /api/products
   Liste publique des produits actifs
   ============================================================ */
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  { auth: { persistSession: false } }
);

export default async function handler(req, res){
  if (req.method !== 'GET'){
    return res.status(405).json({ error: 'Méthode non autorisée.' });
  }

  res.setHeader('Cache-Control', 'public, max-age=300');

  try {
    const { data, error } = await supabase
      .from('products')
      .select('id, slug, name, origin, description, roast_level, notes, image_url, price_250g, price_500g, price_1kg, stock, featured')
      .eq('active', true)
      .order('featured', { ascending: false })
      .order('name', { ascending: true });

    if (error) throw error;

    return res.status(200).json({ products: data || [] });
  } catch (err){
    console.error('[products] Erreur:', err);
    return res.status(500).json({ error: 'Erreur serveur.' });
  }
}