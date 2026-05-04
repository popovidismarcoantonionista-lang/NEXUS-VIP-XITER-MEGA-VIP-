import { createClient } from '@supabase/supabase-js';

export default async function handler(req, res) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') return res.status(200).end();

    const { key, hwid } = req.query;

    // Limpeza manual para garantir que a chave não vá com espaços ou quebras de linha
    const supabaseUrl = process.env.SUPABASE_URL?.trim();
    const supabaseKey = process.env.SUPABASE_KEY?.trim();

    if (!supabaseUrl || !supabaseKey) {
        return res.status(200).json({ success: false, message: "ERRO: Chaves não configuradas na Vercel!" });
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

    try {
        const { data: license, error } = await supabase
            .from('keys')
            .select('*')
            .eq('key', key)
            .maybeSingle();

        if (error) {
            return res.status(200).json({ success: false, message: "ERRO DE API: " + error.message });
        }

        if (!license) {
            return res.status(200).json({ success: false, message: "KEY NÃO ENCONTRADA!" });
        }

        // Se a key for válida, mas o HWID estiver vazio, vincula agora
        if (!license.hwid) {
            await supabase.from('keys').update({ hwid: hwid }).eq('key', key);
            return res.status(200).json({ success: true, message: "VINCULADO COM SUCESSO!" });
        }

        if (license.hwid !== hwid) {
            return res.status(200).json({ success: false, message: "DISPOSITIVO INVÁLIDO!" });
        }

        return res.status(200).json({ success: true, message: "ACESSO LIBERADO!" });

    } catch (err) {
        return res.status(200).json({ success: false, message: "FALHA NA AUTENTICAÇÃO" });
    }
}
