async function autenticar() {
    const key = document.getElementById('keyInput').value.trim();
    const status = document.getElementById('status'); // Se tiver um campo de status
    
    if (!key) {
        alert("⚠️ Por favor, digite uma Key!");
        return;
    }

    // Pega o HWID do Android (Sketchware)
    const hwid = (typeof Android !== 'undefined') ? Android.getDeviceId() : "Navegador_Teste";

    try {
        // LINK CORRIGIDO ABAIXO:
        const apiURL = `https://nexus-vip-key.vercel.app/api/handler?key=${key}&hwid=${hwid}`;
        
        const response = await fetch(apiURL);
        
        if (!response.ok) {
            throw new Error("Servidor fora do ar");
        }

        const result = await response.json();

        if (result.success) {
            // Se o login for aceito
            if (typeof Android !== 'undefined') {
                Android.onLoginSuccess(); // Chama o comando no Sketchware
            } else {
                alert("✅ Sucesso! No APK o menu abriria agora.");
                // window.location.href = "menu-vip.html"; // Opcional para PC
            }
        } else {
            // Se a key for inválida ou HWID diferente
            alert("❌ ERRO: " + result.message);
        }

    } catch (error) {
        console.error(error);
        alert("⚠️ FALHA NA CONEXÃO: Verifique se a sua API na Vercel está ativa e configurada corretamente.");
    }
}
