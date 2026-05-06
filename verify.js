/**
 * NEXUS XITER V2 - CORE ENGINE
 * Gestão de Offsets, HWID e Autenticação Supabase
 */

// Tabela de Offsets Reais (OB53 64-bit)
const OFFSETS = {
    aim: "0x946001c",
    recoil: "0x9cb8258",
    esp: "0x9cb8260",
    speed: "0xa07f328"
};

/**
 * Inicia o processo de autenticação verificando Key e HWID
 */
async function auth() {
    const kInput = document.getElementById('key');
    const sText = document.getElementById('status');
    const key = kInput.value.trim();

    if (!key) {
        sText.innerText = "INSIRA UMA CHAVE";
        sText.style.color = "#f44";
        return;
    }

    sText.innerText = "OBTENDO HWID...";
    sText.style.color = "var(--neon)";

    // Tenta obter o HWID do Android
    let hwid = "BROWSER_TEST";
    if (window.Android && window.Android.getDeviceId) {
        hwid = window.Android.getDeviceId();
    }

    sText.innerText = "VERIFICANDO LICENÇA...";

    // Se você estiver usando a função Java que já faz o POST (proc), 
    // certifique-se de que o Java está enviando o HWID no JSON.
    if (window.Android) {
        // Enviamos para o Java processar a requisição de rede nativa
        // Note: Atualize seu código Java para aceitar key e hwid
        Android.proc(key, hwid);
    }
}

/**
 * Função de Comando (Execução de Offsets)
 */
function cmd(id, status) {
    const hex = OFFSETS[id];
    
    if (window.Android) {
        Android.exec(id, hex, status);
        
        const label = id.toUpperCase() === 'AIM' ? 'LOCK TARGET' : 
                      id.toUpperCase() === 'RECOIL' ? 'ZERO RECOIL' :
                      id.toUpperCase() === 'ESP' ? 'RENDER LINE' : 'VELOCITY 2.0';
                      
        Android.msg(label + (status ? " ATIVADO" : " DESATIVADO"));
    }
}

function run() { if (window.Android) Android.boot(); }
function exit() { if (window.Android) Android.kill(); }

/**
 * Callbacks chamados pelo Java
 */

// Login com sucesso (Key válida e HWID compatível)
function onIn() {
    const loginScreen = document.getElementById('login-screen');
    const menuScreen = document.getElementById('menu-screen');
    if (loginScreen && menuScreen) {
        loginScreen.classList.remove('active');
        menuScreen.classList.add('active');
    }
}

// Erro no login (Key inválida, HWID errado, etc)
function onOut(msg) {
    const sText = document.getElementById('status');
    if (sText) {
        sText.innerText = msg || "ACESSO NEGADO";
        sText.style.color = "#f44";
    }
}
