import { createClient } from '@supabase/supabase-js';

export default async function handler(req, res) {
    // Configurações de CORS para permitir que o GitHub Pages acesse a API
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') return res.status(200).end();

    const { key, hwid } = req.query;
    const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

    try {
        // Busca a licença na tabela 'keys'
        const { data: license, error } = await supabase
            .from('keys') 
            .select('*')
            .eq('key', key)
            .maybeSingle();

        if (error) throw error;

        if (!license) {
            return res.status(200).json({ success: false, message: "KEY INVÁLIDA!" });
        }

        // Vinculação automática de HWID no primeiro login
        if (!license.hwid || license.hwid === "") {
            await supabase.from('keys').update({ hwid: hwid }).eq('key', key);
            return res.status(200).json({ success: true, message: "APARELHO VINCULADO!" });
        }

        // Validação de segurança do HWID
        if (license.hwid !== hwid) {
            return res.status(200).json({ success: false, message: "KEY EM USO EM OUTRO CELULAR!" });
        }

        return res.status(200).json({ success: true, message: "ACESSO LIBERADO!" });

    } catch (err) {
        return res.status(200).json({ 
            success: false, 
            message: "ERRO NO BANCO: " + err.message 
        });
    }
}
