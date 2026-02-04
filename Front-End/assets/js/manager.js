// Funcoes especificas da pagina de gerenciamento

// Form Submit
function handleSubmit() {
    const title = document.getElementById('codeTitle').value.trim();
    const language = document.getElementById('codeLanguage').value;
    const description = document.getElementById('codeDescription').value.trim();
    const content = document.getElementById('codeContent').value.trim();

    if (!title || !language || !content) {
        alert('Por favor, preencha todos os campos obrigatórios!');
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

    codes.push(newCode);

    // Limpar formulario
    document.getElementById('codeTitle').value = '';
    document.getElementById('codeLanguage').value = '';
    document.getElementById('codeDescription').value = '';
    document.getElementById('codeContent').value = '';

    renderCodes();
    alert('Código salvo com sucesso!');
}

// Render Codes
function renderCodes(filter = '') {
    const list = document.getElementById('codeList');

    const filtered = codes.filter(code =>
        code.title.toLowerCase().includes(filter.toLowerCase()) ||
        code.language.toLowerCase().includes(filter.toLowerCase()) ||
        code.description.toLowerCase().includes(filter.toLowerCase())
    );

    if (filtered.length === 0) {
        list.innerHTML = `
            <div class="empty-state">
                <p>Nenhum código encontrado</p>
            </div>
        `;
        return;
    }

    list.innerHTML = filtered.map(code => `
        <div class="code-item">
            <div class="code-item-header">
                <div class="code-item-title">${code.title}</div>
                <span class="code-item-language">${code.language}</span>
            </div>
            ${code.description ? `<div class="code-item-description">${code.description}</div>` : ''}
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

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
    renderCodes();
});