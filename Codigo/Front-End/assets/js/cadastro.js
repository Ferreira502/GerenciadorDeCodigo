
// CHAVES DE STORAGE

const AUTH_USERS_KEY = 'cv_users';
const AUTH_SESSION_KEY = 'cv_session';


// UTILITARIOS

function getUsers() {
    return JSON.parse(localStorage.getItem(AUTH_USERS_KEY) || '{}');
}
function saveUsers(users) {
    localStorage.setItem(AUTH_USERS_KEY, JSON.stringify(users));
}
function setSession(user) {
    localStorage.setItem(AUTH_SESSION_KEY, JSON.stringify({
        id: user.id,
        nome: user.nome,
        email: user.email
    }));
}
function getSession() {
    return JSON.parse(localStorage.getItem(AUTH_SESSION_KEY) || 'null');
}

// Redireciona se ja logado
if (getSession()) {
    window.location.href = 'index.html';
}


// TABS

function switchTab(tab) {
    document.querySelectorAll('.auth-tab').forEach((t, i) => {
        t.classList.toggle('active', (i === 0 && tab === 'login') || (i === 1 && tab === 'cadastro'));
    });
    document.getElementById('formLogin').classList.toggle('active', tab === 'login');
    document.getElementById('formCadastro').classList.toggle('active', tab === 'cadastro');
    // limpa erros
    esconderErro('erroLogin');
    esconderErro('erroCadastro');
}


// ERROS / SUCESSO

function mostrarErro(id, msg) {
    const el = document.getElementById(id);
    document.getElementById(id + 'Msg').textContent = msg;
    el.classList.add('show');
}
function esconderErro(id) {
    document.getElementById(id).classList.remove('show');
}


// TOGGLE SENHA

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


// FORCA DA SENHA

function avaliarSenha(senha) {
    const bar = document.getElementById('strengthBar');
    const label = document.getElementById('strengthLabel');
    let score = 0;
    if (senha.length >= 6) score++;
    if (senha.length >= 10) score++;
    if (/[A-Z]/.test(senha)) score++;
    if (/[0-9]/.test(senha)) score++;
    if (/[^a-zA-Z0-9]/.test(senha)) score++;

    const levels = [
        { pct: '0%', color: '', text: '' },
        { pct: '25%', color: '#ff4757', text: 'Muito fraca' },
        { pct: '50%', color: '#ffa502', text: 'Fraca' },
        { pct: '75%', color: '#eccc68', text: 'Boa' },
        { pct: '90%', color: '#2ed573', text: 'Forte' },
        { pct: '100%', color: '#00d9ff', text: 'Muito forte' },
    ];
    const lvl = levels[Math.min(score, 5)];
    bar.style.width = lvl.pct;
    bar.style.background = lvl.color;
    label.textContent = lvl.text;
    label.style.color = lvl.color;
}


// LOADING STATE

function setLoading(btnId, spinnerId, iconId, loading) {
    document.getElementById(btnId).disabled = loading;
    document.getElementById(spinnerId).style.display = loading ? 'block' : 'none';
    document.getElementById(iconId).style.display = loading ? 'none' : 'inline';
}


// LOGIN

function fazerLogin() {
    const email = document.getElementById('loginEmail').value.trim().toLowerCase();
    const senha = document.getElementById('loginSenha').value;
    esconderErro('erroLogin');

    if (!email || !senha) {
        mostrarErro('erroLogin', 'Preencha todos os campos.');
        return;
    }

    setLoading('btnLogin', 'spinnerLogin', 'iconLogin', true);

    setTimeout(() => {
        const users = getUsers();
        const user = users[email];

        if (!user || user.senha !== btoa(senha)) {
            mostrarErro('erroLogin', 'Email ou senha incorretos.');
            setLoading('btnLogin', 'spinnerLogin', 'iconLogin', false);
            return;
        }

        setSession(user);
        window.location.href = 'index.html';
    }, 600);
}


// CADASTRO

function fazerCadastro() {
    const nome = document.getElementById('cadNome').value.trim();
    const email = document.getElementById('cadEmail').value.trim().toLowerCase();
    const senha = document.getElementById('cadSenha').value;
    esconderErro('erroCadastro');

    if (!nome || !email || !senha) {
        mostrarErro('erroCadastro', 'Preencha todos os campos.');
        return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        mostrarErro('erroCadastro', 'Email invalido.');
        return;
    }
    if (senha.length < 6) {
        mostrarErro('erroCadastro', 'A senha deve ter no mínimo 6 caracteres.');
        return;
    }

    setLoading('btnCadastro', 'spinnerCadastro', 'iconCadastro', true);

    setTimeout(() => {
        const users = getUsers();

        if (users[email]) {
            mostrarErro('erroCadastro', 'Este email ja esta cadastrado.');
            setLoading('btnCadastro', 'spinnerCadastro', 'iconCadastro', false);
            return;
        }

        const newUser = {
            id: 'user_' + Date.now(),
            nome,
            email,
            senha: btoa(senha), // codificacão basica
            criadoEm: new Date().toISOString()
        };

        users[email] = newUser;
        saveUsers(users);
        setSession(newUser);

        document.getElementById('sucessoCadastro').classList.add('show');
        setTimeout(() => { window.location.href = 'index.html'; }, 1200);
    }, 600);
}

// Enter para submeter
document.addEventListener('keydown', (e) => {
    if (e.key !== 'Enter') return;
    const loginAtivo = document.getElementById('formLogin').classList.contains('active');
    if (loginAtivo) fazerLogin();
    else fazerCadastro();
});