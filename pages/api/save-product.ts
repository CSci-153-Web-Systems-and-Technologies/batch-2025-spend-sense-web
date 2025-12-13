import { NextApiRequest, NextApiResponse } from 'next';
import { createClient } from '@/utils/supabase/server';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { barcode, name, price, category } = req.body;
  if (!barcode || !name || !price || !category) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return res.status(401).json({ error: 'Not authenticated' });
    }
    const { error } = await supabase
      .from('products')
      .upsert({
        user_id: user.id,
        barcode,
        name,
        price,
        category,
        updated_at: new Date().toISOString(),
      }, { onConflict: 'user_id,barcode' });
    if (error) {
      return res.status(500).json({ error: error.message });
    }
    return res.status(200).json({ success: true });
  } catch (err: any) {
    return res.status(500).json({ error: err.message || 'Unknown error' });
  }
}
