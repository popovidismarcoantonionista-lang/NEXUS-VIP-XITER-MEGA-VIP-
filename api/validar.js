async function fazerLogin() {
    const keyDigitada = document.getElementById('keyInput').value; // ID do teu campo de texto
    
    // 1. Pega o HWID do Android através da ponte que criamos no Sketchware
    let hwid = "WEB_TEST"; 
    if (typeof Android !== "undefined") {
        hwid = Android.getDeviceId();
    }

    // 2. Chama a tua função na Vercel
    const response = await fetch(`https://nexus-vip-key.vercel.app/?key=${keyDigitada}&hwid=${hwid}`);
    const data = await response.json();

    if (data.success) {
        alert("LOGIN REALIZADO COM SUCESSO!");
        
        // 3. COMANDO CRUCIAL: Avisa o APK para abrir o menu
        if (typeof Android !== "undefined") {
            Android.onLoginSuccess();
        }
    } else {
        // Se a API Key for inválida no Supabase, o erro aparecerá aqui
        alert("ERRO: " + data.message);
    }
}
