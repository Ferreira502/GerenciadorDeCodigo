// home.js — Página inicial

document.addEventListener('DOMContentLoaded', async () => {
    const session = await injectUserMenu();
    if (!session) return;

    const [codigos, grupos, exercicios] = await Promise.all([
        listarCodigos(),
        listarGrupos(),
        listarExercicios()
    ]);

    atualizarStats(codigos, grupos, exercicios);
    renderizarAtividade(codigos, exercicios);
    atualizarBadgesSidebar(codigos, grupos, exercicios);
});

function atualizarStats(codigos, grupos, exercicios) {
    document.getElementById('totalCodigos').textContent    = codigos.length;
    document.getElementById('totalGrupos').textContent     = grupos.length;
    document.getElementById('totalExercicios').textContent = exercicios.length;
    document.getElementById('totalResolvidos').textContent = exercicios.filter(e => e.status === 'resolvido').length;
}

function atualizarBadgesSidebar(codigos, grupos, exercicios) {
    const bc = document.getElementById('badgeCodigos');
    const bg = document.getElementById('badgeGrupos');
    const be = document.getElementById('badgeExercicios');
    if (bc) bc.textContent = codigos.length;
    if (bg) bg.textContent = grupos.length;
    if (be) be.textContent = exercicios.length;
}

function renderizarAtividade(codigos, exercicios) {
    const list = document.getElementById('listaAtividade');

    const tudo = [
        ...codigos.map(c => ({ tipo: 'codigo', titulo: c.titulo, lang: c.linguagem, data: c.criadoEm, obj: c })),
        ...exercicios.map(e => ({ tipo: 'exercicio', titulo: e.titulo, dif: e.dificuldade, data: e.criadoEm, obj: e }))
    ].sort((a, b) => new Date(b.data) - new Date(a.data)).slice(0, 6);

    if (!tudo.length) {
        list.innerHTML = `
            <div class="estado-vazio">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M16 18L22 12L16 6M8 6L2 12L8 18"/>
                </svg>
                <p>Nenhuma atividade ainda.<br>Adicione seu primeiro código para começar!</p>
            </div>`;
        return;
    }

    const diffClass = { 'Fácil': 'tag-dif-facil', 'Médio': 'tag-dif-medio', 'Difícil': 'tag-dif-dificil' };

    list.innerHTML = tudo.map(a => `
        <div class="item-atividade"
             onclick="${a.tipo === 'codigo'
                ? `viewCode(${JSON.stringify(a.obj)})`
                : `window.location='exercises.html'`}">
            <div class="icone-atividade">
                ${a.tipo === 'codigo' ? '💻' : '🏋️'}
            </div>
            <div class="conteudo-atividade">
                <div class="titulo-atividade">${escapeHtml(a.titulo)}</div>
                <div class="meta-atividade">
                    ${a.tipo === 'codigo'
                        ? `<span class="linguagem-badge">${escapeHtml(a.lang)}</span>`
                        : `<span class="tag ${diffClass[a.dif] || 'tag-dif-facil'}">${escapeHtml(a.dif)}</span>`}
                    <span>${formatDate(a.data)}</span>
                </div>
            </div>
        </div>`).join('');
}