import { createClient } from '@supabase/supabase-js';

export default async function handler(req, res) {
    // --- CONFIGURAÇÃO DE ACESSO (CORS) ---
    // Isso evita o erro de "Falha na conexão" no navegador e no App
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    // Responde rapidamente a requisições de teste do navegador
    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    // Pega a Key e o HWID enviados pelo App/Site
    const { key, hwid } = req.query;

    // Verifica se as chaves do banco de dados foram configuradas na Vercel
    if (!process.env.SUPABASE_URL || !process.env.SUPABASE_KEY) {
        return res.status(500).json({ 
            success: false, 
            message: "Erro: Configure as chaves do Supabase no painel da Vercel." 
        });
    }

    const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

    if (!key || !hwid) {
        return res.json({ success: false, message: "Dados incompletos (Key ou HWID ausentes)." });
    }

    try {
        // Busca a key na tabela 'licencas'
        const { data, error } = await supabase
            .from('licencas')
            .select('*')
            .eq('key', key)
            .single();

        if (error || !data) {
            return res.json({ success: false, message: "Key não encontrada no sistema." });
        }

        // Verifica se o HWID já está vinculado
        if (data.hwid && data.hwid !== hwid) {
            return res.json({ 
                success: false, 
                message: "Esta Key já está sendo usada em outro dispositivo!" 
            });
        }

        // Se a Key for nova (não tiver HWID), vincula ao aparelho atual
        if (!data.hwid) {
            const { updateError } = await supabase
                .from('licencas')
                .update({ hwid: hwid })
                .eq('key', key);
            
            if (updateError) throw updateError;
        }

        // Retorna Sucesso! O HTML vai ler isso e liberar o menu.
        return res.json({ 
            success: true, 
            message: "Acesso liberado com sucesso!" 
        });

    } catch (err) {
        console.error(err);
        return res.status(500).json({ 
            success: false, 
            message: "Erro interno ao processar a licença." 
        });
    }
}
