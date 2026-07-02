import { useEffect, useMemo, useState } from "react";
import type { Codigo, Exercicio, Grupo, Usuario } from "./types/domain";
import { api } from "./services/api";
import { AppShell } from "./components/AppShell";
import { AuthPage } from "./pages/AuthPage";
import { DashboardPage } from "./pages/DashboardPage";
import { CodesPage } from "./pages/CodesPage";
import { GroupsPage } from "./pages/GroupsPage";
import { ExercisesPage } from "./pages/ExercisesPage";
import { CategoriesPage } from "./pages/CategoriesPage";

export type Page = "dashboard" | "codes" | "groups" | "exercises" | "categories";

export default function App() {
  const [usuario, setUsuario] = useState<Usuario | null>(null);
  const [page, setPage] = useState<Page>("dashboard");
  const [loading, setLoading] = useState(true);
  const [codigos, setCodigos] = useState<Codigo[]>([]);
  const [grupos, setGrupos] = useState<Grupo[]>([]);
  const [exercicios, setExercicios] = useState<Exercicio[]>([]);

  async function refreshData() {
    const [nextCodigos, nextGrupos, nextExercicios] = await Promise.all([
      api.codigos(),
      api.grupos(),
      api.exercicios()
    ]);
    setCodigos(nextCodigos);
    setGrupos(nextGrupos);
    setExercicios(nextExercicios);
  }

  useEffect(() => {
    api
      .me()
      .then((me) => {
        setUsuario(me);
        return refreshData();
      })
      .catch(() => setUsuario(null))
      .finally(() => setLoading(false));
  }, []);

  const stats = useMemo(
    () => ({
      codigos: codigos.length,
      grupos: grupos.length,
      exercicios: exercicios.length,
      resolvidos: exercicios.filter((item) => item.status === "resolvido").length
    }),
    [codigos, grupos, exercicios]
  );

  if (loading) return <div className="boot">Carregando ArmazenaCodigo 3.0</div>;

  if (!usuario) {
    return (
      <AuthPage
        onAuthenticated={(nextUsuario) => {
          setUsuario(nextUsuario);
          refreshData();
        }}
      />
    );
  }

  async function logout() {
    await api.logout();
    setUsuario(null);
    setCodigos([]);
    setGrupos([]);
    setExercicios([]);
  }

  return (
    <AppShell usuario={usuario} page={page} stats={stats} onNavigate={setPage} onLogout={logout}>
      {page === "dashboard" && (
        <DashboardPage codigos={codigos} grupos={grupos} exercicios={exercicios} onNavigate={setPage} />
      )}
      {page === "codes" && (
        <CodesPage codigos={codigos} grupos={grupos} onChanged={refreshData} />
      )}
      {page === "groups" && (
        <GroupsPage grupos={grupos} codigos={codigos} onChanged={refreshData} />
      )}
      {page === "exercises" && (
        <ExercisesPage exercicios={exercicios} onChanged={refreshData} />
      )}
      {page === "categories" && (
        <CategoriesPage codigos={codigos} onDelete={async (id) => { if (!confirm("Deseja excluir este código?")) return; await api.deletarCodigo(id); await refreshData(); }} />
      )}
    </AppShell>
  );
}
