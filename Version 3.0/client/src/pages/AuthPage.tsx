import { FormEvent, useState } from "react";
import { AlertCircle, CheckCircle2, Lock, LogIn, Mail, User, UserPlus } from "lucide-react";
import { api } from "../services/api";
import type { Usuario } from "../types/domain";

type Props = {
  onAuthenticated: (usuario: Usuario) => void;
};

export function AuthPage({ onAuthenticated }: Props) {
  const [mode, setMode] = useState<"login" | "cadastro">("login");
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [erro, setErro] = useState("");
  const [sucesso, setSucesso] = useState(false);
  const [saving, setSaving] = useState(false);

  function changeMode(nextMode: "login" | "cadastro") {
    setMode(nextMode);
    setErro("");
    setSucesso(false);
  }

  async function submit(event: FormEvent) {
    event.preventDefault();
    setErro("");
    setSucesso(false);
    const cleanNome = nome.trim();
    const cleanEmail = email.trim().toLowerCase();
    if (!cleanEmail || !senha || (mode === "cadastro" && !cleanNome)) {
      setErro("Preencha todos os campos.");
      return;
    }
    if (mode === "cadastro" && senha.length < 6) {
      setErro("A senha deve ter no mínimo 6 caracteres.");
      return;
    }
    setSaving(true);
    try {
      const result =
        mode === "login" ? await api.login(cleanEmail, senha) : await api.cadastro(cleanNome, cleanEmail, senha);
      if (mode === "cadastro") {
        setSucesso(true);
        window.setTimeout(() => onAuthenticated(result.usuario), 1000);
      } else {
        onAuthenticated(result.usuario);
      }
    } catch (error) {
      setErro(error instanceof Error ? error.message : "Erro inesperado");
    } finally {
      setSaving(false);
    }
  }

  return (
    <main className="auth-screen">
      <div className="auth-page">
        <header className="auth-logo"><span>Armazena Codigo</span><p>Seu repositório pessoal de Codigos</p></header>
        <section className="auth-card">
          <div className="auth-tabs">
            <button type="button" className={mode === "login" ? "active" : ""} onClick={() => changeMode("login")}>Entrar</button>
            <button type="button" className={mode === "cadastro" ? "active" : ""} onClick={() => changeMode("cadastro")}>Criar Conta</button>
          </div>
          <form className="auth-form" onSubmit={submit}>
            <h1>{mode === "login" ? "Bem-vindo de volta" : "Crie sua conta"}</h1>
            <p className="auth-subtitle">{mode === "login" ? "Acesse seus códigos salvos" : "Gratuito e sem complicação"}</p>
            {erro && <div className="auth-message error"><AlertCircle size={16} />{erro}</div>}
            {sucesso && <div className="auth-message success"><CheckCircle2 size={16} />Conta criada! Redirecionando...</div>}
            {mode === "cadastro" && <label className="auth-field">Nome completo<span><User size={15} /><input value={nome} onChange={(event) => setNome(event.target.value)} placeholder="Seu nome" autoComplete="name" /></span></label>}
            <label className="auth-field">Email<span><Mail size={15} /><input type="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="seu@email.com" autoComplete="email" /></span></label>
            <label className="auth-field">Senha<span><Lock size={15} /><input type="password" value={senha} onChange={(event) => setSenha(event.target.value)} placeholder={mode === "login" ? "Digite sua senha" : "Mínimo 6 caracteres"} autoComplete={mode === "login" ? "current-password" : "new-password"} /></span></label>
            <button className="auth-submit" disabled={saving || sucesso}>
              {saving ? <span className="auth-spinner" /> : mode === "login" ? <LogIn size={17} /> : <UserPlus size={17} />}
              {saving ? "Aguarde..." : mode === "login" ? "Entrar" : "Criar Conta"}
            </button>
          </form>
        </section>
      </div>
    </main>
  );
}
