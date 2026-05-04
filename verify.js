import { createClient } from '@supabase/supabase-js';

export default async function handler(req, res) {
    // RESOLVE ERROS DE CONEXÃO (CORS)
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') return res.status(200).end();

    const { key, hwid } = req.query;
    const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

    try {
        // Busca na tabela 'keys' (Garanta que o nome no Supabase é 'keys')
        const { data: license, error } = await supabase
            .from('keys') 
            .select('*')
            .eq('key', key)
            .maybeSingle();

        if (error) throw error;

        if (!license) {
            return res.status(200).json({ success: false, message: "Key não encontrada!" });
        }

        // Se a key não tiver HWID, vincula o atual
        if (!license.hwid || license.hwid === "") {
            await supabase.from('keys').update({ hwid: hwid }).eq('key', key);
            return res.status(200).json({ success: true, message: "Aparelho Vinculado!" });
        }

        // Verifica se o HWID bate com o registrado
        if (license.hwid !== hwid) {
            return res.status(200).json({ success: false, message: "Key em uso em outro celular!" });
        }

        return res.status(200).json({ success: true, message: "Acesso Liberado!" });

    } catch (err) {
        return res.status(200).json({ 
            success: false, 
            message: "Erro no Banco: " + err.message 
        });
    }
}
