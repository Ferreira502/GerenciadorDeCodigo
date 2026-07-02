export type Usuario = {
  id: number;
  nome: string;
  email: string;
};

export type Grupo = {
  id: number;
  nome: string;
  descricao?: string | null;
  cor: string;
  criadoEm: string;
};

export type Codigo = {
  id: number;
  titulo: string;
  linguagem: string;
  descricao?: string | null;
  codigo: string;
  criadoEm: string;
  atualizadoEm?: string;
  grupos: number[];
};

export type Exercicio = {
  id: number;
  numero?: string | null;
  titulo: string;
  enunciado?: string | null;
  entrada?: string | null;
  saida?: string | null;
  dificuldade: string;
  linguagem?: string | null;
  status: string;
  solucao?: string | null;
  observacoes?: string | null;
  criadoEm: string;
  atualizadoEm?: string;
};
