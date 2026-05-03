const { createClient } = require('@supabase/supabase-js');
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

module.exports = async (req, res) => {
    // Configura CORS
    res.setHeader('Access-Control-Allow-Origin', '*');
    const { key, hwid } = req.query;

    try {
        const { data, error } = await supabase
            .from('licencas')
            .select('*')
            .eq('key', key)
            .single();

        if (error || !data) return res.json({ success: false, message: "Key Invalida" });
        if (data.hwid && data.hwid !== hwid) return res.json({ success: false, message: "HWID Invalido" });

        if (!data.hwid) {
            await supabase.from('licencas').update({ hwid }).eq('key', key);
        }

        return res.json({ success: true });
    } catch (e) {
        return res.json({ success: false, message: "Erro na API" });
    }
};
