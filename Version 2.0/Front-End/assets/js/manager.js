// manager.js — Gerenciamento de códigos (com grupos via API)

let codigos = [];
let grupos  = [];
let codigoSelecionadoId = null;
const EXT = { JavaScript:'js', TypeScript:'ts', Python:'py', Java:'java', 'C++':'cpp', 'C#':'cs', PHP:'php', Ruby:'rb', Go:'go', Rust:'rs', HTML:'html', CSS:'css', SQL:'sql', Outro:'txt' };

document.addEventListener('DOMContentLoaded', async () => {
    await injectUserMenu();

    [codigos, grupos] = await Promise.all([listarCodigos(), listarGrupos()]);

    renderPillsGrupos([]);
    renderCodes();
    atualizarBadges();

    // busca via querystring
    const q = new URLSearchParams(location.search).get('q');
    if (q) { document.getElementById('searchInput').value = q; renderCodes(q); }
});

// ── Formulário ────────────────────────────────────────────────────────────────

async function handleSubmit() {
    const titulo    = document.getElementById('codeTitle').value.trim();
    const linguagem = document.getElementById('codeLanguage').value;
    const descricao = document.getElementById('codeDescription').value.trim();
    const codigo    = document.getElementById('codeContent').value.trim();
    const editId    = document.getElementById('editandoCodigoId').value;

    if (!titulo || !linguagem || !codigo) {
        showToast('Preencha título, linguagem e código!', 'error');
        return;
    }

    const gruposSelecionados = [...document.querySelectorAll('#pillsGrupos .pill-grupo.selecionado')]
        .map(p => parseInt(p.dataset.gid));

    const btn = document.querySelector('.painel .btn');
    btn.disabled = true; btn.textContent = 'Salvando...';

    let ok, data;

    if (editId) {
        const delOk = await deletarCodigo(parseInt(editId));
        if (!delOk) {
            showToast('Erro ao atualizar código.', 'error');
            btn.disabled = false;
            btn.innerHTML = '<i class="fa-solid fa-floppy-disk"></i> Salvar Código';
            return;
        }
        ({ ok, data } = await salvarCodigo(titulo, linguagem, descricao, codigo, gruposSelecionados));
    } else {
        ({ ok, data } = await salvarCodigo(titulo, linguagem, descricao, codigo, gruposSelecionados));
    }

    btn.disabled = false;
    btn.innerHTML = '<i class="fa-solid fa-floppy-disk"></i> Salvar Código';

    if (!ok) { showToast(data.erro || 'Erro ao salvar.', 'error'); return; }

    if (editId) {
        codigos = codigos.filter(c => c.id !== parseInt(editId));
    }
    codigos.unshift(data);
    limparFormulario();
    renderCodes();
    atualizarBadges();
    showToast(editId ? 'Código atualizado!' : 'Código salvo com sucesso!');
}

function limparFormulario() {
    ['codeTitle','codeDescription','codeContent'].forEach(id => document.getElementById(id).value = '');
    document.getElementById('codeLanguage').value = '';
    document.getElementById('editandoCodigoId').value = '';
    renderPillsGrupos([]);
}

function cancelarEdicao() {
    limparFormulario();
    document.getElementById('formTitulo').textContent = '➕ Adicionar Código';
    document.getElementById('btnCancelarEdicao').style.display = 'none';
}

function editarCodigo(id) {
    const c = codigos.find(c => c.id === id);
    if (!c) return;
    document.getElementById('editandoCodigoId').value = c.id;
    document.getElementById('codeTitle').value        = c.titulo;
    document.getElementById('codeLanguage').value     = c.linguagem;
    document.getElementById('codeDescription').value  = c.descricao || '';
    document.getElementById('codeContent').value      = c.codigo;
    document.getElementById('formTitulo').textContent = '✏️ Editar Código';
    document.getElementById('btnCancelarEdicao').style.display = '';
    renderPillsGrupos(c.grupos || []);
    document.getElementById('codeTitle').focus();
    document.getElementById('codeTitle').scrollIntoView({ behavior: 'smooth' });
}

// ── Deletar ───────────────────────────────────────────────────────────────────

async function deleteCode(id) {
    if (!confirm('Tem certeza que deseja excluir este código?')) return;
    const ok = await deletarCodigo(id);
    if (ok) {
        codigos = codigos.filter(c => c.id !== id);
        if (codigoSelecionadoId === id) { codigoSelecionadoId = null; resetarVisualizador(); }
        renderCodes();
        atualizarBadges();
        showToast('Código excluído.');
    } else {
        showToast('Erro ao excluir.', 'error');
    }
}

// ── Visualizador ──────────────────────────────────────────────────────────────

