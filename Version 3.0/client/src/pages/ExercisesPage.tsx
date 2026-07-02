import { FormEvent, useMemo, useState } from "react";
import { Copy, Dumbbell, Edit3, Plus, Save, Trash2, X } from "lucide-react";
import { api } from "../services/api";
import type { Exercicio } from "../types/domain";
import { formatDate } from "../utils";

type Props = {
  exercicios: Exercicio[];
  onChanged: () => Promise<void>;
};

const emptyForm = {
  numero: "",
  titulo: "",
  enunciado: "",
  entrada: "",
  saida: "",
  dificuldade: "Facil",
  linguagem: "",
  status: "pendente",
  solucao: "",
  observacoes: ""
};

export function ExercisesPage({ exercicios, onChanged }: Props) {
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [filtroDificuldade, setFiltroDificuldade] = useState("");
  const [filtroStatus, setFiltroStatus] = useState("");
  const [filtroLinguagem, setFiltroLinguagem] = useState("");
  const [detail, setDetail] = useState<Exercicio | null>(null);
  const [detailTab, setDetailTab] = useState<"enunciado" | "solucao" | "observacoes">("enunciado");
  const [solutionViewer, setSolutionViewer] = useState<Exercicio | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Exercicio | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [crudError, setCrudError] = useState("");
  const [saving, setSaving] = useState(false);

  const linguagens = useMemo(() => [...new Set(exercicios.map((item) => item.linguagem).filter(Boolean))] as string[], [exercicios]);
  const filtrados = exercicios.filter((item) =>
    (!filtroDificuldade || item.dificuldade === filtroDificuldade) &&
    (!filtroStatus || item.status === filtroStatus) &&
    (!filtroLinguagem || item.linguagem === filtroLinguagem)
  );

  async function submit(event: FormEvent) {
    event.preventDefault();
    setSaving(true); setCrudError("");
    try {
      if (editingId) await api.atualizarExercicio(editingId, form);
      else await api.salvarExercicio(form);
      setForm(emptyForm); setEditingId(null); setModalOpen(false);
      await onChanged();
    } catch (error) {
      setCrudError(error instanceof Error ? error.message : "Não foi possível salvar o exercício.");
    } finally {
      setSaving(false);
    }
  }

  async function remove() {
    if (!deleteTarget) return;
    setDeleting(true);
    setCrudError("");
    try {
      await api.deletarExercicio(deleteTarget.id);
      setDeleteTarget(null);
      setDetail(null);
      setSolutionViewer(null);
      await onChanged();
    } catch (error) {
      setCrudError(error instanceof Error ? error.message : "Não foi possível excluir o exercício.");
    } finally {
      setDeleting(false);
    }
  }

  function edit(exercicio: Exercicio) {
    setEditingId(exercicio.id);
    setForm({
      numero: exercicio.numero ?? "",
      titulo: exercicio.titulo,
      enunciado: exercicio.enunciado ?? "",
      entrada: exercicio.entrada ?? "",
      saida: exercicio.saida ?? "",
      dificuldade: exercicio.dificuldade,
      linguagem: exercicio.linguagem ?? "",
      status: exercicio.status,
      solucao: exercicio.solucao ?? "",
      observacoes: exercicio.observacoes ?? ""
    });
    setModalOpen(true);
  }

  function newExercise() {
    setEditingId(null);
    setForm(emptyForm);
    setModalOpen(true);
  }

  return <>
    <section className="exercises-page">
      <div className="exercises-heading">
        <h2><Dumbbell size={16} /> Exercícios</h2>
        <button type="button" className="primary compact new-exercise-button" onClick={newExercise}><Plus size={15} /> Novo Exercício</button>
      </div>
      <div className="exercise-filters">
        <select value={filtroDificuldade} onChange={(e) => setFiltroDificuldade(e.target.value)}><option value="">Todas dificuldades</option><option>Facil</option><option>Medio</option><option>Dificil</option></select>
        <select value={filtroStatus} onChange={(e) => setFiltroStatus(e.target.value)}><option value="">Todos status</option><option value="resolvido">Resolvidos</option><option value="pendente">Não resolvidos</option></select>
        <select value={filtroLinguagem} onChange={(e) => setFiltroLinguagem(e.target.value)}><option value="">Todas linguagens</option>{linguagens.map((item) => <option key={item}>{item}</option>)}</select>
      </div>
      <div className="exercise-grid-v2">
        {filtrados.length === 0 && <div className="exercise-empty"><Dumbbell size={48} /><p>Nenhum exercício encontrado.</p></div>}
        {filtrados.map((exercicio) => <article className="exercise-v2-card" key={exercicio.id} onClick={() => { setDetail(exercicio); setDetailTab("enunciado"); }}>
          <div className="exercise-v2-head"><span>{exercicio.numero ? `#${exercicio.numero}` : ""}</span><div>
            <button onClick={(e) => { e.stopPropagation(); edit(exercicio); }} title="Editar"><Edit3 size={14} /></button>
            <button type="button" onClick={(e) => { e.stopPropagation(); setCrudError(""); setDeleteTarget(exercicio); }} title="Excluir"><Trash2 size={14} /></button>
          </div></div>
          <h3>{exercicio.titulo}</h3>
          {exercicio.enunciado && <p>{exercicio.enunciado.slice(0, 100)}{exercicio.enunciado.length > 100 ? "..." : ""}</p>}
          <div className="exercise-v2-tags"><span className={`difficulty ${exercicio.dificuldade.toLowerCase()}`}>{exercicio.dificuldade}</span><span className={`status ${exercicio.status}`}>{exercicio.status === "resolvido" ? "✓ Resolvido" : "◷ Pendente"}</span>{exercicio.linguagem && <span className="tag">{exercicio.linguagem}</span>}</div>
          <small>Adicionado em {formatDate(exercicio.criadoEm)}</small>
        </article>)}
      </div>
    </section>

    {modalOpen && <div className="exercise-modal" onMouseDown={(e) => { if (e.target === e.currentTarget) setModalOpen(false); }}>
      <form className="exercise-modal-card exercise-form" onSubmit={submit}>
        <div className="exercise-modal-head"><h2>{editingId ? "Editar Exercício" : "Adicionar Exercício"}</h2><button type="button" onClick={() => setModalOpen(false)}><X size={19} /></button></div>
        <div className="split"><label>Número / ID<input value={form.numero} onChange={(e) => setForm({...form, numero:e.target.value})} placeholder="Ex: 1001" /></label><label>Dificuldade<select value={form.dificuldade} onChange={(e) => setForm({...form, dificuldade:e.target.value})}><option>Facil</option><option>Medio</option><option>Dificil</option></select></label></div>
        <label>Título *<input value={form.titulo} onChange={(e) => setForm({...form, titulo:e.target.value})} placeholder="Ex: Soma de N números" required /></label>
        <label>Enunciado<textarea className="statement-field" value={form.enunciado} onChange={(e) => setForm({...form, enunciado:e.target.value})} placeholder="Descreva o problema..." /></label>
        <div className="split"><label>Entrada de Exemplo<textarea className="io-field" value={form.entrada} onChange={(e) => setForm({...form, entrada:e.target.value})} placeholder="Exemplo de input..." /></label><label>Saída Esperada<textarea className="io-field" value={form.saida} onChange={(e) => setForm({...form, saida:e.target.value})} placeholder="Saída esperada..." /></label></div>
        <div className="split"><label>Linguagem da Solução<input value={form.linguagem} onChange={(e) => setForm({...form, linguagem:e.target.value})} placeholder="Ex: Java" /></label><label>Status<select value={form.status} onChange={(e) => setForm({...form, status:e.target.value})}><option value="pendente">Não resolvido</option><option value="resolvido">Resolvido ✓</option></select></label></div>
        <label>Minha Solução<textarea className="solution-field" value={form.solucao} onChange={(e) => setForm({...form, solucao:e.target.value})} placeholder="// Cole sua solução aqui..." /></label>
        <label>Observações / Aprendizados<textarea className="io-field" value={form.observacoes} onChange={(e) => setForm({...form, observacoes:e.target.value})} placeholder="O que aprendeu com este exercício?" /></label>
        {crudError && <div className="crud-error">{crudError}</div>}<button className="primary" disabled={saving}><Save size={17} /> {saving?"Salvando...":"Salvar Exercício"}</button>
      </form>
    </div>}
    {detail && <div className="exercise-modal" onMouseDown={(e) => { if(e.target===e.currentTarget)setDetail(null); }}><div className="exercise-detail-v2">
      <div className="exercise-detail-head"><div><small>{detail.numero?`#${detail.numero}`:""}</small><h2>{detail.titulo}</h2><div className="exercise-v2-tags"><span className={`difficulty ${detail.dificuldade.toLowerCase()}`}>{detail.dificuldade}</span><span className={`status ${detail.status}`}>{detail.status==="resolvido"?"✓ Resolvido":"◷ Pendente"}</span>{detail.linguagem&&<span className="tag">{detail.linguagem}</span>}</div></div><div><button onClick={()=>{setDetail(null);edit(detail)}}><Edit3 size={15}/></button><button onClick={()=>setDetail(null)}><X size={18}/></button></div></div>
      <div className="detail-tabs"><button className={detailTab==="enunciado"?"active":""} onClick={()=>setDetailTab("enunciado")}>Enunciado</button><button className={detailTab==="solucao"?"active":""} onClick={()=>{setDetailTab("solucao");setSolutionViewer(detail)}}>Minha Solução</button><button className={detailTab==="observacoes"?"active":""} onClick={()=>setDetailTab("observacoes")}>Observações</button></div>
      {detailTab==="enunciado"&&<div className="detail-content"><h4>Descrição</h4><p>{detail.enunciado||"—"}</p>{detail.entrada&&<><h4>Entrada</h4><pre>{detail.entrada}</pre></>}{detail.saida&&<><h4>Saída</h4><pre>{detail.saida}</pre></>}</div>}
      {detailTab==="solucao"&&<div className="detail-content"><button className="copy-solution" onClick={()=>navigator.clipboard.writeText(detail.solucao||"")}>Copiar</button><pre>{detail.solucao||"// Nenhuma solução adicionada ainda."}</pre></div>}
      {detailTab==="observacoes"&&<div className="detail-content"><h4>Observações / Aprendizados</h4><p>{detail.observacoes||"—"}</p></div>}
    </div></div>}
    {solutionViewer && <div className="solution-viewer-overlay" onMouseDown={(e)=>{if(e.target===e.currentTarget)setSolutionViewer(null)}}><div className="mac-viewer-modal solution-mac-modal">
      <div className="viewer-header"><div className="mac-dots" aria-hidden="true"><span className="red"/><span className="yellow"/><span className="green"/></div><span className="viewer-filename">{solutionFileName(solutionViewer)}</span><div className="viewer-controls"><button onClick={()=>navigator.clipboard.writeText(solutionViewer.solucao||"")} title="Copiar"><Copy size={17}/></button><button onClick={()=>setSolutionViewer(null)} title="Fechar"><X size={18}/></button></div></div>
      <div className="viewer-code-title"><div><h2>{solutionViewer.titulo}</h2><p>Solução do exercício {solutionViewer.numero?`#${solutionViewer.numero}`:""}</p></div>{solutionViewer.linguagem&&<span className="tag">{solutionViewer.linguagem}</span>}</div>
      <pre>{solutionViewer.solucao||"// Nenhuma solução adicionada ainda."}</pre>
      <div className="viewer-footer"><div>{solutionViewer.linguagem&&<span className="tag">{solutionViewer.linguagem}</span>}<span className={`status ${solutionViewer.status}`}>{solutionViewer.status}</span></div><small>{formatDate(solutionViewer.criadoEm)}</small></div>
    </div></div>}
    {deleteTarget && <div className="delete-overlay" onMouseDown={(e)=>{if(e.target===e.currentTarget&&!deleting)setDeleteTarget(null)}}><div className="delete-dialog"><div className="delete-icon"><Trash2 size={22}/></div><h2>Excluir exercício?</h2><p>O exercício <strong>{deleteTarget.titulo}</strong> será removido permanentemente.</p>{crudError&&<div className="crud-error">{crudError}</div>}<div><button type="button" className="cancel-delete" disabled={deleting} onClick={()=>setDeleteTarget(null)}>Cancelar</button><button type="button" className="confirm-delete" disabled={deleting} onClick={remove}>{deleting?"Excluindo...":"Excluir"}</button></div></div></div>}
  </>;
}

function solutionFileName(exercicio: Exercicio) {
  const slug = exercicio.titulo.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
  const extensions: Record<string,string> = { javascript:"js",typescript:"ts",python:"py",java:"java","c++":"cpp","c#":"cs",php:"php",ruby:"rb",go:"go",rust:"rs",sql:"sql" };
  return `${slug}.${extensions[(exercicio.linguagem||"").toLowerCase()]||"txt"}`;
}
