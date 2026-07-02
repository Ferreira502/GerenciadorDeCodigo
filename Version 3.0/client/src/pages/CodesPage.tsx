import { FormEvent, useMemo, useState } from "react";
import { Copy, Edit3, Eye, Save, Search, Trash2, X } from "lucide-react";
import { api } from "../services/api";
import type { Codigo, Grupo } from "../types/domain";
import { formatDate, languageExtension } from "../utils";
import { ConfirmDelete } from "../components/ConfirmDelete";

type Props = {
  codigos: Codigo[];
  grupos: Grupo[];
  onChanged: () => Promise<void>;
};

const emptyForm = { titulo: "", linguagem: "", descricao: "", codigo: "", grupos: [] as number[] };

export function CodesPage({ codigos, grupos, onChanged }: Props) {
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState<Codigo | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Codigo | null>(null);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [crudError, setCrudError] = useState("");

  function view(codigo: Codigo) {
    setSelected(codigo);
  }

  const filtered = useMemo(() => {
    const normalized = query.toLowerCase();
    return codigos.filter((codigo) =>
      [codigo.titulo, codigo.linguagem, codigo.descricao ?? ""].some((value) =>
        value.toLowerCase().includes(normalized)
      )
    );
  }, [codigos, query]);

  async function submit(event: FormEvent) {
    event.preventDefault();
    setSaving(true); setCrudError("");
    try {
      if (editingId) await api.atualizarCodigo(editingId, form);
      else await api.salvarCodigo(form);
      setForm(emptyForm);
      setEditingId(null);
      await onChanged();
    } catch (error) {
      setCrudError(error instanceof Error ? error.message : "Não foi possível salvar o código.");
    } finally {
      setSaving(false);
    }
  }

  function edit(codigo: Codigo) {
    setEditingId(codigo.id);
    setForm({
      titulo: codigo.titulo,
      linguagem: codigo.linguagem,
      descricao: codigo.descricao ?? "",
      codigo: codigo.codigo,
      grupos: codigo.grupos
    });
  }

  async function remove() {
    if (!deleteTarget) return;
    setDeleting(true); setCrudError("");
    try { await api.deletarCodigo(deleteTarget.id); if (selected?.id === deleteTarget.id) setSelected(null); setDeleteTarget(null); await onChanged(); }
    catch (error) { setCrudError(error instanceof Error ? error.message : "Não foi possível excluir o código."); }
    finally { setDeleting(false); }
  }

  return (
    <section className="workspace-grid">
      <form className="panel form-panel" onSubmit={submit}>
        <div className="panel-header">
          <h2>{editingId ? "Editar codigo" : "Adicionar codigo"}</h2>
          {editingId && (
            <button className="icon-button" type="button" onClick={() => { setEditingId(null); setForm(emptyForm); }} title="Cancelar">
              <X size={18} />
            </button>
          )}
        </div>
        <label>
          Titulo
          <input value={form.titulo} onChange={(event) => setForm({ ...form, titulo: event.target.value })} required />
        </label>
        <label>
          Linguagem
          <select value={form.linguagem} onChange={(event) => setForm({ ...form, linguagem: event.target.value })} required>
            <option value="">Selecione uma linguagem</option>{["JavaScript","TypeScript","Python","Java","C++","C#","PHP","Ruby","Go","Rust","HTML","CSS","SQL","Outro"].map((item)=><option key={item}>{item}</option>)}
          </select>
        </label>
        <label>
          Descricao
          <input value={form.descricao} onChange={(event) => setForm({ ...form, descricao: event.target.value })} />
        </label>
        <div>
          <span className="label-text">Grupos</span>
          <div className="pill-row">
            {grupos.length === 0 && <small className="muted">Crie um grupo primeiro.</small>}
            {grupos.map((grupo) => (
              <button
                className={`pill ${form.grupos.includes(grupo.id) ? "selected" : ""}`}
                key={grupo.id}
                type="button"
                style={{ "--pill-color": grupo.cor } as React.CSSProperties}
                onClick={() =>
                  setForm({
                    ...form,
                    grupos: form.grupos.includes(grupo.id)
                      ? form.grupos.filter((id) => id !== grupo.id)
                      : [...form.grupos, grupo.id]
                  })
                }
              >
                {grupo.nome}
              </button>
            ))}
          </div>
        </div>
        <label>
          Codigo
          <textarea value={form.codigo} onChange={(event) => setForm({ ...form, codigo: event.target.value })} required />
        </label>
        {crudError && !deleteTarget && <div className="crud-error">{crudError}</div>}
        <button className="primary" disabled={saving}>
          <Save size={18} />
          {saving ? "Salvando..." : "Salvar"}
        </button>
      </form>

      <div className="panel list-panel">
        <div className="panel-header">
          <h2>Codigos salvos</h2>
          <div className="searchbox">
            <Search size={16} />
            <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Buscar..." />
          </div>
        </div>
        <div className="cards-list">
          {filtered.length === 0 && <p className="empty">Nenhum codigo encontrado.</p>}
          {filtered.map((codigo) => (
            <article className={`code-card ${selected?.id === codigo.id ? "selected" : ""}`} key={codigo.id} onClick={() => view(codigo)}>
              <div>
                <h3>{codigo.titulo}</h3>
                <span className="tag">{codigo.linguagem}</span>
              </div>
              {codigo.descricao && <p>{codigo.descricao}</p>}
              <pre>{codigo.codigo.slice(0, 120)}{codigo.codigo.length > 120 ? "..." : ""}</pre>
              <small>{formatDate(codigo.criadoEm)}</small>
              <div className="row-actions">
                <button type="button" onClick={(event) => { event.stopPropagation(); view(codigo); }} title="Visualizar">
                  <Eye size={16} />
                </button>
                <button type="button" onClick={(event) => { event.stopPropagation(); edit(codigo); }} title="Editar">
                  <Edit3 size={16} />
                </button>
                <button type="button" onClick={(event) => { event.stopPropagation(); setCrudError(""); setDeleteTarget(codigo); }} title="Excluir">
                  <Trash2 size={16} />
                </button>
              </div>
            </article>
          ))}
        </div>
      </div>

      {selected && <div className="code-viewer-overlay" onMouseDown={(event) => { if (event.target === event.currentTarget) setSelected(null); }}>
        <div className="mac-viewer-modal">
          <div className="viewer-header">
            <div className="mac-dots" aria-hidden="true"><span className="red"/><span className="yellow"/><span className="green"/></div>
            <span className="viewer-filename">{`${slug(selected.titulo)}.${languageExtension(selected.linguagem)}`}</span>
            <div className="viewer-controls"><button onClick={() => navigator.clipboard.writeText(selected.codigo)} title="Copiar"><Copy size={17}/></button><button onClick={() => setSelected(null)} title="Fechar"><X size={18}/></button></div>
          </div>
          <div className="viewer-code-title"><div><h2>{selected.titulo}</h2>{selected.descricao && <p>{selected.descricao}</p>}</div><span className="tag">{selected.linguagem}</span></div>
          <pre>{selected.codigo}</pre>
          <div className="viewer-footer"><div><span className="tag">{selected.linguagem}</span>{selected.grupos.map((id) => { const group=grupos.find((item)=>item.id===id); return group?<span className="viewer-group" key={id} style={{borderColor:group.cor,color:group.cor}}>{group.nome}</span>:null; })}</div><small>{formatDate(selected.criadoEm)}</small></div>
        </div>
      </div>}
      {deleteTarget && <ConfirmDelete title="Excluir código?" name={deleteTarget.titulo} loading={deleting} error={crudError} onCancel={() => setDeleteTarget(null)} onConfirm={remove}/>} 
    </section>
  );
}

function slug(value: string) {
  return value.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}
