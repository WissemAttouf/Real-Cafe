/* ============================================================
   Stockage — Supabase
   ============================================================ */
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  { auth: { persistSession: false } }
);

export async function saveReservation(data){
  const { data: row, error } = await supabase
    .from('reservations')
    .insert({
      name: data.name,
      phone: data.phone,
      date: data.date,
      time: data.time,
      guests: data.guests,
      message: data.message || null,
      status: 'pending'
    })
    .select()
    .single();

  if (error) throw new Error(`Supabase insert: ${error.message}`);
  return row;
}

export async function listReservations({ from, to, status } = {}){
  let query = supabase
    .from('reservations')
    .select('*')
    .order('date', { ascending: true })
    .order('time', { ascending: true });

  if (from) query = query.gte('date', from);
  if (to) query = query.lte('date', to);
  if (status) query = query.eq('status', status);

  const { data, error } = await query;
  if (error) throw new Error(`Supabase select: ${error.message}`);
  return data;
}
export { supabase };