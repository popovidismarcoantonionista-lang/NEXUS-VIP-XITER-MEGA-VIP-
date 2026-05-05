import { createClient } from '@supabase/supabase-js';

// Use as chaves DIRETAMENTE se as variáveis de ambiente falharem para teste
const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.SUPABASE_KEY;

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

export default async function handler(req, res) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, apikey, Authorization');

    if (req.method === 'OPTIONS') return res.status(200).end();

    const { key, hwid } = req.query;

    if (!key || !hwid) {
        return res.status(200).json({ success: false, message: "Parâmetros ausentes" });
    }

    try {
        // Verifica se a Key existe na tabela 'licencas'
        const { data, error } = await supabase
            .from('licencas')
            .select('*')
            .eq('key', key)
            .single();

        if (error || !data) {
            return res.status(200).json({ success: false, message: "Chave Inválida no Banco" });
        }

        // Se a chave já tem um dono (HWID), verifica se coincide
        if (data.hwid && data.hwid !== hwid) {
            return res.status(200).json({ success: false, message: "Este dispositivo não está autorizado" });
        }

        // Se for o primeiro uso da chave, vincula o HWID
        if (!data.hwid) {
            const { error: updateError } = await supabase
                .from('licencas')
                .update({ hwid: hwid })
                .eq('key', key);
            
            if (updateError) throw updateError;
        }

        return res.status(200).json({ success: true, message: "Acesso Liberado" });

    } catch (err) {
        return res.status(500).json({ success: false, message: "Erro de Conexão com Supabase" });
    }
}
