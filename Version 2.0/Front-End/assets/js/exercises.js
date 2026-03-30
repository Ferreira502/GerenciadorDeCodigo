// exercises.js — Página de exercícios

let exercicios = [];
let exercicioDetalheAtual = null;

document.addEventListener('DOMContentLoaded', async () => {
    await injectUserMenu();
    exercicios = await listarExercicios();
    popularFiltroLinguagem();
    renderizarExercicios();
    atualizarBadge();

    // Fechar modais clicando fora
    document.getElementById('modalFormExercicio').addEventListener('click', e => {
        if (e.target.id === 'modalFormExercicio') fecharModal('modalFormExercicio');
    });
    document.getElementById('modalDetalheExercicio').addEventListener('click', e => {
        if (e.target.id === 'modalDetalheExercicio') fecharModal('modalDetalheExercicio');
    });
});

// ── Modal form ────────────────────────────────────────────────────────────────

function abrirNovoExercicio() {
    document.getElementById('exId').value        = '';
    document.getElementById('exNumero').value    = '';
    document.getElementById('exTitulo').value    = '';
    document.getElementById('exEnunciado').value = '';
    document.getElementById('exEntrada').value   = '';
    document.getElementById('exSaida').value     = '';
    document.getElementById('exDificuldade').value = 'Fácil';
    document.getElementById('exLinguagem').value = '';
    document.getElementById('exStatus').value    = 'pendente';
    document.getElementById('exSolucao').value   = '';
    document.getElementById('exObservacoes').value = '';
    document.getElementById('tituloModalEx').textContent = 'Adicionar Exercício';
    document.getElementById('modalFormExercicio').classList.add('active');
}

function abrirEditarExercicio(ex) {
    document.getElementById('exId').value          = ex.id;
    document.getElementById('exNumero').value      = ex.numero    || '';
    document.getElementById('exTitulo').value      = ex.titulo    || '';
    document.getElementById('exEnunciado').value   = ex.enunciado || '';
    document.getElementById('exEntrada').value     = ex.entrada   || '';
    document.getElementById('exSaida').value       = ex.saida     || '';
    document.getElementById('exDificuldade').value = ex.dificuldade || 'Fácil';
    document.getElementById('exLinguagem').value   = ex.linguagem || '';
    document.getElementById('exStatus').value      = ex.status    || 'pendente';
    document.getElementById('exSolucao').value     = ex.solucao   || '';
    document.getElementById('exObservacoes').value = ex.observacoes || '';
    document.getElementById('tituloModalEx').textContent = 'Editar Exercício';
    document.getElementById('modalFormExercicio').classList.add('active');
}

function fecharModal(id) {
    document.getElementById(id).classList.remove('active');
}

// ── Salvar exercício ──────────────────────────────────────────────────────────

async function salvarExercicioForm() {
    const titulo = document.getElementById('exTitulo').value.trim();
    if (!titulo) { showToast('Título é obrigatório!', 'error'); return; }

    const editId = document.getElementById('exId').value;

    const dados = {
        numero:      document.getElementById('exNumero').value.trim(),
        titulo,
        enunciado:   document.getElementById('exEnunciado').value.trim(),
        entrada:     document.getElementById('exEntrada').value.trim(),
        saida:       document.getElementById('exSaida').value.trim(),
        dificuldade: document.getElementById('exDificuldade').value,
        linguagem:   document.getElementById('exLinguagem').value,
        status:      document.getElementById('exStatus').value,
        solucao:     document.getElementById('exSolucao').value.trim(),
        observacoes: document.getElementById('exObservacoes').value.trim()
    };

    const btn = document.querySelector('#modalFormExercicio .btn');
    btn.disabled = true;
    btn.textContent = 'Salvando...';

    let ok, data;
    if (editId) {
        ({ ok, data } = await atualizarExercicio(parseInt(editId), dados));
    } else {
        ({ ok, data } = await criarExercicio(dados));
    }

    btn.disabled = false;
    btn.innerHTML = '<i class="fa-solid fa-floppy-disk"></i> Salvar Exercício';

    if (!ok) {
        showToast(data.erro || 'Erro ao salvar exercício.', 'error');
        return;
    }

    if (editId) {
        exercicios = exercicios.map(e => e.id === parseInt(editId) ? data : e);
        showToast('Exercício atualizado!');
    } else {
        exercicios.unshift(data);
        showToast('Exercício salvo!');
    }

    fecharModal('modalFormExercicio');
    popularFiltroLinguagem();
    renderizarExercicios();
    atualizarBadge();
}

