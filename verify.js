import { createClient } from '@supabase/supabase-js';

export default async function handler(req, res) {
    // RESOLVE O ERRO DE CONEXÃO (CORS)
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') return res.status(200).end();

    const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);
    const { key, hwid } = req.query;

    try {
        const { data: license, error } = await supabase
            .from('keys') // Nome da tabela conforme seu print
            .select('*')
            .eq('key', key)
            .maybeSingle();

        if (error || !license) {
            return res.status(200).json({ success: false, message: "Key Inválida!" });
        }

        if (!license.hwid) {
            await supabase.from('keys').update({ hwid: hwid }).eq('key', key);
            return res.status(200).json({ success: true, message: "Vinculado!" });
        }

        if (license.hwid !== hwid) {
            return res.status(200).json({ success: false, message: "Key em uso em outro celular!" });
        }

        return res.status(200).json({ success: true });
    } catch (e) {
        return res.status(500).json({ success: false, message: "Erro de servidor" });
    }
}
