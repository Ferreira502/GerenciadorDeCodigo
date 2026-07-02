import type { Codigo, Exercicio, Grupo, Usuario } from "../types/domain";

const jsonHeaders = { "Content-Type": "application/json" };

async function request<T>(url: string, options: RequestInit = {}): Promise<T> {
  const response = await fetch(`/api${url}`, {
    credentials: "include",
    headers: jsonHeaders,
    ...options
  });

  const data = await response.json().catch(() => null);
  if (!response.ok) {
    throw new Error(data?.erro ?? "Erro ao comunicar com a API");
  }
  return data as T;
}

export const api = {
  me: () => request<Usuario>("/auth/me"),
  login: (email: string, senha: string) =>
    request<{ status: string; usuario: Usuario }>("/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, senha })
    }),
  cadastro: (nome: string, email: string, senha: string) =>
    request<{ status: string; usuario: Usuario }>("/auth/cadastro", {
      method: "POST",
      body: JSON.stringify({ nome, email, senha })
    }),
  logout: () => request<{ status: string }>("/auth/logout", { method: "POST" }),
  codigos: () => request<Codigo[]>("/codigos"),
  salvarCodigo: (payload: Omit<Codigo, "id" | "criadoEm" | "atualizadoEm">) =>
    request<Codigo>("/codigos", { method: "POST", body: JSON.stringify(payload) }),
  atualizarCodigo: (id: number, payload: Omit<Codigo, "id" | "criadoEm" | "atualizadoEm">) =>
    request<Codigo>(`/codigos/${id}`, { method: "PUT", body: JSON.stringify(payload) }),
  deletarCodigo: (id: number) => request<{ status: string }>(`/codigos/${id}`, { method: "DELETE" }),
  grupos: () => request<Grupo[]>("/grupos"),
  salvarGrupo: (payload: Pick<Grupo, "nome" | "cor"> & { descricao?: string | null }) =>
    request<Grupo>("/grupos", { method: "POST", body: JSON.stringify(payload) }),
  atualizarGrupo: (id: number, payload: Pick<Grupo, "nome" | "cor"> & { descricao?: string | null }) =>
    request<Grupo>(`/grupos/${id}`, { method: "PUT", body: JSON.stringify(payload) }),
  deletarGrupo: (id: number) => request<{ status: string }>(`/grupos/${id}`, { method: "DELETE" }),
  exercicios: () => request<Exercicio[]>("/exercicios"),
  salvarExercicio: (payload: Omit<Exercicio, "id" | "criadoEm" | "atualizadoEm">) =>
    request<Exercicio>("/exercicios", { method: "POST", body: JSON.stringify(payload) }),
  atualizarExercicio: (id: number, payload: Omit<Exercicio, "id" | "criadoEm" | "atualizadoEm">) =>
    request<Exercicio>(`/exercicios/${id}`, { method: "PUT", body: JSON.stringify(payload) }),
  deletarExercicio: (id: number) => request<{ status: string }>(`/exercicios/${id}`, { method: "DELETE" })
};
