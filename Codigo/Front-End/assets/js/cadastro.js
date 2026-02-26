// cadastro.js — login e cadastro via API

// Se já está logado, redireciona
(async () => {
    const me = await fetch('http://localhost:8080/api/auth/me', { credentials: 'include' })
        .then(r => r.ok ? r.json() : null).catch(() => null);
    if (me) window.location.href = 'index.html';
})();

// ─── Tabs ─────────────────────────────────────────────────────────────

function switchTab(tab) {
    document.querySelectorAll('.auth-tab').forEach((t, i) => {
        t.classList.toggle('active', (i === 0 && tab === 'login') || (i === 1 && tab === 'cadastro'));
    });
    document.getElementById('formLogin').classList.toggle('active', tab === 'login');
    document.getElementById('formCadastro').classList.toggle('active', tab === 'cadastro');
    esconderErro('erroLogin');
    esconderErro('erroCadastro');
}

// ─── Erros / Sucesso ──────────────────────────────────────────────────

function mostrarErro(id, msg) {
    const el = document.getElementById(id);
    document.getElementById(id + 'Msg').textContent = msg;
    el.classList.add('show');
}
function esconderErro(id) {
    document.getElementById(id).classList.remove('show');
}

// ─── Toggle senha ─────────────────────────────────────────────────────

function toggleSenha(inputId, btn) {
    const input = document.getElementById(inputId);
    const icon  = btn.querySelector('i');
    if (input.type === 'password') {
        input.type = 'text';
        icon.className = 'fa-regular fa-eye-slash';
    } else {
        input.type = 'password';
        icon.className = 'fa-regular fa-eye';
    }
}

// ─── Força da senha ───────────────────────────────────────────────────

function avaliarSenha(senha) {
    const bar   = document.getElementById('strengthBar');
    const label = document.getElementById('strengthLabel');
    let score   = 0;
    if (senha.length >= 6)          score++;
    if (senha.length >= 10)         score++;
    if (/[A-Z]/.test(senha))        score++;
    if (/[0-9]/.test(senha))        score++;
    if (/[^a-zA-Z0-9]/.test(senha)) score++;

    const levels = [
        { pct: '0%',   color: '',       text: '' },
        { pct: '25%',  color: '#ff4757', text: 'Muito fraca' },
        { pct: '50%',  color: '#ffa502', text: 'Fraca' },
        { pct: '75%',  color: '#eccc68', text: 'Boa' },
        { pct: '90%',  color: '#2ed573', text: 'Forte' },
        { pct: '100%', color: '#00d9ff', text: 'Muito forte' },
    ];
    const lvl = levels[Math.min(score, 5)];
    bar.style.width      = lvl.pct;
    bar.style.background = lvl.color;
    label.textContent    = lvl.text;
    label.style.color    = lvl.color;
}

// ─── Loading state ────────────────────────────────────────────────────

function setLoading(btnId, spinnerId, iconId, loading) {
    document.getElementById(btnId).disabled                     = loading;
    document.getElementById(spinnerId).style.display            = loading ? 'block' : 'none';
    document.getElementById(iconId).style.display               = loading ? 'none' : 'inline';
}

// ─── Login ────────────────────────────────────────────────────────────

async function fazerLogin() {
    const email = document.getElementById('loginEmail').value.trim().toLowerCase();
    const senha = document.getElementById('loginSenha').value;
    esconderErro('erroLogin');

    if (!email || !senha) { mostrarErro('erroLogin', 'Preencha todos os campos.'); return; }

    setLoading('btnLogin', 'spinnerLogin', 'iconLogin', true);

    const r = await fetch('http://localhost:8080/api/auth/login', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, senha })
    }).catch(() => null);

    setLoading('btnLogin', 'spinnerLogin', 'iconLogin', false);

    if (!r || !r.ok) {
        const data = r ? await r.json() : {};
        mostrarErro('erroLogin', data.erro || 'Erro ao conectar ao servidor.');
        return;
    }

    window.location.href = 'index.html';
}

// ─── Cadastro ─────────────────────────────────────────────────────────

async function fazerCadastro() {
    const nome  = document.getElementById('cadNome').value.trim();
    const email = document.getElementById('cadEmail').value.trim().toLowerCase();
    const senha = document.getElementById('cadSenha').value;
    esconderErro('erroCadastro');

    if (!nome || !email || !senha) { mostrarErro('erroCadastro', 'Preencha todos os campos.'); return; }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { mostrarErro('erroCadastro', 'Email inválido.'); return; }
    if (senha.length < 6) { mostrarErro('erroCadastro', 'A senha deve ter no mínimo 6 caracteres.'); return; }

    setLoading('btnCadastro', 'spinnerCadastro', 'iconCadastro', true);

    const r = await fetch('http://localhost:8080/api/auth/cadastro', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nome, email, senha })
    }).catch(() => null);

    setLoading('btnCadastro', 'spinnerCadastro', 'iconCadastro', false);

    if (!r || !r.ok) {
        const data = r ? await r.json() : {};
        mostrarErro('erroCadastro', data.erro || 'Erro ao conectar ao servidor.');
        return;
    }

    document.getElementById('sucessoCadastro').classList.add('show');
    setTimeout(() => { window.location.href = 'index.html'; }, 1200);
}

// ─── Enter para submeter ──────────────────────────────────────────────

document.addEventListener('keydown', (e) => {
    if (e.key !== 'Enter') return;
    const loginAtivo = document.getElementById('formLogin').classList.contains('active');
    if (loginAtivo) fazerLogin(); else fazerCadastro();
});