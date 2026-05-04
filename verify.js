import { createClient } from '@supabase/supabase-js';

export default async function handler(req, res) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') return res.status(200).end();

    const { key, hwid } = req.query;
    
    // Conexão limpa com o Supabase
    const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

    try {
        // Tentativa de busca na tabela 'keys'
        const { data: license, error } = await supabase
            .from('keys') 
            .select('*')
            .eq('key', key)
            .maybeSingle();

        if (error) {
            // Isso vai nos dizer se o erro é o nome da tabela (PGRST125)
            return res.status(200).json({ 
                success: false, 
                message: "ERRO DE ROTA: " + error.message 
            });
        }

        if (!license) {
            return res.status(200).json({ success: false, message: "KEY INVÁLIDA!" });
        }

        // Validação de HWID
        if (!license.hwid || license.hwid === "") {
            await supabase.from('keys').update({ hwid: hwid }).eq('key', key);
            return res.status(200).json({ success: true, message: "DISPOSITIVO VINCULADO!" });
        }

        if (license.hwid !== hwid) {
            return res.status(200).json({ success: false, message: "ESTA KEY JÁ POSSUI DONO!" });
        }

        return res.status(200).json({ success: true, message: "ACESSO LIBERADO!" });

    } catch (err) {
        return res.status(200).json({ success: false, message: "FALHA GERAL: " + err.message });
    }
}
