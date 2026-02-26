// categories.js — página de categorias

let codigos = [];
let categoriaAtual = null;

const ICONES = {
    'JavaScript': '🟨', 'Python': '🐍', 'Java': '☕',
    'C++': '⚙️', 'C#': '🔷', 'PHP': '🐘', 'Ruby': '💎',
    'Go': '🐹', 'Rust': '🦀', 'HTML': '🌐', 'CSS': '🎨',
    'SQL': '🗄️', 'TypeScript': '📘', 'Outro': '📄'
};

document.addEventListener('DOMContentLoaded', async () => {
    await injectUserMenu();
    codigos = await listarCodigos();
    renderCategorias();
});

function renderCategorias() {
    const grid = document.getElementById('categoriesGrid');
    const contagem = {};
    codigos.forEach(c => { contagem[c.linguagem] = (contagem[c.linguagem] || 0) + 1; });

    if (Object.keys(contagem).length === 0) {
        grid.innerHTML = `<div class="empty-state" style="grid-column:1/-1;"><p>Nenhuma categoria ainda</p></div>`;
        document.getElementById('categoryCodesList').innerHTML =
            `<div class="empty-state"><p>Adicione códigos para ver as categorias</p></div>`;
        return;
    }

    grid.innerHTML = Object.entries(contagem).map(([lang, count]) => `
        <div class="category-card" onclick="filtrarPorCategoria('${escapeHtml(lang)}')">
            <div class="category-icon">${ICONES[lang] || '📄'}</div>
            <div class="category-name">${escapeHtml(lang)}</div>
            <div class="category-count">${count} código${count > 1 ? 's' : ''}</div>
        </div>`).join('');

    if (categoriaAtual) {
        filtrarPorCategoria(categoriaAtual);
    } else {
        document.getElementById('categoryCodesList').innerHTML =
            `<div class="empty-state"><p>Selecione uma categoria para ver os códigos</p></div>`;
    }
}

function filtrarPorCategoria(linguagem) {
    categoriaAtual = linguagem;
    const list = document.getElementById('categoryCodesList');
    const filtrados = codigos.filter(c => c.linguagem === linguagem);

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
                <button class="btn btn-danger"    onclick="deleteCodeCategoria(${c.id})">🗑️ Excluir</button>
            </div>
        </div>`).join('');
}

async function deleteCodeCategoria(id) {
    if (!confirm('Deseja excluir este código?')) return;
    const ok = await deletarCodigo(id);
    if (ok) {
        codigos = codigos.filter(c => c.id !== id);
        renderCategorias();
    } else {
        showToast('Erro ao excluir.', 'error');
    }
}