import { createClient } from '@supabase/supabase-js';

export default async function handler(req, res) {
    const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);
    const { key, hwid } = req.query;

    const { data: license, error } = await supabase
        .from('keys') // TABELA DO SEU SQL
        .select('*')
        .eq('key', key)
        .maybeSingle();

    if (error || !license) {
        return res.status(200).json({ success: false, message: "Key Inválida!" });
    }

    if (!license.hwid) {
        await supabase.from('keys').update({ hwid: hwid }).eq('key', key);
        return res.status(200).json({ success: true, message: "Vinculado!" });
    }

    if (license.hwid !== hwid) {
        return res.status(200).json({ success: false, message: "Key em uso em outro celular!" });
    }

    return res.status(200).json({ success: true });
}
