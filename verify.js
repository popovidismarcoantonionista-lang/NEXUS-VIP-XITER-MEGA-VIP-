import { createClient } from '@supabase/supabase-js';

export default async function handler(req, res) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') return res.status(200).end();

    // Pega as chaves e limpa qualquer espaço invisível
    const url = (process.env.SUPABASE_URL || '').trim();
    const key = (process.env.SUPABASE_KEY || '').trim();

    if (!url || !key) {
        return res.status(200).json({ success: false, message: "ERRO: Chaves não configuradas na Vercel" });
    }

    const supabase = createClient(url, key);

    const { key: userKey, hwid } = req.query;

    try {
        const { data, error } = await supabase
            .from('keys')
            .select('*')
            .eq('key', userKey)
            .maybeSingle();

        if (error) {
            // Se der erro de API Key, ele vai retornar aqui com o erro real do Supabase
            return res.status(200).json({ success: false, message: "ERRO DE AUTENTICAÇÃO: " + error.message });
        }

        if (!data) {
            return res.status(200).json({ success: false, message: "KEY NÃO ENCONTRADA" });
        }

        // Lógica de HWID
        if (!data.hwid) {
            await supabase.from('keys').update({ hwid: hwid }).eq('key', userKey);
            return res.status(200).json({ success: true, message: "DISPOSITIVO VINCULADO" });
        }

        if (data.hwid !== hwid) {
            return res.status(200).json({ success: false, message: "KEY JÁ VINCULADA A OUTRO HWID" });
        }

        return res.status(200).json({ success: true, message: "ACESSO LIBERADO" });

    } catch (e) {
        return res.status(200).json({ success: false, message: "FALHA CRÍTICA NA API" });
    }
}
