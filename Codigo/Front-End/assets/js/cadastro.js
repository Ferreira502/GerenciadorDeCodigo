// cadastro.js — login e cadastro via API

(async () => {
    try {
        const me = await getMe();
        if (me) window.location.href = 'index.html';
    } catch (e) {
        // Usuario nao esta logado
    }
})();

// Tabs

function switchTab(tab) {
    document.querySelectorAll('.aba-acesso').forEach((t, i) => {
        t.classList.toggle('active', (i === 0 && tab === 'login') || (i === 1 && tab === 'cadastro'));
    });
    document.getElementById('formLogin').classList.toggle('active', tab === 'login');
    document.getElementById('formCadastro').classList.toggle('active', tab === 'cadastro');
    esconderErro('erroLogin');
    esconderErro('erroCadastro');
}

// Erros / Sucesso 

function mostrarErro(id, msg) {
    const el = document.getElementById(id);
    document.getElementById(id + 'Msg').textContent = msg;
    el.classList.add('show');
}
function esconderErro(id) {
    document.getElementById(id).classList.remove('show');
}

// Toggle senha

function toggleSenha(inputId, btn) {
    const input = document.getElementById(inputId);
    const icon = btn.querySelector('i');
    if (input.type === 'password') {
        input.type = 'text';
        icon.className = 'fa-regular fa-eye-slash';
    } else {
        input.type = 'password';
        icon.className = 'fa-regular fa-eye';
    }
}

// status login

function setLoading(btnId, spinnerId, iconId, loading) {
    document.getElementById(btnId).disabled = loading;
    document.getElementById(spinnerId).style.display = loading ? 'block' : 'none';
    document.getElementById(iconId).style.display = loading ? 'none' : 'inline';
}

// Login 

async function fazerLogin() {
    const email = document.getElementById('loginEmail').value.trim().toLowerCase();
    const senha = document.getElementById('loginSenha').value;
    esconderErro('erroLogin');

    if (!email || !senha) { mostrarErro('erroLogin', 'Preencha todos os campos.'); return; }

    setLoading('btnLogin', 'spinnerLogin', 'iconLogin', true);

    const { ok, data } = await login(email, senha);

    setLoading('btnLogin', 'spinnerLogin', 'iconLogin', false);

    if (!ok) {
        mostrarErro('erroLogin', data.erro || 'Erro ao conectar ao servidor.');
        return;
    }

    window.location.href = 'index.html';
}

// Cadastro 

async function fazerCadastro() {
    const nome = document.getElementById('cadNome').value.trim();
    const email = document.getElementById('cadEmail').value.trim().toLowerCase();
    const senha = document.getElementById('cadSenha').value;
    esconderErro('erroCadastro');

    if (!nome || !email || !senha) { mostrarErro('erroCadastro', 'Preencha todos os campos.'); return; }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { mostrarErro('erroCadastro', 'Email inválido.'); return; }
    if (senha.length < 6) { mostrarErro('erroCadastro', 'A senha deve ter no mínimo 6 caracteres.'); return; }

    setLoading('btnCadastro', 'spinnerCadastro', 'iconCadastro', true);

    const { ok, data } = await cadastro(nome, email, senha);

    setLoading('btnCadastro', 'spinnerCadastro', 'iconCadastro', false);

    if (!ok) {
        mostrarErro('erroCadastro', data.erro || 'Erro ao conectar ao servidor.');
        return;
    }

    document.getElementById('sucessoCadastro').classList.add('show');
    setTimeout(() => { window.location.href = 'index.html'; }, 1500);
}

// Enter para submeter

document.addEventListener('keydown', (e) => {
    if (e.key !== 'Enter') return;
    const loginAtivo = document.getElementById('formLogin').classList.contains('active');
    if (loginAtivo) fazerLogin(); else fazerCadastro();
});