function selecionarCodigo(id) {
    codigoSelecionadoId = id;
    const c = codigos.find(c => c.id === id);
    if (!c) return;

    const vis = document.getElementById('codigoVisualizado');
    vis.textContent     = c.codigo;
    vis.style.color     = '';
    vis.style.fontStyle = '';
    document.getElementById('nomeArquivo').textContent = `${c.titulo.toLowerCase().replace(/\s+/g,'-')}.${EXT[c.linguagem]||'txt'}`;
    document.getElementById('rodapeVisualizador').style.display = 'flex';

    const tags = document.getElementById('tagsVisualizador');
    tags.innerHTML = `<span class="linguagem-badge">${c.linguagem}</span>`;
    (c.grupos || []).forEach(gid => {
        const g = grupos.find(g => g.id === gid);
        if (g) tags.innerHTML += `<span class="tag" style="background:${g.cor}22;color:${g.cor};border:1px solid ${g.cor}44">${g.nome}</span>`;
    });

    document.getElementById('dataVisualizador').textContent = formatDate(c.criadoEm);
    document.querySelectorAll('.item-codigo').forEach(el => el.style.borderLeftColor = 'transparent');
    const el = document.querySelector(`.item-codigo[data-id="${id}"]`);
    if (el) el.style.borderLeftColor = 'var(--ciano)';
}

function resetarVisualizador() {
    const vis = document.getElementById('codigoVisualizado');
    vis.textContent     = '// Selecione um código na lista para visualizá-lo aqui.';
    vis.style.color     = 'var(--texto3)';
    vis.style.fontStyle = 'italic';
    document.getElementById('nomeArquivo').textContent = 'nenhum arquivo selecionado';
    document.getElementById('rodapeVisualizador').style.display = 'none';
}

function copiarVisualizador() {
    const code = document.getElementById('codigoVisualizado').textContent;
    navigator.clipboard.writeText(code).then(() => showToast('Código copiado!'));
}

// ── Render ────────────────────────────────────────────────────────────────────

function renderCodes(filtro = '') {
    const f = filtro.toLowerCase();
    const filtrados = codigos.filter(c =>
        c.titulo.toLowerCase().includes(f) ||
        c.linguagem.toLowerCase().includes(f) ||
        (c.descricao || '').toLowerCase().includes(f)
    );

    document.getElementById('contagemCodigos').textContent =
        `${filtrados.length} ${filtrados.length === 1 ? 'item' : 'itens'}`;

    const list = document.getElementById('codeList');
    if (!filtrados.length) {
        list.innerHTML = `<div class="estado-vazio"><p>${codigos.length ? 'Nenhum resultado.' : 'Nenhum código ainda.<br>Preencha o formulário ao lado.'}</p></div>`;
        return;
    }

    list.innerHTML = filtrados.map(c => {
        const groupTags = (c.grupos || []).map(gid => {
            const g = grupos.find(g => g.id === gid);
            return g ? `<span class="tag" style="background:${g.cor}22;color:${g.cor};border:1px solid ${g.cor}44;font-size:0.65rem">${g.nome}</span>` : '';
        }).join('');

        return `
        <div class="item-codigo" data-id="${c.id}" onclick="selecionarCodigo(${c.id})" style="cursor:pointer">
            <div class="cabecalho-codigo">
                <div class="titulo-codigo">${escapeHtml(c.titulo)}</div>
                <span class="linguagem-codigo">${escapeHtml(c.linguagem)}</span>
            </div>
            ${c.descricao ? `<div class="descricao-codigo">${escapeHtml(c.descricao)}</div>` : ''}
            <div class="data-codigo">Criado em ${formatDate(c.criadoEm)}</div>
            <div class="previa-codigo">${escapeHtml((c.codigo||'').substring(0,120))}...</div>
            ${groupTags ? `<div style="display:flex;gap:5px;flex-wrap:wrap;margin-bottom:0.7rem">${groupTags}</div>` : ''}
            <div class="acoes-codigo">
                <button class="btn btn-secundario" onclick="event.stopPropagation();viewCode(${JSON.stringify(c).replace(/"/g,'&quot;')})"><i class="fa-solid fa-eye"></i> Ver</button>
                <button class="btn btn-secundario" onclick="event.stopPropagation();editarCodigo(${c.id})"><i class="fa-solid fa-pen"></i> Editar</button>
                <button class="btn btn-perigo"     onclick="event.stopPropagation();deleteCode(${c.id})"><i class="fa-solid fa-trash"></i> Excluir</button>
            </div>
        </div>`;
    }).join('');
}

function renderPillsGrupos(selecionados = []) {
    const el = document.getElementById('pillsGrupos');
    if (!grupos.length) {
        el.innerHTML = `<span style="font-size:0.75rem;color:var(--texto3)">Crie um grupo primeiro</span>`;
        return;
    }
    el.innerHTML = grupos.map(g => {
        const sel = selecionados.includes(g.id);
        return `<div class="pill-grupo${sel ? ' selecionado' : ''}" data-gid="${g.id}"
                     onclick="this.classList.toggle('selecionado')"
                     style="${sel ? `background:${g.cor}22;border-color:${g.cor};color:${g.cor}` : ''}">${g.nome}</div>`;
    }).join('');
}

function atualizarBadges() {
    const bc = document.getElementById('badgeCodigos');
    const bg = document.getElementById('badgeGrupos');
    if (bc) bc.textContent = codigos.length;
    if (bg) bg.textContent = grupos.length;
}

function handleSearch() {
    renderCodes(document.getElementById('searchInput').value);
}