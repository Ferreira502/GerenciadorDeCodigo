import { Code2, Dumbbell, Folder, FolderKanban, Home, Layers3, LogOut, Plus } from "lucide-react";
import type { ReactNode } from "react";
import type { Page } from "../App";
import type { Usuario } from "../types/domain";

type Props = {
  usuario: Usuario;
  page: Page;
  stats: {
    codigos: number;
    grupos: number;
    exercicios: number;
    resolvidos: number;
  };
  children: ReactNode;
  onNavigate: (page: Page) => void;
  onLogout: () => void;
};

const navItems: Array<{ page: Page; label: string; icon: ReactNode; badge?: keyof Props["stats"] }> = [
  { page: "dashboard", label: "Inicio", icon: <Home size={18} /> },
  { page: "codes", label: "Meus Codigos", icon: <Code2 size={18} />, badge: "codigos" },
  { page: "groups", label: "Grupos", icon: <Layers3 size={18} />, badge: "grupos" },
  { page: "exercises", label: "Exercicios", icon: <Dumbbell size={18} />, badge: "exercicios" }
  ,{ page: "categories", label: "Categorias", icon: <Folder size={18} /> }
];

export function AppShell({ usuario, page, stats, children, onNavigate, onLogout }: Props) {
  return (
    <div className="layout">
      <aside className="sidebar">
        <button className="brand" onClick={() => onNavigate("dashboard")}>
          <span className="brand-mark">&lt;/&gt;</span>
          <span>
            <strong>ArmazenaCodigo</strong>
            <small>v3.0 - snippet hub</small>
          </span>
        </button>

        <nav className="nav">
          <span className="nav-label">Principal</span>
          {navItems.map((item) => (
            <button
              className={`nav-item ${page === item.page ? "active" : ""}`}
              key={item.page}
              onClick={() => onNavigate(item.page)}
            >
              {item.icon}
              <span>{item.label}</span>
              {item.badge && <em>{stats[item.badge]}</em>}
            </button>
          ))}
          <span className="nav-label">Acoes</span>
          <button className="nav-item" onClick={() => onNavigate("codes")}>
            <Plus size={18} />
            <span>Novo Codigo</span>
          </button>
          <button className="nav-item" onClick={() => onNavigate("groups")}>
            <FolderKanban size={18} />
            <span>Organizar Grupos</span>
          </button>
        </nav>

        <div className="user-card">
          <div className="avatar">{usuario.nome[0]?.toUpperCase()}</div>
          <div>
            <strong>{usuario.nome}</strong>
            <small>{usuario.email}</small>
          </div>
        </div>
      </aside>

      <main className="main">
        <header className="topbar">
          <span className="topbar-title">{titleByPage[page]}</span>
          <button className="icon-button danger" onClick={onLogout} title="Sair">
            <LogOut size={18} />
          </button>
        </header>
        {children}
      </main>
    </div>
  );
}

const titleByPage: Record<Page, string> = {
  dashboard: "Inicio",
  codes: "Meus Codigos",
  groups: "Grupos",
  exercises: "Exercicios"
  ,categories: "Categorias"
};
