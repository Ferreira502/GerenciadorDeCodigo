// manager.js — pagina de gerenciamento via API

let codigos = [];
document.addEventListener('DOMContentLoaded', async () => {
    await injectUserMenu();
    codigos = await listarCodigos();
    renderCodes();
});

// Salvar usuarios
async function handleSubmit() {
    const titulo    = document.getElementById('codeTitle').value.trim();
    const linguagem = document.getElementById('codeLanguage').value;
    const descricao = document.getElementById('codeDescription').value.trim();
    const codigo    = document.getElementById('codeContent').value.trim();
    if (!titulo || !linguagem || !codigo) {
        showToast('Por favor, preencha todos os campos obrigatórios!', 'error');
        return;
    }
    const btn = document.querySelector('.botao-primario');
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
// Deletar usuarios
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
// Atualizar codigos
function renderCodes(filtro = '') {
    const list = document.getElementById('codeList');
    const filtrados = codigos.filter(c =>
        c.titulo.toLowerCase().includes(filtro.toLowerCase()) ||
        c.linguagem.toLowerCase().includes(filtro.toLowerCase()) ||
        (c.descricao || '').toLowerCase().includes(filtro.toLowerCase())
    );
    if (filtrados.length === 0) {
        list.innerHTML = `<div class="estado-vazio"><p>Nenhum código encontrado</p></div>`;
        return;
    }
    list.innerHTML = filtrados.map(c => `
        <div class="item-codigo">
            <div class="cabecalho-codigo">
                <div class="titulo-codigo">${escapeHtml(c.titulo)}</div>
                <span class="linguagem-codigo">${escapeHtml(c.linguagem)}</span>
            </div>
            ${c.descricao ? `<div class="descricao-codigo">${escapeHtml(c.descricao)}</div>` : ''}
            <div class="data-codigo">Criado em ${formatDate(c.criadoEm)}</div>
            <div class="previa-codigo">${escapeHtml(c.codigo.substring(0, 150))}...</div>
            <div class="acoes-codigo">
                <button class="btn botao-secundario" onclick='viewCode(${JSON.stringify(c)})'><i class="fa-solid fa-eye"></i> Ver</button>
                <button class="btn botao-secundario" onclick='copyCode(${JSON.stringify(c)})'><i class="fa-solid fa-copy"></i> Copiar</button>
                <button class="btn botao-perigo"     onclick="deleteCode(${c.id})"><i class="fa-solid fa-trash"></i> Excluir</button>
            </div>
        </div>`).join('');
}
function handleSearch() {
    renderCodes(document.getElementById('searchInput').value);
}