import { createClient } from '@supabase/supabase-js';

export default async function handler(req, res) {
    // 1. CONFIGURAÇÃO DE CORS (Essencial para o botão funcionar no App)
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    // Responde rapidamente a requisições de teste (pre-flight)
    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    // 2. INICIALIZAÇÃO DO SUPABASE
    const supabase = createClient(
        process.env.SUPABASE_URL || 'https://cbgcwnwpsuatxsyckgfa.supabase.co/rest/v1/', 
        process.env.SUPABASE_KEY || 'sb_publishable_L-B142c1vJjwnyVewjvKHw_xZMDIXRS'
    );

    const { key, hwid } = req.query;

    // 3. VALIDAÇÃO DE PARÂMETROS
    if (!key || !hwid) {
        return res.status(200).json({ 
            success: false, 
            message: "Aguardando Key e HWID..." 
        });
    }

    try {
        // 4. CONSULTA NA TABELA 'keys'
        const { data: license, error } = await supabase
            .from('keys')
            .select('*')
            .eq('key', key)
            .maybeSingle();

        if (error || !license) {
            return res.status(200).json({ success: false, message: "Key Inválida!" });
        }

        // 5. VÍNCULO DE HWID (Se for a primeira vez que usa a key)
        if (!license.hwid) {
            await supabase.from('keys').update({ hwid: hwid }).eq('key', key);
            return res.status(200).json({ success: true, message: "HWID Vinculado com Sucesso!" });
        }

        // 6. VERIFICAÇÃO DE HWID
        if (license.hwid !== hwid) {
            return res.status(200).json({ success: false, message: "Key em uso em outro celular!" });
        }

        // 7. SUCESSO TOTAL
        return res.status(200).json({ success: true, message: "Acesso Liberado!" });

    } catch (err) {
        return res.status(500).json({ success: false, message: "Erro interno no servidor" });
    }
}
