// api.js — API para poder fazer a comunicacao com o banco de dados e o back-end em java

const API = (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')
    ? 'http://localhost:8080/api' 
    : 'https://gerenciadordecodigo-2.onrender.com/api';
    
// Verificacao e autenticacao

async function getMe() {
    try {
        const r = await fetch(`${API}/auth/me`, { credentials: 'include' });
        return r.ok ? r.json() : null;
    } catch (e) {
        return null;
    }
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
    await fetch(`${API}/auth/logout`, { method: 'POST', credentials: 'include' });
    window.location.href = 'cadastro.html';
}

// Codigos

async function listarCodigos() {
    const r = await fetch(`${API}/codigos`, { credentials: 'include' });
    if (r.status === 401) { window.location.href = 'cadastro.html'; return []; }
    return r.ok ? r.json() : [];
}

async function salvarCodigo(titulo, linguagem, descricao, codigo) {
    const r = await fetch(`${API}/codigos`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ titulo, linguagem, descricao, codigo })
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

// Utilitarios

function formatDate(isoString) {
    return new Date(isoString).toLocaleDateString('pt-BR', {
        day: '2-digit', month: '2-digit', year: 'numeric'
    });
}

function escapeHtml(text) {
    return String(text || '').replace(/[&<>"']/g, m =>
        ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;' }[m])
    );
}

// Alerta na tela

function showToast(message, type = 'success') {
    const existing = document.querySelector('.alerta-tela');
    if (existing) existing.remove();

    const toast = document.createElement('div');
    toast.className = 'alerta-tela';
    toast.innerHTML = `<i class="fa-solid ${type === 'success' ? 'fa-circle-check' : 'fa-circle-exclamation'}"></i> ${message}`;
    toast.style.cssText = `
        position:fixed;bottom:2rem;right:2rem;
        background:${type === 'success'
            ? 'linear-gradient(135deg,#00d9ff,#00ffc8)'
            : 'linear-gradient(135deg,#ff4757,#ff6b81)'};
        color:${type === 'success' ? '#1a1d29' : '#fff'};
        padding:13px 22px;border-radius:10px;font-weight:700;
        font-size:0.92rem;z-index:9999;display:flex;align-items:center;gap:8px;
        box-shadow:0 8px 30px rgba(0,0,0,.4);
        animation:cvToastIn .3s ease;font-family:'Quicksand',sans-serif;
    `;
    const s = document.createElement('style');
    s.textContent = '@keyframes cvToastIn{from{transform:translateY(16px);opacity:0}to{transform:translateY(0);opacity:1}}';
    document.head.appendChild(s);
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 3000);
}

// Modal

let _modalCodigo = null;

function viewCode(code) {
    _modalCodigo = code;
    document.getElementById('modalTitle').textContent       = code.titulo;
    document.getElementById('modalLanguage').textContent    = code.linguagem;
    document.getElementById('modalDescription').textContent = code.descricao || 'Sem descrição';
    document.getElementById('modalDate').textContent        = 'Criado em ' + formatDate(code.criadoEm);
    document.getElementById('modalCode').textContent        = code.codigo;
    document.getElementById('codeModal').classList.add('active');
}

function closeModal() {
    document.getElementById('codeModal').classList.remove('active');
}

function copyModalCode() {
    if (!_modalCodigo) return;
    navigator.clipboard.writeText(_modalCodigo.codigo)
        .then(() => showToast('Código copiado!'));
}

function copyCode(code) {
    navigator.clipboard.writeText(code.codigo).then(() => showToast('Código copiado!'));
}

// Header com usuario + logout

async function injectUserMenu() {
    const header = document.querySelector('header');
    if (!header) return;

    const session = await getMe();

    // So redireciona para cadastro se NAO estiver ja na pagina de cadastro
    if (!session) {
        const estaNaCadastro = window.location.pathname.includes('cadastro');
        if (!estaNaCadastro) {
            window.location.href = 'cadastro.html';
        }
        return null;
    }

    const old = header.querySelector('.menu-usuario');
    if (old) old.remove();

    const menu = document.createElement('div');
    menu.className = 'menu-usuario';
    menu.style.cssText = 'display:flex;align-items:center;gap:12px;';
    menu.innerHTML =
        `<div style="text-align:right;line-height:1.3;">
            <div style="font-size:.85rem;font-weight:700;color:#fff;max-width:140px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">${escapeHtml(session.nome)}</div>
            <div style="font-size:.75rem;color:#666;">${escapeHtml(session.email)}</div>
        </div>
        <button onclick="logout()" title="Sair" style="background:rgba(255,71,87,.15);border:1px solid rgba(255,71,87,.3);color:#ff6b7a;border-radius:8px;padding:8px 14px;cursor:pointer;font-size:.85rem;font-weight:600;font-family:Quicksand,sans-serif;display:flex;align-items:center;gap:6px;transition:all .3s;"
            onmouseover="this.style.background='rgba(255,71,87,.25)'"
            onmouseout="this.style.background='rgba(255,71,87,.15)'">
            <i class="fa-solid fa-right-from-bracket"></i> Sair
        </button>`;
    header.appendChild(menu);
    return session;
}

// Fechar modal ao clicar fora

document.addEventListener('DOMContentLoaded', () => {
    const modal = document.getElementById('codeModal');
    if (modal) modal.addEventListener('click', e => { if (e.target.id === 'codeModal') closeModal(); });
});