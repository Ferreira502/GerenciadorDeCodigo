// Funcoes especificas da pagina inicial

// Stats
function updateStats() {
    document.getElementById('totalCodes').textContent = codes.length;

    const langs = new Set(codes.map(c => c.language));
    document.getElementById('totalLanguages').textContent = langs.size;

    const month = new Date().getMonth();
    const thisMonth = codes.filter(c => new Date(c.date).getMonth() === month);
    document.getElementById('thisMonth').textContent = thisMonth.length;
}

// Atividade Recente
function updateRecentActivity() {
    const list = document.getElementById('recentActivity');

    if (codes.length === 0) {
        list.innerHTML = `
            <div class="empty-state">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M16 18L22 12L16 6M8 6L2 12L8 18"></path>
                </svg>
                <p style="margin-top: 1rem; font-size: 1.1rem;">Nenhum código salvo ainda</p>
                <p style="margin-top: 0.5rem;">Adicione seu primeiro codigo para comecar!</p>
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

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
    updateStats();
    updateRecentActivity();
});