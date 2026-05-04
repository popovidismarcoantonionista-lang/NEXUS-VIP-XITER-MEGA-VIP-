import { createClient } from '@supabase/supabase-js';

export default async function handler(req, res) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') return res.status(200).end();

    const { key, hwid } = req.query;
    const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

    try {
        // O NOME AQUI DEVE SER 'keys' IGUAL NO SUPABASE
        const { data: license, error } = await supabase
            .from('keys') 
            .select('*')
            .eq('key', key)
            .maybeSingle();

        if (error) throw error; // Se a tabela não existir, o erro PGRST125 cai aqui

        if (!license) {
            return res.status(200).json({ success: false, message: "KEY NÃO ENCONTRADA!" });
        }

        if (!license.hwid || license.hwid === "") {
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
            message: "ERRO NO BANCO: " + err.message // Aqui aparecerá o erro se o nome da tabela estiver errado
        });
    }
}
