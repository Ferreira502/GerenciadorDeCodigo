// groups.js — Página de grupos

const CORES_GRUPO = ['#00d9ff','#00ffc8','#9d6af5','#ffd166','#ff4d6d','#ff8c42','#60b4ff','#f77fff'];

let grupos  = [];
let codigos = [];

document.addEventListener('DOMContentLoaded', async () => {
    await injectUserMenu();
    [grupos, codigos] = await Promise.all([listarGrupos(), listarCodigos()]);
    renderizarGrupos();
    atualizarBadge();
    if (location.hash === '#novo') abrirModalGrupo();
});

// ── Modal ─────────────────────────────────────────────────────────────────────

function abrirModalGrupo(grupo = null) {
    document.getElementById('editandoGrupoId').value = grupo ? grupo.id : '';
    document.getElementById('grupoNome').value       = grupo ? grupo.nome : '';
    document.getElementById('grupoDescricao').value  = grupo ? (grupo.descricao || '') : '';
    document.getElementById('tituloModalGrupo').textContent = grupo ? 'Editar Grupo' : 'Criar Novo Grupo';
    renderizarSeletorCores(grupo ? grupo.cor : CORES_GRUPO[0]);
    document.getElementById('modalGrupo').classList.add('active');
}

function fecharModalGrupo() {
    document.getElementById('modalGrupo').classList.remove('active');
}

document.addEventListener('DOMContentLoaded', () => {
    const modal = document.getElementById('modalGrupo');
    if (modal) modal.addEventListener('click', e => { if (e.target === modal) fecharModalGrupo(); });
});

function renderizarSeletorCores(selecionada) {
    document.getElementById('seletorCores').innerHTML = CORES_GRUPO.map(c =>
        `<div class="cor-swatch${c === selecionada ? ' selecionada' : ''}"
              style="background:${c}" data-cor="${c}"
              onclick="selecionarCor('${c}')"></div>`
    ).join('');
}

function selecionarCor(cor) {
    document.querySelectorAll('.cor-swatch').forEach(s =>
        s.classList.toggle('selecionada', s.dataset.cor === cor)
    );
}

function getCorSelecionada() {
    const s = document.querySelector('.cor-swatch.selecionada');
    return s ? s.dataset.cor : CORES_GRUPO[0];
}

// ── Salvar ────────────────────────────────────────────────────────────────────

async function salvarGrupo() {
    const nome      = document.getElementById('grupoNome').value.trim();
    const descricao = document.getElementById('grupoDescricao').value.trim();
    const cor       = getCorSelecionada();
    const editId    = document.getElementById('editandoGrupoId').value;

    if (!nome) { showToast('Nome do grupo é obrigatório.', 'error'); return; }

    let ok, data;
    if (editId) {
        ({ ok, data } = await atualizarGrupo(parseInt(editId), nome, descricao, cor));
    } else {
        ({ ok, data } = await criarGrupo(nome, descricao, cor));
    }

    if (!ok) { showToast(data.erro || 'Erro ao salvar grupo.', 'error'); return; }

    if (editId) {
        grupos = grupos.map(g => g.id === parseInt(editId) ? data : g);
        showToast('Grupo atualizado!');
    } else {
        grupos.unshift(data);
        showToast('Grupo criado!');
    }

    fecharModalGrupo();
    renderizarGrupos();
    atualizarBadge();
}

async function excluirGrupo(id) {
    if (!confirm('Remover este grupo? Os códigos não serão apagados.')) return;
    const ok = await deletarGrupo(id);
    if (ok) {
        grupos = grupos.filter(g => g.id !== id);
        renderizarGrupos();
        atualizarBadge();
        showToast('Grupo removido.', 'info');
    } else {
        showToast('Erro ao remover grupo.', 'error');
    }
}

// ── Render ────────────────────────────────────────────────────────────────────

function renderizarGrupos() {
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
        const codsGrupo = codigos.filter(c => (c.grupos || []).includes(g.id));
        const langs = [...new Set(codsGrupo.map(c => c.linguagem))].filter(Boolean);

        return `
        <div class="cartao-grupo">
            <div class="grupo-cabecalho">
                <div class="grupo-ponto" style="background:${g.cor}"></div>
                <span class="grupo-nome">${escapeHtml(g.nome)}</span>
                <div class="grupo-acoes">
                    <button class="btn-icone" onclick="abrirModalGrupo(${JSON.stringify(g).replace(/"/g,'&quot;')})" title="Editar">
                        <i class="fa-solid fa-pen"></i>
                    </button>
                    <button class="btn-icone perigo" onclick="excluirGrupo(${g.id})" title="Excluir">
                        <i class="fa-solid fa-trash"></i>
                    </button>
                </div>
            </div>
            <div class="grupo-corpo">
                ${g.descricao ? `<div class="grupo-desc">${escapeHtml(g.descricao)}</div>` : ''}
                <div class="grupo-linguagens">
                    ${langs.map(l => `<span class="linguagem-badge">${l}</span>`).join('') ||
                      '<span style="font-size:0.72rem;color:var(--texto3)">Sem códigos</span>'}
                </div>
                <div class="grupo-contagem">${codsGrupo.length} ${codsGrupo.length === 1 ? 'código' : 'códigos'}</div>
            </div>
        </div>`;
    }).join('');
}

function atualizarBadge() {
    const el = document.getElementById('badgeGrupos');
    if (el) el.textContent = grupos.length;
}