import { createClient } from '@supabase/supabase-js';

export default async function handler(req, res) {
    const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);
    const { key, hwid } = req.query;

    if (!key || !hwid) {
        return res.status(200).json({ success: false, message: "Parâmetros inválidos!" });
    }

    // Busca a key na tabela 'keys'
    const { data: license, error } = await supabase
        .from('keys')
        .select('*')
        .eq('key', key.trim())
        .maybeSingle();

    if (error) return res.status(200).json({ success: false, message: "Erro no Banco de Dados" });
    if (!license) return res.status(200).json({ success: false, message: "Key não encontrada!" });

    // Lógica de HWID (Trava no dispositivo)
    if (!license.hwid) {
        // Se a key está vazia, salva o HWID do celular atual
        await supabase.from('keys').update({ hwid: hwid }).eq('key', key.trim());
        return res.status(200).json({ success: true, message: "Acesso Liberado! Dispositivo vinculado." });
    }

    if (license.hwid !== hwid) {
        return res.status(200).json({ success: false, message: "Key já vinculada a outro celular!" });
    }

    return res.status(200).json({ success: true, message: "Acesso Liberado!" });
}
