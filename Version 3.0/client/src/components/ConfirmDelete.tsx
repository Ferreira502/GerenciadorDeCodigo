import { Trash2 } from "lucide-react";

type Props = { title: string; name: string; loading: boolean; error?: string; onCancel: () => void; onConfirm: () => void };

export function ConfirmDelete({ title, name, loading, error, onCancel, onConfirm }: Props) {
  return <div className="delete-overlay" onMouseDown={(e) => { if (e.target === e.currentTarget && !loading) onCancel(); }}>
    <div className="delete-dialog"><div className="delete-icon"><Trash2 size={22}/></div><h2>{title}</h2><p><strong>{name}</strong> será removido permanentemente.</p>{error && <div className="crud-error">{error}</div>}<div><button type="button" className="cancel-delete" disabled={loading} onClick={onCancel}>Cancelar</button><button type="button" className="confirm-delete" disabled={loading} onClick={onConfirm}>{loading ? "Excluindo..." : "Excluir"}</button></div></div>
  </div>;
}
