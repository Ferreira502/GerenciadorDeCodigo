// manager.js — página de gerenciamento

let codigos = [];

document.addEventListener('DOMContentLoaded', async () => {
    await injectUserMenu();
    codigos = await listarCodigos();
    renderCodes();
    setupImportExport();
});

// ─── Salvar ───────────────────────────────────────────────────────────

async function handleSubmit() {
    const titulo    = document.getElementById('codeTitle').value.trim();
    const linguagem = document.getElementById('codeLanguage').value;
    const descricao = document.getElementById('codeDescription').value.trim();
    const codigo    = document.getElementById('codeContent').value.trim();

    if (!titulo || !linguagem || !codigo) {
        showToast('Por favor, preencha todos os campos obrigatórios!', 'error');
        return;
    }

    const btn = document.querySelector('.btn-primary');
    btn.disabled = true;
    btn.textContent = 'Salvando...';

    const { ok, data } = await salvarCodigo(titulo, linguagem, descricao, codigo);

    btn.disabled = false;
    btn.innerHTML = '<i class="fa-solid fa-book"></i> Salvar Código';

    if (!ok) { showToast(data.erro || 'Erro ao salvar.', 'error'); return; }

    codigos.unshift(data);

    document.getElementById('codeTitle').value       = '';
    document.getElementById('codeLanguage').value    = '';
    document.getElementById('codeDescription').value = '';
    document.getElementById('codeContent').value     = '';

    renderCodes();
    showToast('Código salvo com sucesso!');
}

// ─── Deletar ──────────────────────────────────────────────────────────

async function deleteCode(id) {
    if (!confirm('Tem certeza que deseja excluir este código?')) return;
    const ok = await deletarCodigo(id);
    if (ok) {
        codigos = codigos.filter(c => c.id !== id);
        renderCodes();
        showToast('Código excluído.');
    } else {
        showToast('Erro ao excluir.', 'error');
    }
}

// ─── Renderizar ───────────────────────────────────────────────────────

function renderCodes(filtro = '') {
    const list = document.getElementById('codeList');

    const filtrados = codigos.filter(c =>
        c.titulo.toLowerCase().includes(filtro.toLowerCase()) ||
        c.linguagem.toLowerCase().includes(filtro.toLowerCase()) ||
        (c.descricao || '').toLowerCase().includes(filtro.toLowerCase())
    );

    if (filtrados.length === 0) {
        list.innerHTML = `<div class="empty-state"><p>Nenhum código encontrado</p></div>`;
        return;
    }

    list.innerHTML = filtrados.map(c => `
        <div class="code-item">
            <div class="code-item-header">
                <div class="code-item-title">${escapeHtml(c.titulo)}</div>
                <span class="code-item-language">${escapeHtml(c.linguagem)}</span>
            </div>
            ${c.descricao ? `<div class="code-item-description">${escapeHtml(c.descricao)}</div>` : ''}
            <div class="code-item-date">Criado em ${formatDate(c.criadoEm)}</div>
            <div class="code-preview">${escapeHtml(c.codigo.substring(0, 150))}...</div>
            <div class="code-item-actions">
                <button class="btn btn-secondary" onclick='viewCode(${JSON.stringify(c)})'>👁️ Ver</button>
                <button class="btn btn-secondary" onclick='copyCode(${JSON.stringify(c)})'>📋 Copiar</button>
                <button class="btn btn-danger"    onclick="deleteCode(${c.id})">🗑️ Excluir</button>
            </div>
        </div>`).join('');
}

function handleSearch() {
    renderCodes(document.getElementById('searchInput').value);
}

// ─── Export / Import ──────────────────────────────────────────────────

function setupImportExport() {
    const savedCard = document.querySelectorAll('.card')[1];
    if (!savedCard) return;

    const toolbar = document.createElement('div');
    toolbar.style.cssText = 'display:flex;gap:10px;margin-bottom:1.2rem;';
    toolbar.innerHTML = `
        <button class="btn btn-secondary" onclick="exportCodes()" style="flex:1;">
            <i class="fa-solid fa-file-export"></i> Exportar JSON
        </button>
        <label class="btn btn-secondary" style="flex:1;cursor:pointer;">
            <i class="fa-solid fa-file-import"></i> Importar JSON
            <input type="file" accept=".json" style="display:none;" onchange="handleImport(event)">
        </label>`;

    const searchBox = savedCard.querySelector('.search-box');
    if (searchBox) searchBox.insertAdjacentElement('beforebegin', toolbar);
}

function exportCodes() {
    const blob = new Blob([JSON.stringify(codigos, null, 2)], { type: 'application/json' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'meus-codigos.json';
    a.click();
}

async function handleImport(event) {
    const file = event.target.files[0];
    if (!file) return;
    event.target.value = '';

    try {
        const text = await file.text();
        const lista = JSON.parse(text);
        if (!Array.isArray(lista)) throw new Error('Formato inválido');

        let importados = 0;
        for (const item of lista) {
            if (!item.titulo || !item.linguagem || !item.codigo) continue;
            const { ok, data } = await salvarCodigo(item.titulo, item.linguagem, item.descricao || '', item.codigo);
            if (ok) { codigos.unshift(data); importados++; }
        }

        renderCodes();
        showToast(`${importados} código(s) importado(s)!`);
    } catch (e) {
        showToast('Erro ao importar: arquivo inválido.', 'error');
    }
}