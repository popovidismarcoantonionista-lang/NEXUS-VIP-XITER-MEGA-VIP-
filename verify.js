import { createClient } from '@supabase/supabase-js';

export default async function handler(req, res) {
    const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);
    
    const { key, hwid } = req.query;

    if (!key) {
        return res.status(200).json({ success: false, message: "Digite uma Key!" });
    }

    // BUSCA NA TABELA 'keys' (conforme o seu print do Supabase)
    const { data: license, error } = await supabase
        .from('keys')
        .select('*')
        .eq('key', key.trim())
        .maybeSingle();

    if (error) {
        return res.status(200).json({ success: false, message: "Erro no Banco: " + error.message });
    }

    if (!license) {
        return res.status(200).json({ success: false, message: "Key não encontrada no Supabase" });
    }

    // Lógica simples de expiração (se você tiver a coluna 'expiracao')
    // Se não tiver essa coluna, pode remover as linhas abaixo
    if (license.expiracao && new Date(license.expiracao) < new Date()) {
        return res.status(200).json({ success: false, message: "Esta Key já expirou!" });
    }

    return res.status(200).json({ 
        success: true, 
        message: "Acesso Liberado!",
        plano: license.plano 
    });
}
