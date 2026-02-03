let codes = [];
let currentCategory = null;

// Navigation
function navigateTo(page) {
    document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
    document.querySelectorAll('nav a').forEach(a => a.classList.remove('active'));

    document.getElementById(`${page}-screen`).classList.add('active');
    document.querySelector(`[data-page="${page}"]`)?.classList.add('active');

    if (page === 'home') {
        updateStats();
        updateRecentActivity();
    } else if (page === 'manager') {
        renderCodes();
    } else if (page === 'categories') {
        renderCategories();
    }
}

// Storage - usando variável em memória ao invés de localStorage
function loadCodes() {
    // Códigos de exemplo iniciais
    if (codes.length === 0) {
        codes = [
            {
                id: Date.now() + 1,
                title: 'Validação de Email',
                language: 'JavaScript',
                description: 'Função para validar endereços de email',
                code: 'function validateEmail(email) {\n  const regex = /^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$/;\n  return regex.test(email);\n}',
                date: new Date().toISOString(),
                favorite: false
            }
        ];
    }
    updateStats();
    updateRecentActivity();
}

// Stats
function updateStats() {
    document.getElementById('totalCodes').textContent = codes.length;

    const langs = new Set(codes.map(c => c.language));
    document.getElementById('totalLanguages').textContent = langs.size;

    const month = new Date().getMonth();
    const thisMonth = codes.filter(c => new Date(c.date).getMonth() === month);
    document.getElementById('thisMonth').textContent = thisMonth.length;
}

// Recent Activity
function updateRecentActivity() {
    const list = document.getElementById('recentActivity');

    if (codes.length === 0) {
        list.innerHTML = `
                    <div class="empty-state">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M16 18L22 12L16 6M8 6L2 12L8 18"></path>
                        </svg>
                        <p style="margin-top: 1rem; font-size: 1.1rem;">Nenhum código salvo ainda</p>
                        <p style="margin-top: 0.5rem;">Adicione seu primeiro snippet para começar!</p>
                    </div>
                `;
        return;
    }

    const recent = [...codes].sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 5);

    list.innerHTML = recent.map(code => `
                <div class="activity-item" onclick="viewCode(${code.id})">
                    <div class="activity-icon">💻</div>
                    <div class="activity-content">
                        <div class="activity-title">${code.title}</div>
                        <div class="activity-meta">
                            <span class="activity-lang">${code.language}</span>
                            <span style="margin-left: 10px;">${formatDate(code.date)}</span>
                        </div>
                    </div>
                </div>
            `).join('');
}

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

    // Limpar formulário
    document.getElementById('codeTitle').value = '';
    document.getElementById('codeLanguage').value = '';
    document.getElementById('codeDescription').value = '';
    document.getElementById('codeContent').value = '';

    renderCodes();
    updateStats();
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

// Modal
function viewCode(id) {
    const code = codes.find(c => c.id === id);
    if (!code) return;

    document.getElementById('modalTitle').textContent = code.title;
    document.getElementById('modalLanguage').textContent = code.language;
    document.getElementById('modalDescription').textContent = code.description || 'Sem descrição';
    document.getElementById('modalDate').textContent = `Criado em ${formatDate(code.date)}`;
    document.getElementById('modalCode').textContent = code.code;

    document.getElementById('codeModal').classList.add('active');
}

function closeModal() {
    document.getElementById('codeModal').classList.remove('active');
}

function copyModalCode() {
    const code = document.getElementById('modalCode').textContent;
    navigator.clipboard.writeText(code).then(() => {
        alert('Código copiado para a área de transferência!');
    });
}

function copyCode(id) {
    const code = codes.find(c => c.id === id);
    if (!code) return;

    navigator.clipboard.writeText(code.code).then(() => {
        alert('Código copiado para a área de transferência!');
    });
}

function deleteCode(id) {
    if (!confirm('Tem certeza que deseja excluir este código?')) return;

    codes = codes.filter(c => c.id !== id);
    renderCodes();
    renderCategories();
    updateStats();
    updateRecentActivity();
}

function filterFavorites() {
    navigateTo('manager');
    setTimeout(() => {
        const favorites = codes.filter(c => c.favorite);
        const list = document.getElementById('codeList');

        if (favorites.length === 0) {
            list.innerHTML = `
                        <div class="empty-state">
                            <p>Nenhum código favorito ainda</p>
                        </div>
                    `;
        }
    }, 100);
}

// Utility Functions
function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
    });
}

function escapeHtml(text) {
    const map = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#039;'
    };
    return text.replace(/[&<>"']/g, m => map[m]);
}

function toggleTheme() {
    document.body.classList.toggle('light-theme');
}

// Click outside modal to close
document.getElementById('codeModal').addEventListener('click', (e) => {
    if (e.target.id === 'codeModal') {
        closeModal();
    }
});

// Initialize
loadCodes();
renderCodes();
updateStats();
updateRecentActivity();