// ── Deletar ───────────────────────────────────────────────────────────────────

async function excluirExercicio(id) {
    if (!confirm('Tem certeza que deseja excluir este exercício?')) return;
    const ok = await deletarExercicio(id);
    if (ok) {
        exercicios = exercicios.filter(e => e.id !== id);
        popularFiltroLinguagem();
        renderizarExercicios();
        atualizarBadge();
        showToast('Exercício excluído.');
    } else {
        showToast('Erro ao excluir.', 'error');
    }
}

// ── Modal detalhe ─────────────────────────────────────────────────────────────

function abrirDetalhe(ex) {
    exercicioDetalheAtual = ex;

    document.getElementById('detalheNumero').textContent  = ex.numero ? `#${ex.numero}` : '';
    document.getElementById('detalheTitulo').textContent  = ex.titulo;
    document.getElementById('detalheEnunciado').textContent = ex.enunciado || '—';
    document.getElementById('detalheEntrada').textContent = ex.entrada || '—';
    document.getElementById('detalheSaida').textContent   = ex.saida || '—';
    document.getElementById('detalheSolucao').textContent = ex.solucao || '// Nenhuma solução adicionada ainda.';
    document.getElementById('detalheObservacoes').textContent = ex.observacoes || '—';

    const diffClass = { 'Fácil': 'tag-dif-facil', 'Médio': 'tag-dif-medio', 'Difícil': 'tag-dif-dificil' };
    const statusClass = ex.status === 'resolvido' ? 'tag-resolvido' : 'tag-pendente';
    document.getElementById('detalheTags').innerHTML = `
        <span class="tag ${diffClass[ex.dificuldade] || 'tag-dif-facil'}">${ex.dificuldade || 'Fácil'}</span>
        <span class="tag ${statusClass}">${ex.status === 'resolvido' ? '✓ Resolvido' : '⏳ Pendente'}</span>
        ${ex.linguagem ? `<span class="linguagem-badge">${escapeHtml(ex.linguagem)}</span>` : ''}
    `;

    // Esconder seções vazias
    document.getElementById('secaoEntrada').style.display = ex.entrada ? '' : 'none';
    document.getElementById('secaoSaida').style.display   = ex.saida   ? '' : 'none';

    // Reset para aba enunciado
    trocarAba('enunciado', document.querySelector('.aba-modal'));

    document.getElementById('modalDetalheExercicio').classList.add('active');
}

function editarExercicioDoDetalhe() {
    if (!exercicioDetalheAtual) return;
    fecharModal('modalDetalheExercicio');
    abrirEditarExercicio(exercicioDetalheAtual);
}

function copiarSolucao() {
    const sol = document.getElementById('detalheSolucao').textContent;
    navigator.clipboard.writeText(sol).then(() => showToast('Solução copiada!'));
}

// ── Abas do modal detalhe ─────────────────────────────────────────────────────

function trocarAba(nome, btn) {
    document.querySelectorAll('.conteudo-aba').forEach(el => el.classList.remove('ativo'));
    document.querySelectorAll('.aba-modal').forEach(el => el.classList.remove('ativa'));
    document.getElementById(`aba-${nome}`).classList.add('ativo');
    // btn pode ser o elemento clicado ou o primeiro botão (no reset)
    const botaoAtivo = btn && btn.classList ? btn : document.querySelector('.aba-modal');
    if (botaoAtivo) botaoAtivo.classList.add('ativa');
}

