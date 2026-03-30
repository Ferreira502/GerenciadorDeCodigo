// groups.js — Página de grupos

const CORES = ['#00d9ff','#00ffc8','#9d6af5','#ffd166','#ff4d6d','#ff8c42','#60b4ff','#f77fff'];

let grupos          = [];
let codigos         = [];
let grupoExpandidoId = null;
let codigoModal     = null;

document.addEventListener('DOMContentLoaded', async () => {
    await injectUserMenu();
    [grupos, codigos] = await Promise.all([listarGrupos(), listarCodigos()]);
    renderizar();
    document.getElementById('badgeGrupos').textContent = grupos.length;
    document.getElementById('modal').addEventListener('click', e => { if (e.target.id === 'modal') fecharModal(); });
    document.getElementById('codeModal').addEventListener('click', e => { if (e.target.id === 'codeModal') fecharModalCodigo(); });
});

// ── Modal grupo ───────────────────────────────────────────────────────────────

function abrirModal(g = null) {
    document.getElementById('editId').value    = g ? g.id : '';
    document.getElementById('nome').value      = g ? g.nome : '';
    document.getElementById('descricao').value = g ? (g.descricao || '') : '';
    document.getElementById('modalTitulo').textContent = g ? 'Editar Grupo' : 'Criar Grupo';
    renderCores(g ? g.cor : CORES[0]);
    document.getElementById('modal').classList.add('active');
}

function fecharModal() {
    document.getElementById('modal').classList.remove('active');
}

function renderCores(sel) {
    document.getElementById('seletorCores').innerHTML = CORES.map(c =>
        `<div class="cor-swatch${c === sel ? ' selecionada' : ''}" style="background:${c}"
              onclick="document.querySelectorAll('.cor-swatch').forEach(s=>s.classList.remove('selecionada'));this.classList.add('selecionada')"></div>`
    ).join('');
}

function getCorSel() {
    const s = document.querySelector('.cor-swatch.selecionada');
    return s ? s.style.background : CORES[0];
}

// ── Modal código ──────────────────────────────────────────────────────────────

function verCodigo(c, event) {
    event.stopPropagation();
    codigoModal = c;
    document.getElementById('modalTitle').textContent       = c.titulo;
    document.getElementById('modalLanguage').textContent    = c.linguagem;
    document.getElementById('modalDescription').textContent = c.descricao || 'Sem descrição';
    document.getElementById('modalDate').textContent        = 'Criado em ' + formatDate(c.criadoEm);
    document.getElementById('modalCode').textContent        = c.codigo;
    document.getElementById('codeModal').classList.add('active');
}

function fecharModalCodigo() {
    document.getElementById('codeModal').classList.remove('active');
}

function copiarModalCodigo() {
    if (codigoModal) navigator.clipboard.writeText(codigoModal.codigo).then(() => showToast('Código copiado!'));
}

// ── Expandir / recolher grupo ─────────────────────────────────────────────────

function toggleGrupo(id, event) {
    if (event.target.closest('.grupo-acoes')) return;
    grupoExpandidoId = grupoExpandidoId === id ? null : id;
    renderizar();
}

// ── CRUD ──────────────────────────────────────────────────────────────────────

async function salvar() {
    const nome   = document.getElementById('nome').value.trim();
    const desc   = document.getElementById('descricao').value.trim();
    const cor    = getCorSel();
    const editId = document.getElementById('editId').value;

    if (!nome) { showToast('Nome é obrigatório.', 'error'); return; }

    let ok, data;
    if (editId) {
        ({ ok, data } = await atualizarGrupo(parseInt(editId), nome, desc, cor));
    } else {
        ({ ok, data } = await criarGrupo(nome, desc, cor));
    }

    if (!ok) { showToast(data.erro || 'Erro ao salvar.', 'error'); return; }

    if (editId) {
        grupos = grupos.map(g => g.id === parseInt(editId) ? { ...g, nome, descricao: desc, cor } : g);
        showToast('Grupo atualizado!');
    } else {
        grupos.unshift(data);
        showToast('Grupo criado!');
    }

    fecharModal();
    renderizar();
    document.getElementById('badgeGrupos').textContent = grupos.length;
}

async function excluir(id, event) {
    event.stopPropagation();
    if (!confirm('Remover este grupo? Os códigos não serão apagados.')) return;
    const ok = await deletarGrupo(id);
    if (!ok) { showToast('Erro ao excluir.', 'error'); return; }
    grupos = grupos.filter(g => g.id !== id);
    if (grupoExpandidoId === id) grupoExpandidoId = null;
    renderizar();
    document.getElementById('badgeGrupos').textContent = grupos.length;
    showToast('Grupo removido.');
}

