import { createClient } from '@supabase/supabase-js';

export default async function handler(req, res) {
    // Configurações de CORS
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') return res.status(200).end();

    const { key, hwid } = req.query;

    // Conexão com Supabase usando as variáveis de ambiente da Vercel
    const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

    try {
        // Busca a licença
        const { data: license, error } = await supabase
            .from('keys') 
            .select('*')
            .eq('key', key)
            .maybeSingle();

        if (error) throw error;

        if (!license) {
            return res.status(200).json({ success: false, message: "KEY INVÁLIDA!" });
        }

        // Validação de expiração (se a coluna existir)
        if (license.expira_em && new Date(license.expira_em) < new Date()) {
            return res.status(200).json({ success: false, message: "KEY EXPIRADA!" });
        }

        // Vinculação ou Verificação de HWID
        if (!license.hwid) {
            await supabase.from('keys').update({ hwid: hwid }).eq('key', key);
            return res.status(200).json({ success: true, message: "APARELHO VINCULADO!" });
        }

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
