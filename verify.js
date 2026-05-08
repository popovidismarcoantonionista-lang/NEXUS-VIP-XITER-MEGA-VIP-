import { createClient } from '@supabase/supabase-js';

export default async function handler(req, res) {
    // 1. Configuração de Headers (CORS)
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    // Responde a requisições de pre-verificação
    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    // 2. Inicializa o Supabase com as variáveis da Vercel
    const supabase = createClient(
        process.env.SUPABASE_URL || '', 
        process.env.SUPABASE_KEY || ''
    );

    const { key, hwid } = req.query;

    // 3. Validação básica
    if (!key || !hwid) {
        return res.status(200).json({ 
            success: false, 
            message: "Aguardando parâmetros key e hwid..." 
        });
    }

    try {
        // 4. Consulta ao banco
        const { data, error } = await supabase
            .from('licencas')
            .select('*')
            .eq('key', key)
            .single();

        if (error || !data) {
            return res.status(200).json({ success: false, message: "Key não encontrada" });
        }

        // 5. Verificação de HWID
        if (data.hwid && data.hwid !== hwid) {
            return res.status(200).json({ success: false, message: "HWID não confere" });
        }

        // 6. Vincula HWID se a key for virgem
        if (!data.hwid) {
            await supabase.from('licencas').update({ hwid: hwid }).eq('key', key);
        }

        return res.status(200).json({ success: true, message: "Acesso Liberado" });

    } catch (err) {
        return res.status(500).json({ success: false, message: "Erro interno no servidor" });
    }
}
