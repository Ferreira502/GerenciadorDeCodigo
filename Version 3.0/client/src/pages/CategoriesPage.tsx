import { Code2, Copy, Eye, FileCode2, Trash2 } from "lucide-react";
import { useMemo, useState } from "react";
import type { Codigo } from "../types/domain";
import { formatDate } from "../utils";

type Props = { codigos: Codigo[]; onDelete: (id: number) => Promise<void> };

export function CategoriesPage({ codigos, onDelete }: Props) {
  const categories = useMemo(() => Object.entries(codigos.reduce<Record<string, number>>((all, item) => {
    all[item.linguagem] = (all[item.linguagem] ?? 0) + 1;
    return all;
  }, {})), [codigos]);
  const [selected, setSelected] = useState("");
  const [viewing, setViewing] = useState<Codigo | null>(null);
  const selectedCodes = codigos.filter((item) => item.linguagem === selected);

  return <section className="categories-page">
    <h2 className="section-title"><FileCode2 size={16} /> Categorias por Linguagem</h2>
    <div className="category-grid">
      {categories.length === 0 && <div className="exercise-empty"><p>Nenhuma categoria ainda</p></div>}
      {categories.map(([language, count]) => <button className="category-card" key={language} onClick={() => setSelected(language)}>
        <FileCode2 size={35} /><strong>{language}</strong><span>{count} código{count > 1 ? "s" : ""}</span>
      </button>)}
    </div>
    <div className="category-list-panel">
      <h2 className="section-title"><Code2 size={16} /> Códigos da Categoria</h2>
      {!selected && <div className="exercise-empty"><p>Selecione uma categoria para ver os códigos</p></div>}
      {selectedCodes.map((codigo) => <article className="code-card" key={codigo.id}>
        <div><h3>{codigo.titulo}</h3><span className="tag">{codigo.linguagem}</span></div>
        {codigo.descricao && <p>{codigo.descricao}</p>}<small>Criado em {formatDate(codigo.criadoEm)}</small><pre>{codigo.codigo.slice(0,150)}...</pre>
        <div className="category-actions"><button onClick={() => setViewing(codigo)}><Eye size={15}/> Ver</button><button onClick={() => navigator.clipboard.writeText(codigo.codigo)}><Copy size={15}/> Copiar</button><button className="danger" onClick={() => onDelete(codigo.id)}><Trash2 size={15}/> Excluir</button></div>
      </article>)}
    </div>
    {viewing && <div className="exercise-modal" onMouseDown={(e) => { if(e.target===e.currentTarget)setViewing(null); }}><div className="code-detail-modal"><button className="modal-close" onClick={() => setViewing(null)}>×</button><h2>{viewing.titulo}</h2><span className="tag">{viewing.linguagem}</span><p>{viewing.descricao}</p><small>{formatDate(viewing.criadoEm)}</small><pre>{viewing.codigo}</pre><button className="primary" onClick={() => navigator.clipboard.writeText(viewing.codigo)}><Copy size={16}/> Copiar Código</button></div></div>}
  </section>;
}
