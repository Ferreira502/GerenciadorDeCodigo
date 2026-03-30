// api.js — comunicação com o back-end Java

const API = (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')
    ? 'http://localhost:8080/api'
    : 'https://gerenciadordecodigo.onrender.com/api';

// ── AUTH ──────────────────────────────────────────────────────────────────────

async function getMe() {
    try {
        const r = await fetch(`${API}/auth/me`, {
            credentials: 'include',
            headers: { 'Content-Type': 'application/json' }
        });
        return r.ok ? r.json() : null;
    } catch { return null; }
}

async function login(email, senha) {
    const r = await fetch(`${API}/auth/login`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, senha })
    });
    return { ok: r.ok, data: await r.json() };
}

async function cadastro(nome, email, senha) {
    const r = await fetch(`${API}/auth/cadastro`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nome, email, senha })
    });
    return { ok: r.ok, data: await r.json() };
}

async function logout() {
    await fetch(`${API}/auth/logout`, {
        method: 'POST',
        credentials: 'include'
    });
    window.location.href = 'cadastro.html';
}

// ── CÓDIGOS ───────────────────────────────────────────────────────────────────

async function listarCodigos() {
    const r = await fetch(`${API}/codigos`, { credentials: 'include' });
    if (r.status === 401) { window.location.href = 'cadastro.html'; return []; }
    return r.ok ? r.json() : [];
}

async function salvarCodigo(titulo, linguagem, descricao, codigo, grupos = []) {
    const r = await fetch(`${API}/codigos`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ titulo, linguagem, descricao, codigo, grupos })
    });
    return { ok: r.ok, data: await r.json() };
}

async function deletarCodigo(id) {
    const r = await fetch(`${API}/codigos/${id}`, {
        method: 'DELETE',
        credentials: 'include'
    });
    return r.ok;
}

// ── GRUPOS ────────────────────────────────────────────────────────────────────

async function listarGrupos() {
    const r = await fetch(`${API}/grupos`, { credentials: 'include' });
    if (r.status === 401) { window.location.href = 'cadastro.html'; return []; }
    return r.ok ? r.json() : [];
}

async function criarGrupo(nome, descricao, cor) {
    const r = await fetch(`${API}/grupos`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nome, descricao, cor })
    });
    return { ok: r.ok, data: await r.json() };
}

async function atualizarGrupo(id, nome, descricao, cor) {
    const r = await fetch(`${API}/grupos/${id}`, {
        method: 'PUT',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nome, descricao, cor })
    });
    return { ok: r.ok, data: await r.json() };
}

async function deletarGrupo(id) {
    const r = await fetch(`${API}/grupos/${id}`, {
        method: 'DELETE',
        credentials: 'include'
    });
    return r.ok;
}

// ── EXERCÍCIOS ────────────────────────────────────────────────────────────────

async function listarExercicios() {
    const r = await fetch(`${API}/exercicios`, { credentials: 'include' });
    if (r.status === 401) { window.location.href = 'cadastro.html'; return []; }
    return r.ok ? r.json() : [];
}

async function criarExercicio(dados) {
    const r = await fetch(`${API}/exercicios`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(dados)
    });
    return { ok: r.ok, data: await r.json() };
}

async function atualizarExercicio(id, dados) {
    const r = await fetch(`${API}/exercicios/${id}`, {
        method: 'PUT',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(dados)
    });
    return { ok: r.ok, data: await r.json() };
}

async function deletarExercicio(id) {
    const r = await fetch(`${API}/exercicios/${id}`, {
        method: 'DELETE',
        credentials: 'include'
    });
    return r.ok;
}

// ── UTILITÁRIOS ───────────────────────────────────────────────────────────────

function formatDate(iso) {
    if (!iso) return '—';
    return new Date(iso).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' });
}

