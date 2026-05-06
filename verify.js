/**
 * NEXUS XITER V2 - CORE ENGINE
 */

const OFFSETS = {
    aim: "0x946001c",
    recoil: "0x9cb8258",
    esp: "0x9cb8260",
    speed: "0xa07f328"
};

function auth() {
    const key = document.getElementById('key').value.trim();
    const status = document.getElementById('status');

    if (!key) {
        status.innerText = "INSIRA UMA CHAVE";
        status.style.color = "#f44";
        return;
    }

    status.innerText = "SINCRONIZANDO...";
    status.style.color = "var(--neon)";

    if (window.Android) {
        try {
            const hwid = window.Android.getDeviceId();
            Android.proc(key, hwid);
        } catch (e) {
            status.innerText = "ERRO DE PONTE";
        }
    }
}

function cmd(id, status) {
    const hex = OFFSETS[id];
    if (window.Android) {
        Android.exec(id, hex, status);
        Android.msg(id.toUpperCase() + (status ? " ATIVADO" : " DESATIVADO"));
    }
}

// Alias para garantir compatibilidade com o HTML
function checkbox_changed(id, status) { cmd(id, status); }

function run() { if (window.Android) Android.boot(); }
function exit() { if (window.Android) Android.kill(); }

function onIn() {
    document.getElementById('login-screen').classList.remove('active');
    document.getElementById('menu-screen').classList.add('active');
}

function onOut(msg) {
    const sText = document.getElementById('status');
    sText.innerText = msg || "ACESSO NEGADO";
    sText.style.color = "#f44";
}
