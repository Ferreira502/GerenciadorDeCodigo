import { BookOpen, Clock3, Code2, Dumbbell, Flame, Folder, Layers3, Plus } from "lucide-react";
import type { Page } from "../App";
import type { Codigo, Exercicio, Grupo } from "../types/domain";
import { formatDate } from "../utils";

type Props = {
  codigos: Codigo[];
  grupos: Grupo[];
  exercicios: Exercicio[];
  onNavigate: (page: Page) => void;
};

export function DashboardPage({ codigos, grupos, exercicios, onNavigate }: Props) {
  const atividades = [
    ...codigos.map((item) => ({ tipo: "Codigo", titulo: item.titulo, meta: item.linguagem, data: item.criadoEm })),
    ...exercicios.map((item) => ({ tipo: "Exercicio", titulo: item.titulo, meta: item.dificuldade, data: item.criadoEm }))
  ]
    .sort((a, b) => new Date(b.data).getTime() - new Date(a.data).getTime())
    .slice(0, 6);

  return (
    <section className="page-grid">
      <div className="home-hero">
        <div className="home-hero-sub">// snippet hub v2.0</div>
        <h1>Bem-vindo ao<br />ArmazenaCodigo</h1>
        <p>Organize, salve e gerencie seus snippets de código de forma inteligente</p>
        <div className="home-actions">
          <button className="primary" onClick={() => onNavigate("codes")}><Plus size={16} /> Adicionar Código</button>
          <button className="secondary" onClick={() => onNavigate("groups")}><Folder size={16} /> Ver Grupos</button>
        </div>
      </div>

      <div className="stats-grid">
        <Stat tone="cyan" icon={<Code2 />} label="Códigos Salvos" value={codigos.length} onClick={() => onNavigate("codes")} />
        <Stat tone="green" icon={<Layers3 />} label="Grupos" value={grupos.length} onClick={() => onNavigate("groups")} />
        <Stat tone="yellow" icon={<Dumbbell />} label="Exercícios" value={exercicios.length} onClick={() => onNavigate("exercises")} />
        <Stat
          tone="purple"
          icon={<BookOpen />}
          label="Resolvidos"
          value={exercicios.filter((item) => item.status === "resolvido").length}
          onClick={() => onNavigate("exercises")}
        />
      </div>

      <h2 className="section-title"><Flame size={15} /> Ações Rápidas</h2>
      <div className="quick-grid">
        <Quick icon={<Code2 />} title="Novo Código" text="Adicione um snippet ao seu repositório pessoal" onClick={() => onNavigate("codes")} />
        <Quick icon={<Layers3 />} title="Grupos" text="Organize seus códigos em grupos temáticos" onClick={() => onNavigate("groups")} />
        <Quick icon={<Dumbbell />} title="Exercícios" text="Registre e resolva exercícios de programação" onClick={() => onNavigate("exercises")} />
      </div>

      <div className="panel wide">
        <div className="panel-header">
          <h2><Clock3 size={15} /> Atividade Recente</h2>
        </div>
        <div className="activity-list">
          {atividades.length === 0 && <p className="empty">Nenhuma atividade ainda.</p>}
          {atividades.map((item, index) => (
            <article className="activity-item" key={`${item.tipo}-${item.titulo}-${index}`}>
              <span>{item.tipo}</span>
              <strong>{item.titulo}</strong>
              <small>{item.meta} - {formatDate(item.data)}</small>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

function Stat({ icon, label, value, onClick, tone }: { icon: React.ReactNode; label: string; value: number; onClick: () => void; tone: string }) {
  return (
    <button className="stat-card" onClick={onClick}>
      <span className={`stat-icon ${tone}`}>{icon}</span>
      <strong>{value}</strong>
      <span>{label}</span>
    </button>
  );
}

function Quick({ icon, title, text, onClick }: { icon: React.ReactNode; title: string; text: string; onClick: () => void }) {
  return <button className="quick-card" onClick={onClick}><span>{icon}</span><strong>{title}</strong><p>{text}</p></button>;
}
