import { createClient } from '@supabase/supabase-js';

export default async function handler(req, res) {
    // Configuração de CORS (Essencial para o App não dar erro de conexão)
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') return res.status(200).end();

    const { key, hwid } = req.query;
    const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

    try {
        // 1. Busca a chave na tabela 'keys'
        const { data: license, error } = await supabase
            .from('keys')
            .select('*')
            .eq('key', key)
            .maybeSingle();

        if (error) throw error;

        // 2. Valida se a chave existe
        if (!license) {
            return res.status(200).json({ success: false, message: "CHAVE INVÁLIDA!" });
        }

        // 3. Vincula o HWID no primeiro acesso
        if (!license.hwid || license.hwid === "") {
            await supabase.from('keys').update({ hwid: hwid }).eq('key', key);
            return res.status(200).json({ success: true, message: "APARELHO VINCULADO!" });
        }

        // 4. Verifica se o HWID é o mesmo registrado
        if (license.hwid !== hwid) {
            return res.status(200).json({ success: false, message: "CHAVE EM USO EM OUTRO CELULAR!" });
        }

        return res.status(200).json({ success: true, message: "ACESSO LIBERADO!" });

    } catch (err) {
        return res.status(200).json({ success: false, message: "ERRO NO BANCO: " + err.message });
    }
}
