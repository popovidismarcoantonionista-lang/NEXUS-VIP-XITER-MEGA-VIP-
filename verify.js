import { createClient } from '@supabase/supabase-js';

export default async function handler(req, res) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') return res.status(200).end();

    const { key, hwid } = req.query;

    // Limpeza rigorosa das chaves para evitar o erro de "Invalid API key"
    const supabaseUrl = process.env.SUPABASE_URL?.trim().replace(/\/$/, "");
    const supabaseKey = process.env.SUPABASE_KEY?.trim();

    if (!supabaseUrl || !supabaseKey) {
        return res.status(200).json({ success: false, message: "ERRO: CHAVES NÃO CONFIGURADAS!" });
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

    try {
        const { data: license, error } = await supabase
            .from('keys')
            .select('*')
            .eq('key', key)
            .maybeSingle();

        if (error) {
            return res.status(200).json({ success: false, message: "ERRO NO BANCO: " + error.message });
        }

        if (!license) {
            return res.status(200).json({ success: false, message: "KEY NÃO ENCONTRADA!" });
        }

        // Validação de expiração
        if (license.expira_em && new Date(license.expira_em) < new Date()) {
            return res.status(200).json({ success: false, message: "ESTA KEY JÁ EXPIROU!" });
        }

        // Registro de HWID
        if (!license.hwid) {
            await supabase.from('keys').update({ hwid: hwid }).eq('key', key);
            return res.status(200).json({ success: true, message: "DISPOSITIVO VINCULADO!" });
        }

        if (license.hwid !== hwid) {
            return res.status(200).json({ success: false, message: "KEY EM USO EM OUTRO CELULAR!" });
        }

        return res.status(200).json({ success: true, message: "ACESSO LIBERADO!" });

    } catch (err) {
        return res.status(200).json({ success: false, message: "FALHA CRÍTICA NA API" });
    }
}
