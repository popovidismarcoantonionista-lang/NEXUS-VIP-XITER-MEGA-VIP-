function autenticar() {
    const key = document.getElementById('keyInput').value.trim();
    
    if (key === "") {
        alert("POR FAVOR, INSIRA UMA KEY!");
        return;
    }

    // Verifica se a ponte 'Android' existe (isso evita erro no navegador comum)
    if (typeof Android !== 'undefined') {
        // Envia a key para a função verificarKey no Sketchware
        Android.verificarKey(key);
    } else {
        alert("ERRO: Abra este site através do App NEXUS!");
    }
}