// ── Filtros e render ──────────────────────────────────────────────────────────

function popularFiltroLinguagem() {
    const sel = document.getElementById('filtroLinguagem');
    const atual = sel.value;
    const langs = [...new Set(exercicios.map(e => e.linguagem).filter(Boolean))].sort();
    sel.innerHTML = '<option value="">Todas linguagens</option>' +
        langs.map(l => `<option value="${escapeHtml(l)}"${l === atual ? ' selected' : ''}>${escapeHtml(l)}</option>`).join('');
}

function renderizarExercicios() {
    const busca      = (document.getElementById('buscaExercicios').value || '').toLowerCase();
    const dif        = document.getElementById('filtroDificuldade').value;
    const status     = document.getElementById('filtroStatus').value;
    const linguagem  = document.getElementById('filtroLinguagem').value;

    const filtrados = exercicios.filter(e => {
        const matchBusca = !busca ||
            (e.titulo || '').toLowerCase().includes(busca) ||
            (e.numero || '').toLowerCase().includes(busca) ||
            (e.enunciado || '').toLowerCase().includes(busca);
        const matchDif    = !dif       || e.dificuldade === dif;
        const matchStatus = !status    || e.status === status;
        const matchLang   = !linguagem || e.linguagem === linguagem;
        return matchBusca && matchDif && matchStatus && matchLang;
    });

    const grade = document.getElementById('gradeExercicios');

    if (!filtrados.length) {
        grade.innerHTML = `
            <div class="estado-vazio" style="grid-column:1/-1">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="48" height="48">
                    <path d="M13 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V9z"/>
                    <polyline points="13 2 13 9 20 9"/>
                </svg>
                <p>${exercicios.length ? 'Nenhum exercício encontrado.' : 'Nenhum exercício ainda.<br>Clique em "+ Novo Exercício" para começar!'}</p>
            </div>`;
        return;
    }

    const diffClass  = { 'Fácil': 'tag-dif-facil', 'Médio': 'tag-dif-medio', 'Difícil': 'tag-dif-dificil' };

    grade.innerHTML = filtrados.map(e => `
        <div class="cartao-exercicio" onclick="abrirDetalhe(${JSON.stringify(e).replace(/"/g,'&quot;')})">
            <div class="exercicio-cabecalho">
                ${e.numero ? `<span class="exercicio-numero">#${escapeHtml(e.numero)}</span>` : ''}
                <div class="exercicio-acoes" onclick="event.stopPropagation()">
                    <button class="btn-icone" onclick="abrirEditarExercicio(${JSON.stringify(e).replace(/"/g,'&quot;')})" title="Editar">
                        <i class="fa-solid fa-pen"></i>
                    </button>
                    <button class="btn-icone perigo" onclick="excluirExercicio(${e.id})" title="Excluir">
                        <i class="fa-solid fa-trash"></i>
                    </button>
                </div>
            </div>
            <div class="exercicio-titulo">${escapeHtml(e.titulo)}</div>
            ${e.enunciado ? `<div class="exercicio-enunciado">${escapeHtml(e.enunciado.substring(0, 100))}${e.enunciado.length > 100 ? '...' : ''}</div>` : ''}
            <div class="exercicio-tags">
                <span class="tag ${diffClass[e.dificuldade] || 'tag-dif-facil'}">${escapeHtml(e.dificuldade || 'Fácil')}</span>
                <span class="tag ${e.status === 'resolvido' ? 'tag-resolvido' : 'tag-pendente'}">
                    ${e.status === 'resolvido' ? '✓ Resolvido' : '⏳ Pendente'}
                </span>
                ${e.linguagem ? `<span class="linguagem-badge">${escapeHtml(e.linguagem)}</span>` : ''}
            </div>
            <div class="exercicio-data">Adicionado em ${formatDate(e.criadoEm)}</div>
        </div>`
    ).join('');
}

function atualizarBadge() {
    const el = document.getElementById('badgeExercicios');
    if (el) el.textContent = exercicios.length;
}