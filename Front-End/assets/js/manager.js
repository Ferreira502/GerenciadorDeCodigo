// Funcoes especificas da pagina de gerenciamento

// Form Submit
function handleSubmit() {
    const title = document.getElementById('codeTitle').value.trim();
    const language = document.getElementById('codeLanguage').value;
    const description = document.getElementById('codeDescription').value.trim();
    const content = document.getElementById('codeContent').value.trim();

    if (!title || !language || !content) {
        showToast('Por favor, preencha todos os campos obrigatorios!', 'error');
        return;
    }

    const newCode = {
        id: Date.now(),
        title,
        language,
        description,
        code: content,
        date: new Date().toISOString(),
        favorite: false
    };

    addCode(newCode); // salva no localStorage

    // Limpar formulario
    document.getElementById('codeTitle').value = '';
    document.getElementById('codeLanguage').value = '';
    document.getElementById('codeDescription').value = '';
    document.getElementById('codeContent').value = '';

    renderCodes();
    showToast('Codigo salvo com sucesso!');
}

// Render Codes
function renderCodes(filter = '') {
    const list = document.getElementById('codeList');

    const filtered = codes.filter(code =>
        code.title.toLowerCase().includes(filter.toLowerCase()) ||
        code.language.toLowerCase().includes(filter.toLowerCase()) ||
        (code.description || '').toLowerCase().includes(filter.toLowerCase())
    );

    if (filtered.length === 0) {
        list.innerHTML = `
            <div class="empty-state">
                <p>Nenhum codigo encontrado</p>
            </div>
        `;
        return;
    }

    list.innerHTML = filtered.map(code => `
        <div class="code-item">
            <div class="code-item-header">
                <div class="code-item-title">${escapeHtml(code.title)}</div>
                <span class="code-item-language">${escapeHtml(code.language)}</span>
            </div>
            ${code.description ? `<div class="code-item-description">${escapeHtml(code.description)}</div>` : ''}
            <div class="code-item-date">Criado em ${formatDate(code.date)}</div>
            <div class="code-preview">${escapeHtml(code.code.substring(0, 150))}...</div>
            <div class="code-item-actions">
                <button class="btn btn-secondary" onclick="viewCode(${code.id})">👁️ Ver</button>
                <button class="btn btn-secondary" onclick="copyCode(${code.id})">📋 Copiar</button>
                <button class="btn btn-danger" onclick="deleteCode(${code.id})">🗑️ Excluir</button>
            </div>
        </div>
    `).join('');
}

// Search
function handleSearch() {
    const query = document.getElementById('searchInput').value;
    renderCodes(query);
}

// Botoes de exportar/importar
function setupImportExport() {
    const card = document.querySelector('.card');
    if (!card) return;

    const toolbar = document.createElement('div');
    toolbar.style.cssText = 'display:flex; gap:10px; margin-bottom:1.2rem;';
    toolbar.innerHTML = `
        <button class="btn btn-secondary" onclick="exportCodes()" title="Exportar todos os codigos como JSON" style="flex:1;">
            <i class="fa-solid fa-file-export"></i> Exportar JSON
        </button>
        <label class="btn btn-secondary" style="flex:1; cursor:pointer;" title="Importar codigos de um arquivo JSON">
            <i class="fa-solid fa-file-import"></i> Importar JSON
            <input type="file" accept=".json" style="display:none;" onchange="handleImport(event)">
        </label>
    `;

    // Insere antes da lista de codigos
    const savedCard = document.querySelectorAll('.card')[1];
    if (savedCard) {
        const searchBox = savedCard.querySelector('.search-box');
        if (searchBox) searchBox.insertAdjacentElement('beforebegin', toolbar);
    }
}

function handleImport(event) {
    const file = event.target.files[0];
    if (file) importCodes(file);
    event.target.value = ''; // reset input
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
    renderCodes();
    setupImportExport();
});