// api/validar.js
export default function handler(req, res) {
    const { key } = req.query;
    const agora = Date.now();

    // CONFIGURAÇÃO DA KEY TEMPORÁRIA (Exemplo)
    // Para gerar o 'expiraEm', usa o site 'currentmillis.com' e soma 7200000 (2h)
    const keysTemporarias = {
        "NEXUS-TESTE-99": 1714870000000 // Timestamp de exemplo
    };

    if (keysTemporarias[key]) {
        if (agora < keysTemporarias[key]) {
            return res.status(200).send("sucesso");
        } else {
            return res.status(403).send("expirada");
        }
    }

    // Keys Fixas (VIP)
    const vipKeys = ["NEXUS-VIP-2026", "TONNY-MODS"];
    if (vipKeys.includes(key)) {
        return res.status(200).send("sucesso");
    }

    res.status(403).send("erro");
}
