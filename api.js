import { createClient } from '@supabase/supabase-js';

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

export default async function handler(req, res) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    const { key, hwid } = req.query;

    if (!key) return res.status(400).json({ success: false, message: "Key vazia" });

    // Verifica se a key aleatória existe na tabela 'keys_management'
    const { data: keyData, error } = await supabase
        .from('keys_management')
        .select('*')
        .eq('key_code', key)
        .eq('status', 'active')
        .single();

    if (!keyData) {
        return res.json({ success: false, message: "Key inválida ou expirada", code: "invalida" });
    }

    // Segurança de HWID (Bloqueia se tentar usar em 2 telemóveis)
    if (keyData.hwid && keyData.hwid !== hwid) {
        return res.json({ success: false, message: "Key já vinculada a outro dispositivo", code: "bloqueada" });
    }

    if (!keyData.hwid) {
        // Vincula o ID do dispositivo no primeiro uso
        await supabase.from('keys_management').update({ hwid: hwid }).eq('key_code', key);
    }

    return res.json({ 
        success: true, 
        token: "access_granted_" + keyData.id, 
        expiraEm: "Ativo" 
    });
}
