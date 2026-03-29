// categories.js — pagina de categorias via API

let codigos = [];
let categoriaAtual = null;
const ICONES = {
    'JavaScript': '<i class="fa-brands fa-js"></i>',
    'Python':     '<i class="fa-brands fa-python"></i>',
    'Java':       '<i class="fa-brands fa-java"></i>',
    'C++':        '<i class="fa-solid fa-code"></i>',
    'C#':         '<i class="fa-solid fa-code"></i>',
    'PHP':        '<i class="fa-brands fa-php"></i>',
    'Ruby':       '<i class="fa-solid fa-gem"></i>',
    'Go':         '<i class="fa-solid fa-code"></i>',
    'Rust':       '<i class="fa-solid fa-code"></i>',
    'HTML':       '<i class="fa-brands fa-html5"></i>',
    'CSS':        '<i class="fa-brands fa-css3-alt"></i>',
    'SQL':        '<i class="fa-solid fa-database"></i>',
    'TypeScript': '<i class="fa-brands fa-js"></i>',
    'Outro':      '<i class="fa-solid fa-file-code"></i>'
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
        grid.innerHTML = `<div class="estado-vazio" style="grid-column:1/-1;"><p>Nenhuma categoria ainda</p></div>`;
        document.getElementById('categoryCodesList').innerHTML =
            `<div class="estado-vazio"><p>Adicione códigos para ver as categorias</p></div>`;
        return;
    }
    grid.innerHTML = Object.entries(contagem).map(([lang, count]) => `
        <div class="cartao-categoria" onclick="filtrarPorCategoria('${escapeHtml(lang)}')">
            <div class="icone-categoria">${ICONES[lang] || '<i class="fa-solid fa-file-code"></i>'}</div>
            <div class="nome-categoria">${escapeHtml(lang)}</div>
            <div class="contagem-categoria">${count} código${count > 1 ? 's' : ''}</div>
        </div>`).join('');
    if (categoriaAtual) {
        filtrarPorCategoria(categoriaAtual);
    } else {
        document.getElementById('categoryCodesList').innerHTML =
            `<div class="estado-vazio"><p>Selecione uma categoria para ver os códigos</p></div>`;
    }
}

function filtrarPorCategoria(linguagem) {
    categoriaAtual = linguagem;
    const list = document.getElementById('categoryCodesList');
    const filtrados = codigos.filter(c => c.linguagem === linguagem);
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
                <button class="btn botao-perigo"     onclick="deleteCodeCategoria(${c.id})"><i class="fa-solid fa-trash"></i> Excluir</button>
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