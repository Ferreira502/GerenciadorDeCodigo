import { FormEvent, useState } from "react";
import { ChevronDown, Code2, Copy, Edit3, Eye, Layers3, Plus, Save, Trash2, X } from "lucide-react";
import { api } from "../services/api";
import type { Codigo, Grupo } from "../types/domain";
import { ConfirmDelete } from "../components/ConfirmDelete";

type Props = {
  grupos: Grupo[];
  codigos: Codigo[];
  onChanged: () => Promise<void>;
};

const emptyForm = { nome: "", descricao: "", cor: "#00d9ff" };
const colors = ["#00d9ff", "#00ffc8", "#9d6af5", "#ffd166", "#ff4d6d", "#ff8c42", "#4d96ff", "#6bcb77"];

export function GroupsPage({ grupos, codigos, onChanged }: Props) {
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Grupo | null>(null);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [crudError, setCrudError] = useState("");
  const [selectedCode, setSelectedCode] = useState<Codigo | null>(null);

  async function submit(event: FormEvent) {
    event.preventDefault();
    setSaving(true); setCrudError("");
    try {
      if (editingId) await api.atualizarGrupo(editingId, form);
      else await api.salvarGrupo(form);
      setForm(emptyForm); setEditingId(null); setModalOpen(false);
      await onChanged();
    } catch (error) {
      setCrudError(error instanceof Error ? error.message : "Não foi possível salvar o grupo.");
    } finally {
      setSaving(false);
    }
  }

  async function remove() {
    if (!deleteTarget) return;
    setDeleting(true); setCrudError("");
    try { await api.deletarGrupo(deleteTarget.id); setDeleteTarget(null); await onChanged(); }
    catch (error) { setCrudError(error instanceof Error ? error.message : "Não foi possível excluir o grupo."); }
    finally { setDeleting(false); }
  }

  function openNew() { setEditingId(null); setForm(emptyForm); setModalOpen(true); }
  function openEdit(grupo: Grupo) { setEditingId(grupo.id); setForm({ nome:grupo.nome, descricao:grupo.descricao??"", cor:grupo.cor }); setModalOpen(true); }

  return <>
    <section className="groups-page-v2">
      <div className="exercises-heading"><h2><Layers3 size={16}/> Grupos de Códigos</h2><button className="primary compact" onClick={openNew}><Plus size={15}/> Novo Grupo</button></div>
      <div className="groups-grid-v2">
        {grupos.length===0 && <div className="groups-empty"><Layers3 size={48}/><h3>Nenhum grupo criado</h3><p>Crie grupos para organizar seus códigos por projeto ou assunto.</p><button className="primary compact" onClick={openNew}><Plus size={15}/> Criar primeiro grupo</button></div>}
        {grupos.map((grupo) => { const linked=codigos.filter((c)=>c.grupos.includes(grupo.id)); const expanded=expandedId===grupo.id; return <article className={`group-v2-card ${expanded?"expanded":""}`} key={grupo.id}>
          <div className="group-v2-head" onClick={()=>setExpandedId(expanded?null:grupo.id)}><span className="group-v2-dot" style={{background:grupo.cor}}/><strong>{grupo.nome}</strong><div className="group-v2-actions" onClick={(e)=>e.stopPropagation()}><button onClick={()=>openEdit(grupo)}><Edit3 size={14}/></button><button onClick={()=>{setCrudError("");setDeleteTarget(grupo)}}><Trash2 size={14}/></button></div><ChevronDown size={14}/></div>
          <div className="group-v2-body"><p>{grupo.descricao||"Sem descrição"}</p><div><small>{linked.length} código{linked.length!==1?"s":""}</small><span>Clique para expandir</span></div></div>
          {expanded && <div className="group-v2-expanded"><label><Code2 size={13}/> Códigos neste grupo</label>{linked.length===0?<div className="group-no-code"><Code2 size={25}/><p>Nenhum código neste grupo.</p></div>:linked.map((codigo)=><div className="group-code-item" key={codigo.id} onClick={()=>setSelectedCode(codigo)}><div><strong>{codigo.titulo}</strong><span>{codigo.linguagem}</span></div>{codigo.descricao&&<p>{codigo.descricao}</p>}<pre>{codigo.codigo.slice(0,100)}</pre><div className="group-code-footer"><small>Clique para visualizar</small><Eye size={14}/></div></div>)}</div>}
        </article>; })}
      </div>
    </section>
    {modalOpen && <div className="exercise-modal" onMouseDown={(e)=>{if(e.target===e.currentTarget&&!saving)setModalOpen(false)}}><form className="group-modal-v2" onSubmit={submit}><div className="exercise-modal-head"><h2>{editingId?"Editar Grupo":"Criar Grupo"}</h2><button type="button" onClick={()=>setModalOpen(false)}><X size={19}/></button></div><label>Nome *<input value={form.nome} onChange={(e)=>setForm({...form,nome:e.target.value})} placeholder="Ex: Algoritmos, Projeto X..." required/></label><label>Descrição<input value={form.descricao} onChange={(e)=>setForm({...form,descricao:e.target.value})} placeholder="Descrição breve..."/></label><label>Cor<div className="color-swatches">{colors.map((color)=><button type="button" key={color} className={form.cor===color?"selected":""} style={{background:color}} onClick={()=>setForm({...form,cor:color})}/>)}</div></label>{crudError&&<div className="crud-error">{crudError}</div>}<button className="primary" disabled={saving}><Save size={17}/> {saving?"Salvando...":"Salvar"}</button></form></div>}
    {deleteTarget && <ConfirmDelete title="Excluir grupo?" name={deleteTarget.nome} loading={deleting} error={crudError} onCancel={()=>setDeleteTarget(null)} onConfirm={remove}/>} 
    {selectedCode && <div className="code-viewer-overlay" onMouseDown={(e)=>{if(e.target===e.currentTarget)setSelectedCode(null)}}><div className="mac-viewer-modal"><div className="viewer-header"><div className="mac-dots"><span className="red"/><span className="yellow"/><span className="green"/></div><span className="viewer-filename">{selectedCode.titulo.toLowerCase().replace(/[^a-z0-9]+/g,"-")}.txt</span><div className="viewer-controls"><button onClick={()=>navigator.clipboard.writeText(selectedCode.codigo)}><Copy size={17}/></button><button onClick={()=>setSelectedCode(null)}><X size={18}/></button></div></div><div className="viewer-code-title"><div><h2>{selectedCode.titulo}</h2><p>{selectedCode.descricao}</p></div><span className="tag">{selectedCode.linguagem}</span></div><pre>{selectedCode.codigo}</pre></div></div>}
  </>;
}
