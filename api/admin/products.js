/* ============================================================
   /api/admin/products
   GET    → liste tous les produits (actifs + inactifs)
   POST   → crée un produit
   PATCH  → modifie un produit (?id=xxx)
   DELETE → supprime un produit (?id=xxx)
   ============================================================ */
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  { auth: { persistSession: false } }
);

const VALID_ROASTS = ['clair', 'moyen', 'fonce'];

function checkAuth(req){
  const auth = req.headers.authorization || '';
  const token = auth.startsWith('Bearer ') ? auth.slice(7) : '';
  return token && process.env.ADMIN_PASSWORD && token === process.env.ADMIN_PASSWORD;
}

function sanitize(data){
  return {
    slug: String(data.slug || '').trim().toLowerCase().replace(/[^a-z0-9-]/g, '-'),
    name: String(data.name || '').trim(),
    origin: data.origin ? String(data.origin).trim() : null,
    description: data.description ? String(data.description).trim() : null,
    roast_level: data.roast_level || null,
    notes: Array.isArray(data.notes) ? data.notes.map(n => String(n).trim()).filter(Boolean) : [],
    image_url: data.image_url ? String(data.image_url).trim() : null,
    price_250g: Number(data.price_250g) || 0,
    price_500g: data.price_500g ? Number(data.price_500g) : null,
    price_1kg: data.price_1kg ? Number(data.price_1kg) : null,
    stock: Number.isInteger(data.stock) ? data.stock : 0,
    active: data.active === false ? false : true,
    featured: data.featured === true
  };
}

function validate(item){
  if (!item.slug || item.slug.length < 2) return 'Slug invalide.';
  if (!item.name || item.name.length < 2) return 'Nom requis.';
  if (item.roast_level && !VALID_ROASTS.includes(item.roast_level)) return 'Torréfaction invalide.';
  if (item.price_250g <= 0) return 'Prix 250g requis et > 0.';
  return null;
}

export default async function handler(req, res){
  if (!checkAuth(req)){
    return res.status(401).json({ error: 'Non autorisé.' });
  }

  const { id } = req.query;

  try {
    // GET — liste
    if (req.method === 'GET'){
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return res.status(200).json({ products: data || [] });
    }

    // POST — création
    if (req.method === 'POST'){
      const item = sanitize(req.body || {});
      const err = validate(item);
      if (err) return res.status(400).json({ error: err });

      const { data, error } = await supabase
        .from('products')
        .insert(item)
        .select()
        .single();
      if (error) throw error;
      return res.status(200).json({ ok: true, product: data });
    }

    // PATCH — modification
    if (req.method === 'PATCH'){
      if (!id) return res.status(400).json({ error: 'ID manquant.' });
      const item = sanitize(req.body || {});
      const err = validate(item);
      if (err) return res.status(400).json({ error: err });

      const { data, error } = await supabase
        .from('products')
        .update(item)
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      return res.status(200).json({ ok: true, product: data });
    }

    // DELETE
    if (req.method === 'DELETE'){
      if (!id) return res.status(400).json({ error: 'ID manquant.' });
      const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', id);
      if (error) throw error;
      return res.status(200).json({ ok: true });
    }

    return res.status(405).json({ error: 'Méthode non autorisée.' });
  } catch (err){
    console.error('[admin/products] Erreur:', err);
    return res.status(500).json({ error: err.message || 'Erreur serveur.' });
  }
}