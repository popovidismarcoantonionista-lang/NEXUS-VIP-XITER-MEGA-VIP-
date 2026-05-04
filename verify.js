import { createClient } from '@supabase/supabase-js';

export default async function handler(req, res) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') return res.status(200).end();

    const { key, hwid } = req.query;

    // Garante que as variáveis existem antes de conectar
    if (!process.env.SUPABASE_URL || !process.env.SUPABASE_KEY) {
        return res.status(200).json({ success: false, message: "ERRO: Variáveis da Vercel não configuradas!" });
    }

    const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

    try {
        // Busca explícita na tabela keys
        const { data: license, error } = await supabase
            .from('keys') 
            .select('*')
            .eq('key', key)
            .single(); // Mudamos para single para ser mais direto

        if (error) {
            // Se der erro de caminho, ele vai dizer exatamente qual tabela ele não achou
            return res.status(200).json({ 
                success: false, 
                message: `Tabela não encontrada: ${error.message}` 
            });
        }

        if (!license) {
            return res.status(200).json({ success: false, message: "KEY INVÁLIDA!" });
        }

        // Validação de HWID
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
            message: "ERRO DE ROTA: " + err.message 
        });
    }
}
