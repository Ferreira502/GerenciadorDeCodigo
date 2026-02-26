// home.js — página inicial

document.addEventListener('DOMContentLoaded', async () => {
    const session = await injectUserMenu();
    if (!session) return; // redireciona se não logado

    const codigos = await listarCodigos();
    atualizarStats(codigos);
    renderizarAtividade(codigos);
});

function atualizarStats(codigos) {
    document.getElementById('totalCodes').textContent     = codigos.length;
    document.getElementById('totalLanguages').textContent = new Set(codigos.map(c => c.linguagem)).size;

    const agora = new Date();
    const doMes = codigos.filter(c => {
        const d = new Date(c.criadoEm);
        return d.getMonth() === agora.getMonth() && d.getFullYear() === agora.getFullYear();
    });
    document.getElementById('thisMonth').textContent = doMes.length;
}

function renderizarAtividade(codigos) {
    const list = document.getElementById('recentActivity');

    if (codigos.length === 0) {
        list.innerHTML = `
            <div class="empty-state">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M16 18L22 12L16 6M8 6L2 12L8 18"/>
                </svg>
                <p style="margin-top:1rem;font-size:1.1rem;">Nenhum código salvo ainda</p>
                <p style="margin-top:.5rem;">Adicione seu primeiro código para começar!</p>
            </div>`;
        return;
    }

    const recentes = [...codigos]
        .sort((a, b) => new Date(b.criadoEm) - new Date(a.criadoEm))
        .slice(0, 5);

    list.innerHTML = recentes.map(c => `
        <div class="activity-item" onclick='viewCode(${JSON.stringify(c)})'>
            <div class="activity-icon">💻</div>
            <div class="activity-content">
                <div class="activity-title">${escapeHtml(c.titulo)}</div>
                <div class="activity-meta">
                    <span class="activity-lang">${escapeHtml(c.linguagem)}</span>
                    <span style="margin-left:10px;">${formatDate(c.criadoEm)}</span>
                </div>
            </div>
        </div>`).join('');
}