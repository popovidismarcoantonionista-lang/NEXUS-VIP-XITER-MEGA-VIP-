async function autenticar() {
    const key = document.getElementById('keyInput').value.trim();
    
    // Pega o HWID direto do Android via ponte
    const hwid = (typeof Android !== 'undefined') ? Android.getDeviceId() : "Navegador";

    // Chama a sua API na Vercel (aquela que você mandou no início)
    const response = await fetch(`https://SUA-API-VERCEL.vercel.app/api/handler?key=${key}&hwid=${hwid}`);
    const result = await response.json();

    if (result.success) {
        // Se a Key/HWID estiverem OK no Supabase
        if (typeof Android !== 'undefined') {
            Android.onLoginSuccess(); // Avisa o App para abrir o mod
        } else {
            window.location.href = "menu-vip.html"; // Fallback para PC
        }
    } else {
        alert("ERRO: " + result.message);
    }
}
