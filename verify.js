import { createClient } from '@supabase/supabase-js';

export default async function handler(req, res) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') return res.status(200).end();

    // COLOQUE SEUS DADOS REAIS AQUI PARA TESTAR:
    const URL_DIRETA = "https://qudbsaujvnvwoybxarhp.supabase.co";
    const KEY_DIRETA = "sb_secret_DbBG0Q4gXns-95PseLRvmg_3umCJFEq"; 

    const supabase = createClient(URL_DIRETA, KEY_DIRETA);
    const { key, hwid } = req.query;

    try {
        const { data: license, error } = await supabase
            .from('keys')
            .select('*')
            .eq('key', key)
            .maybeSingle();

        if (error) {
            return res.status(200).json({ success: false, message: "ERRO SUPABASE: " + error.message });
        }

        if (!license) {
            return res.status(200).json({ success: false, message: "KEY NAO ENCONTRADA" });
        }

        if (!license.hwid) {
            await supabase.from('keys').update({ hwid: hwid }).eq('key', key);
            return res.status(200).json({ success: true, message: "VINCULADO!" });
        }

        if (license.hwid !== hwid) {
            return res.status(200).json({ success: false, message: "HWID INVALIDO" });
        }

        return res.status(200).json({ success: true, message: "ACESSO LIBERADO" });

    } catch (err) {
        return res.status(200).json({ success: false, message: "ERRO CRITICO" });
    }
}
