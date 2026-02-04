// Funcoes compartilhadas entre todas as paginas

let codes = [];

// Storage - usando variavel em memoria
function loadCodes() {
    // Codigos de exemplo iniciais
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

// Modal Functions
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
        alert('Codigo copiado para a area de transferência!');
    });
}

function copyCode(id) {
    const code = codes.find(c => c.id === id);
    if (!code) return;

    navigator.clipboard.writeText(code.code).then(() => {
        alert('Codigo copiado para a area de transferência!');
    });
}

function deleteCode(id) {
    if (!confirm('Tem certeza que deseja excluir este codigo?')) return;

    codes = codes.filter(c => c.id !== id);
    
    // Recarrega a pagina atual para atualizar a lista
    window.location.reload();
}

// Click outside modal to close
document.addEventListener('DOMContentLoaded', () => {
    const modal = document.getElementById('codeModal');
    if (modal) {
        modal.addEventListener('click', (e) => {
            if (e.target.id === 'codeModal') {
                closeModal();
            }
        });
    }
});

// Initialize
loadCodes();