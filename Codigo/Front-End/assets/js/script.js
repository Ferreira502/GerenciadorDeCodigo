// AUTENTICACAO — compartilhado em todas as paginas

const AUTH_SESSION_KEY = 'cv_session';

function getSession() {
    return JSON.parse(localStorage.getItem(AUTH_SESSION_KEY) || 'null');
}
function logout() {
    localStorage.removeItem(AUTH_SESSION_KEY);
    window.location.href = 'cadastro.html';
}

// Protege a rota: redireciona para auth se nao estiver logado
const session = getSession();
if (!session) {
    window.location.href = 'cadastro.html';
}


// STORAGE ISOLADO POR USUARIO

function storageKey() {
    return 'cv_codes_' + session.id;
}

let codes = [];

function loadCodes() {
    try {
        const stored = localStorage.getItem(storageKey());
        if (stored) {
            codes = JSON.parse(stored);
        } else {
            codes = [];
        }
    } catch (e) {
        console.error('Erro ao carregar codigos:', e);
        codes = [];
    }
}

function saveCodes() {
    try {
        localStorage.setItem(storageKey(), JSON.stringify(codes));
    } catch (e) {
        console.error('Erro ao salvar:', e);
        showToast('Erro ao salvar: armazenamento cheio ou indisponível.', 'error');
    }
}

function addCode(newCode) {
    codes.push(newCode);
    saveCodes();
}

function removeCode(id) {
    codes = codes.filter(c => c.id !== id);
    saveCodes();
}

function updateCode(id, updates) {
    const i = codes.findIndex(c => c.id === id);
    if (i !== -1) { codes[i] = { ...codes[i], ...updates }; saveCodes(); }
}


// UTILITARIOS

function formatDate(dateString) {
    return new Date(dateString).toLocaleDateString('pt-BR', {
        day: '2-digit', month: '2-digit', year: 'numeric'
    });
}

function escapeHtml(text) {
    return String(text).replace(/[&<>"']/g, m =>
        ({ '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;' }[m])
    );
}

function toggleTheme() {
    document.body.classList.toggle('light-theme');
}


// TOAST

function showToast(message, type = 'success') {
    const existing = document.querySelector('.cv-toast');
    if (existing) existing.remove();

    const toast = document.createElement('div');
    toast.className = 'cv-toast';
    toast.innerHTML = `<i class="fa-solid ${type === 'success' ? 'fa-circle-check' : 'fa-circle-exclamation'}"></i> ${message}`;
    toast.style.cssText = `
        position: fixed; bottom: 2rem; right: 2rem;
        background: ${type === 'success'
            ? 'linear-gradient(135deg, #00d9ff, #00ffc8)'
            : 'linear-gradient(135deg, #ff4757, #ff6b81)'};
        color: ${type === 'success' ? '#1a1d29' : '#fff'};
        padding: 13px 22px; border-radius: 10px; font-weight: 700;
        font-size: 0.92rem; z-index: 9999; display: flex; align-items: center; gap: 8px;
        box-shadow: 0 8px 30px rgba(0,0,0,0.4);
        animation: cvToastIn 0.3s ease; font-family: 'Quicksand', sans-serif;
    `;
    const s = document.createElement('style');
    s.textContent = '@keyframes cvToastIn { from{transform:translateY(16px);opacity:0} to{transform:translateY(0);opacity:1} }';
    document.head.appendChild(s);
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 3000);
}


// MODAL

function viewCode(id) {
    const code = codes.find(c => c.id === id);
    if (!code) return;
    document.getElementById('modalTitle').textContent       = code.title;
    document.getElementById('modalLanguage').textContent    = code.language;
    document.getElementById('modalDescription').textContent = code.description || 'Sem descricao';
    document.getElementById('modalDate').textContent        = 'Criado em ' + formatDate(code.date);
    document.getElementById('modalCode').textContent        = code.code;
    document.getElementById('codeModal').classList.add('active');
}

function closeModal() {
    document.getElementById('codeModal').classList.remove('active');
}

function copyModalCode() {
    navigator.clipboard.writeText(document.getElementById('modalCode').textContent)
        .then(() => showToast('Codigo copiado!'));
}

function copyCode(id) {
    const code = codes.find(c => c.id === id);
    if (!code) return;
    navigator.clipboard.writeText(code.code).then(() => showToast('Codigo copiado!'));
}

function deleteCode(id) {
    if (!confirm('Tem certeza que deseja excluir este codigo?')) return;
    removeCode(id);
    window.location.reload();
}


// HEADER COM USUARIO + LOGOUT

function injectUserMenu() {
    const header = document.querySelector('header');
    if (!header || !session) return;

    const old = header.querySelector('.user-menu');
    if (old) old.remove();

    const menu = document.createElement('div');
    menu.className = 'user-menu';
    menu.style.cssText = 'display: flex; align-items: center; gap: 12px;';
    menu.innerHTML =
        '<div style="text-align:right; line-height:1.3;">' +
            '<div style="font-size:0.85rem; font-weight:700; color:#fff; max-width:140px; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">' +
                escapeHtml(session.nome) +
            '</div>' +
            '<div style="font-size:0.75rem; color:#666;">' + escapeHtml(session.email) + '</div>' +
        '</div>' +
        '<button onclick="logout()" title="Sair" style="' +
            'background: rgba(255,71,87,0.15); border: 1px solid rgba(255,71,87,0.3);' +
            'color: #ff6b7a; border-radius: 8px; padding: 8px 14px;' +
            'cursor: pointer; font-size: 0.85rem; font-weight: 600;' +
            'font-family: Quicksand, sans-serif;' +
            'display: flex; align-items: center; gap: 6px; transition: all 0.3s;"' +
            'onmouseover="this.style.background=\'rgba(255,71,87,0.25)\'"' +
            'onmouseout="this.style.background=\'rgba(255,71,87,0.15)\'">' +
            '<i class="fa-solid fa-right-from-bracket"></i> Sair' +
        '</button>';

    const themeBtn = header.querySelector('.theme-toggle');
    if (themeBtn) header.insertBefore(menu, themeBtn);
    else header.appendChild(menu);
}


// EVENTOS GLOBAIS

document.addEventListener('DOMContentLoaded', () => {
    const modal = document.getElementById('codeModal');
    if (modal) {
        modal.addEventListener('click', e => {
            if (e.target.id === 'codeModal') closeModal();
        });
    }
    injectUserMenu();
});

// Inicializa carregando os dados do usuario logado
loadCodes();