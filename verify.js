/**
 * NEXUS XITER V2 - CORE ENGINE
 * Integração Vercel API: nexus-vip-key.vercel.app
 */

const OFFSETS = {
    aim: "0x946001c",
    recoil: "0x9cb8258",
    esp: "0x9cb8260",
    speed: "0xa07f328"
};

async function auth() {
    const kInput = document.getElementById('key');
    const sText = document.getElementById('status');
    const key = kInput.value.trim();

    if (!key) {
        sText.innerText = "INSIRA UMA CHAVE";
        sText.style.color = "#f44";
        return;
    }

    // Estado visual inicial
    sText.innerText = "SINCRONIZANDO...";
    sText.style.color = "var(--neon)";

    if (window.Android) {
        try {
            // Solicita o Device ID único do Android
            const hwid = window.Android.getDeviceId();
            // Dispara a validação nativa
            Android.proc(key, hwid);
        } catch (e) {
            sText.innerText = "ERRO DE INTERFACE";
            sText.style.color = "#f44";
        }
    } else {
        // Simulação para ambiente de desenvolvimento browser
        console.log("Simulando verificação para: " + key);
        setTimeout(() => onIn(), 2000);
    }
}

/**
 * Execução de Comandos
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
 * Callbacks de Resposta
 */
function onIn() {
    const login = document.getElementById('login-screen');
    const menu = document.getElementById('menu-screen');
    if (login && menu) {
        login.classList.remove('active');
        menu.classList.add('active');
    }
}

function onOut(msg) {
    const sText = document.getElementById('status');
    if (sText) {
        sText.innerText = msg || "ACESSO NEGADO";
        sText.style.color = "#f44";
    }
}
