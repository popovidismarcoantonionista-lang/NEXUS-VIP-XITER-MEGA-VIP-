import { createClient } from '@supabase/supabase-js';

export default async function handler(req, res) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') return res.status(200).end();

    const { key, hwid } = req.query;

    // Remove espaços e barras extras da URL para garantir
    const supabaseUrl = process.env.SUPABASE_URL?.trim().replace(/\/$/, "");
    const supabaseKey = process.env.SUPABASE_KEY?.trim();

    const supabase = createClient(supabaseUrl, supabaseKey, {
        db: { schema: 'public' }
    });

    try {
        const { data: license, error } = await supabase
            .from('keys') 
            .select('*')
            .eq('key', key)
            .maybeSingle();

        if (error) {
            console.error("Erro do Supabase:", error);
            return res.status(200).json({ 
                success: false, 
                message: `ERRO DE TABELA: ${error.message} (Código: ${error.code})` 
            });
        }

        if (!license) {
            return res.status(200).json({ success: false, message: "KEY NÃO ENCONTRADA!" });
        }

        // Validação de HWID
        if (!license.hwid) {
            await supabase.from('keys').update({ hwid: hwid }).eq('key', key);
            return res.status(200).json({ success: true, message: "VINCULADO COM SUCESSO!" });
        }

        if (license.hwid !== hwid) {
            return res.status(200).json({ success: false, message: "KEY EM USO EM OUTRO CELULAR!" });
        }

        return res.status(200).json({ success: true, message: "ACESSO LIBERADO!" });

    } catch (err) {
        return res.status(200).json({ success: false, message: "ERRO DE ROTA: " + err.message });
    }
}
