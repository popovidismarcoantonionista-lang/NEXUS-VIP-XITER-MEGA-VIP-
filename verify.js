import { createClient } from '@supabase/supabase-js';

export default async function handler(req, res) {
    // Configuração de CORS
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') return res.status(200).end();

    // Pegando as chaves das variáveis de ambiente com limpeza
    const supabaseUrl = process.env.SUPABASE_URL?.trim();
    const supabaseKey = process.env.SUPABASE_KEY?.trim();

    if (!supabaseUrl || !supabaseKey) {
        return res.status(200).json({ 
            success: false, 
            message: "ERRO INTERNO: Variáveis não configuradas na Vercel." 
        });
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

    // Pegando dados da URL de forma segura
    const url = new URL(req.url, `https://${req.headers.host}`);
    const key = url.searchParams.get('key');
    const hwid = url.searchParams.get('hwid');

    if (!key) {
        return res.status(200).json({ success: false, message: "KEY faltando na requisição." });
    }

    try {
        const { data: license, error } = await supabase
            .from('keys')
            .select('*')
            .eq('key', key)
            .maybeSingle();

        if (error) {
            return res.status(200).json({ success: false, message: "ERRO NO BANCO: " + error.message });
        }

        if (!license) {
            return res.status(200).json({ success: false, message: "KEY INVÁLIDA OU INEXISTENTE." });
        }

        // Validação de HWID
        if (!license.hwid) {
            await supabase.from('keys').update({ hwid: hwid }).eq('key', key);
            return res.status(200).json({ success: true, message: "DISPOSITIVO VINCULADO!" });
        }

        if (license.hwid !== hwid) {
            return res.status(200).json({ success: false, message: "ESTA KEY PERTENCE A OUTRO CELULAR." });
        }

        return res.status(200).json({ success: true, message: "ACESSO LIBERADO!" });

    } catch (err) {
        return res.status(200).json({ success: false, message: "ERRO CRÍTICO NA API." });
    }
}
