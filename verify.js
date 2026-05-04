import { createClient } from '@supabase/supabase-js';

export default async function handler(req, res) {
    // --- 1. CONFIGURAÇÃO DE CORS (ESSENCIAL PARA O APP CONECTAR) ---
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    // Responde a requisições de teste do navegador/android
    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    // --- 2. CONEXÃO COM O SUPABASE ---
    // Certifique-se de configurar essas variáveis no painel da Vercel!
    const supabaseUrl = process.env.SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_KEY;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { key, hwid } = req.query;

    // Validação básica de entrada
    if (!key || !hwid) {
        return res.status(200).json({ 
            success: false, 
            message: "Aguardando Key e HWID..." 
        });
    }

    try {
        // --- 3. BUSCAR A KEY NO BANCO DE DADOS ---
        const { data: license, error } = await supabase
            .from('keys')
            .select('*')
            .eq('key', key)
            .maybeSingle();

        if (error || !license) {
            return res.status(200).json({ 
                success: false, 
                message: "Key não encontrada no sistema!" 
            });
        }

        // --- 4. VINCULAR HWID (SE ESTIVER VAZIO) ---
        if (!license.hwid || license.hwid === "" || license.hwid === null) {
            await supabase
                .from('keys')
                .update({ hwid: hwid })
                .eq('key', key);
                
            return res.status(200).json({ 
                success: true, 
                message: "Aparelho vinculado com sucesso!" 
            });
        }

        // --- 5. VERIFICAR SE O HWID É O MESMO ---
        if (license.hwid !== hwid) {
            return res.status(200).json({ 
                success: false, 
                message: "Esta Key já está vinculada a outro dispositivo!" 
            });
        }

        // --- 6. SUCESSO - LIBERAR MENU ---
        return res.status(200).json({ 
            success: true, 
            message: "Acesso autorizado!" 
        });

    } catch (err) {
        return res.status(500).json({ 
            success: false, 
            message: "Erro interno no servidor da Vercel." 
        });
    }
}
