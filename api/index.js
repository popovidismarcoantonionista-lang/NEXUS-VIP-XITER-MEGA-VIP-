import { createClient } from '@supabase/supabase-js';

export default async function handler(req, res) {
    // 1. CONFIGURAÇÃO DE CABEÇALHOS (Resolve o Erro de Conexão)
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    // Responde rapidamente ao teste do navegador
    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    // 2. PEGA OS DADOS DA URL (key e hwid)
    const { key, hwid } = req.query;

    // 3. CONEXÃO COM O SUPABASE
    // Certifique-se de que essas variáveis estão no painel da Vercel!
    const supabaseUrl = process.env.SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_KEY;

    if (!supabaseUrl || !supabaseKey) {
        return res.status(500).json({ 
            success: false, 
            message: "Erro: Chaves do Supabase não configuradas na Vercel." 
        });
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

    if (!key || !hwid) {
        return res.json({ success: false, message: "Key ou HWID faltando na requisição." });
    }

    try {
        // 4. BUSCA A LICENÇA NO BANCO DE DADOS
        const { data, error } = await supabase
            .from('licencas')
            .select('*')
            .eq('key', key)
            .single();

        if (error || !data) {
            return res.json({ success: false, message: "Esta Key não existe!" });
        }

        // 5. VERIFICAÇÃO DE HWID (Trava de Segurança)
        if (data.hwid && data.hwid !== hwid) {
            return res.json({ 
                success: false, 
                message: "Key já vinculada a outro celular!" 
            });
        }

        // 6. VINCULA O HWID CASO A KEY SEJA NOVA
        if (!data.hwid) {
            const { updateError } = await supabase
                .from('licencas')
                .update({ hwid: hwid })
                .eq('key', key);
            
            if (updateError) throw updateError;
        }

        // 7. RETORNO DE SUCESSO
        return res.json({ 
            success: true, 
            message: "Login realizado com sucesso!" 
        });

    } catch (err) {
        return res.status(500).json({ 
            success: false, 
            message: "Erro interno: " + err.message 
        });
    }
    }
