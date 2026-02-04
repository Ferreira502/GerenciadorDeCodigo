// Funcoes específicas da pagina de categorias

let currentCategory = null;

// Categories
function renderCategories() {
    const grid = document.getElementById('categoriesGrid');
    const languageCounts = {};

    codes.forEach(code => {
        languageCounts[code.language] = (languageCounts[code.language] || 0) + 1;
    });

    const languageIcons = {
        'JavaScript': '🟨',
        'Python': '🐍',
        'Java': '☕',
        'C++': '⚙️',
        'C#': '🔷',
        'PHP': '🐘',
        'Ruby': '💎',
        'Go': '🐹',
        'Rust': '🦀',
        'HTML': '🌐',
        'CSS': '🎨',
        'SQL': '🗄️',
        'TypeScript': '📘',
        'Outro': '📄'
    };

    if (Object.keys(languageCounts).length === 0) {
        grid.innerHTML = `
            <div class="empty-state" style="grid-column: 1 / -1;">
                <p>Nenhuma categoria ainda</p>
            </div>
        `;
        document.getElementById('categoryCodesList').innerHTML = `
            <div class="empty-state">
                <p>Adicione códigos para ver as categorias</p>
            </div>
        `;
        return;
    }

    grid.innerHTML = Object.entries(languageCounts).map(([lang, count]) => `
        <div class="category-card" onclick="filterByCategory('${lang}')">
            <div class="category-icon">${languageIcons[lang] || '📄'}</div>
            <div class="category-name">${lang}</div>
            <div class="category-count">${count} código${count > 1 ? 's' : ''}</div>
        </div>
    `).join('');

    if (currentCategory) {
        filterByCategory(currentCategory);
    } else {
        document.getElementById('categoryCodesList').innerHTML = `
            <div class="empty-state">
                <p>Selecione uma categoria para ver os códigos</p>
            </div>
        `;
    }
}

function filterByCategory(language) {
    currentCategory = language;
    const list = document.getElementById('categoryCodesList');
    const filtered = codes.filter(code => code.language === language);

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

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
    renderCategories();
});