function editarGrupo(g, event) {
    event.stopPropagation();
    abrirModal(g);
}

// ── Render ────────────────────────────────────────────────────────────────────

function renderizar() {
    const el = document.getElementById('gradeGrupos');

    if (!grupos.length) {
        el.innerHTML = `
            <div class="estado-vazio" style="grid-column:1/-1">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M22 19a2 2 0 01-2 2H4a2 2 0 01-2-2V5a2 2 0 012-2h5l2 3h9a2 2 0 012 2z"/>
                </svg>
                <p>Nenhum grupo ainda.<br>Clique em "+ Novo Grupo" para começar!</p>
            </div>`;
        return;
    }

    el.innerHTML = grupos.map(g => {
        const codsDoGrupo = codigos.filter(c => (c.grupos || []).includes(g.id));
        const qtd         = codsDoGrupo.length;
        const expandido   = grupoExpandidoId === g.id;

        const itensHtml = codsDoGrupo.length
            ? codsDoGrupo.map(c => `
                <div class="item-codigo-grupo" onclick="verCodigo(${JSON.stringify(c).replace(/"/g,'&quot;')}, event)">
                    <div class="item-codigo-grupo-topo">
                        <div class="item-codigo-grupo-titulo">${escapeHtml(c.titulo)}</div>
                        <span class="item-codigo-grupo-badge">${escapeHtml(c.linguagem)}</span>
                    </div>
                    ${c.descricao ? `<div class="item-codigo-grupo-desc">${escapeHtml(c.descricao)}</div>` : ''}
                    <div class="item-codigo-grupo-previa">${escapeHtml((c.codigo || '').substring(0, 120))}</div>
                    <div class="item-codigo-grupo-rodape">
                        <span class="item-codigo-grupo-data">${formatDate(c.criadoEm)}</span>
                        <div class="item-codigo-grupo-acoes" onclick="event.stopPropagation()">
                            <button class="btn-icone" onclick="verCodigo(${JSON.stringify(c).replace(/"/g,'&quot;')}, event)" title="Ver código">
                                <i class="fa-solid fa-eye"></i>
                            </button>
                            <button class="btn-icone" onclick="navigator.clipboard.writeText(${JSON.stringify(c.codigo).replace(/"/g,'&quot;')}).then(()=>showToast('Copiado!'))" title="Copiar">
                                <i class="fa-solid fa-copy"></i>
                            </button>
                        </div>
                    </div>
                </div>`).join('')
            : `<div class="grupo-vazio">
                    <i class="fa-solid fa-inbox"></i>
                    Nenhum código neste grupo ainda.
               </div>`;

        return `
        <div class="cartao-grupo${expandido ? ' expandido' : ''}" onclick="toggleGrupo(${g.id}, event)">
            <div class="grupo-cabecalho">
                <div class="grupo-ponto" style="background:${g.cor}"></div>
                <span class="grupo-nome">${escapeHtml(g.nome)}</span>
                <div class="grupo-acoes">
                    <button class="btn-icone" onclick="editarGrupo(${JSON.stringify(g).replace(/"/g,'&quot;')}, event)" title="Editar">
                        <i class="fa-solid fa-pen"></i>
                    </button>
                    <button class="btn-icone perigo" onclick="excluir(${g.id}, event)" title="Excluir">
                        <i class="fa-solid fa-trash"></i>
                    </button>
                </div>
                <i class="fa-solid fa-chevron-down grupo-chevron"></i>
            </div>
            <div class="grupo-corpo">
                ${g.descricao ? `<div class="grupo-desc">${escapeHtml(g.descricao)}</div>` : ''}
                <div class="grupo-contagem-linha">
                    <span class="grupo-info">${qtd} ${qtd === 1 ? 'código' : 'códigos'}</span>
                    <span class="grupo-expandir-hint">${expandido ? 'fechar ↑' : 'ver códigos ↓'}</span>
                </div>
            </div>
            <div class="grupo-expandido-conteudo">
                <div class="grupo-expandido-inner">
                    <div class="grupo-expandido-titulo">
                        <i class="fa-solid fa-code" style="color:#9d6af5;margin-right:5px"></i>
                        Códigos do grupo
                    </div>
                    ${itensHtml}
                </div>
            </div>
        </div>`;
    }).join('');
}