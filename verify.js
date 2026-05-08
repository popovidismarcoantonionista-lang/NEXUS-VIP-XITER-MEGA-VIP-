import { createClient } from '@supabase/supabase-js';

export default async function handler(req, res) {
    // ESSENCIAL PARA EVITAR "FALHA NA CONEXÃO" (CORS)
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') return res.status(200).end();

    const { key, hwid } = req.query;
    const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

    try {
        const { data, error } = await supabase.from('licencas').select('*').eq('key', key).single();

        if (error || !data) return res.json({ success: false, message: "Key não existe" });

        if (data.hwid && data.hwid !== hwid) return res.json({ success: false, message: "HWID incompatível" });

        if (!data.hwid) {
            await supabase.from('licencas').update({ hwid: hwid }).eq('key', key);
        }

        return res.json({ success: true, message: "Acesso Liberado" });
    } catch (err) {
        return res.json({ success: false, message: "Erro de servidor" });
    }
}