function escapeHtml(t) {
    return String(t || '').replace(/[&<>"']/g, m =>
        ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;' }[m])
    );
}

// ── TOAST ─────────────────────────────────────────────────────────────────────

function showToast(msg, tipo = 'success') {
    const ex = document.querySelector('.toast-ac');
    if (ex) ex.remove();
    const t = document.createElement('div');
    t.className = 'toast-ac';
    t.innerHTML = `<i class="fa-solid ${tipo === 'success' ? 'fa-circle-check' : tipo === 'error' ? 'fa-circle-exclamation' : 'fa-circle-info'}"></i> ${msg}`;
    t.style.cssText = `
        position:fixed;bottom:1.5rem;right:1.5rem;
        background:${tipo === 'error' ? 'linear-gradient(135deg,#ff4757,#ff6b81)' : 'linear-gradient(135deg,#00d9ff,#00ffc8)'};
        color:${tipo === 'error' ? '#fff' : '#0e1117'};
        padding:11px 20px;border-radius:10px;font-weight:700;font-size:0.88rem;
        z-index:9999;display:flex;align-items:center;gap:8px;
        box-shadow:0 8px 30px rgba(0,0,0,.4);
        animation:toastIn .3s ease;font-family:'Space Grotesk',sans-serif;`;
    const s = document.createElement('style');
    s.textContent = '@keyframes toastIn{from{transform:translateY(12px);opacity:0}to{transform:translateY(0);opacity:1}}';
    document.head.appendChild(s);
    document.body.appendChild(t);
    setTimeout(() => t.remove(), 3200);
}

// ── MODAL CÓDIGO ──────────────────────────────────────────────────────────────

let _modalCodigo = null;

function viewCode(code) {
    _modalCodigo = code;
    document.getElementById('modalTitle').textContent = code.titulo;
    document.getElementById('modalLanguage').textContent = code.linguagem;
    document.getElementById('modalDescription').textContent = code.descricao || 'Sem descrição';
    document.getElementById('modalDate').textContent = 'Criado em ' + formatDate(code.criadoEm);
    document.getElementById('modalCode').textContent = code.codigo;
    document.getElementById('codeModal').classList.add('active');
}

function closeModal() { document.getElementById('codeModal').classList.remove('active'); }

function copyModalCode() {
    if (_modalCodigo) navigator.clipboard.writeText(_modalCodigo.codigo).then(() => showToast('Código copiado!'));
}

function copyCode(c) { navigator.clipboard.writeText(c.codigo).then(() => showToast('Código copiado!')); }

// ── MENU DO USUÁRIO ───────────────────────────────────────────────────────────

async function injectUserMenu() {
    const session = await getMe();

    if (!session) {
        if (!window.location.pathname.includes('cadastro')) window.location.href = 'cadastro.html';
        return null;
    }

    const av = document.getElementById('avatarSidebar');
    const nm = document.getElementById('nomeSidebar');
    const em = document.getElementById('emailSidebar');
    const cu = document.getElementById('cartaoUsuario');

    if (av) av.textContent = (session.nome || 'U')[0].toUpperCase();
    if (nm) nm.textContent = session.nome;
    if (em) em.textContent = session.email;
    if (cu) cu.style.display = 'flex';

    const menu = document.getElementById('menuTopbar');
    if (menu) menu.innerHTML = `
        <button onclick="logout()"
            style="background:rgba(255,71,87,.15);border:1px solid rgba(255,71,87,.3);
                   color:#ff6b7a;border-radius:9px;padding:7px 13px;cursor:pointer;
                   font-size:.8rem;font-weight:600;font-family:'Space Grotesk',sans-serif;
                   display:flex;align-items:center;gap:6px;"
            onmouseover="this.style.background='rgba(255,71,87,.25)'"
            onmouseout="this.style.background='rgba(255,71,87,.15)'">
            <i class="fa-solid fa-right-from-bracket"></i> Sair
        </button>`;

    return session;
}

document.addEventListener('DOMContentLoaded', () => {
    const m = document.getElementById('codeModal');
    if (m) m.addEventListener('click', e => { if (e.target === m) closeModal(); });
});