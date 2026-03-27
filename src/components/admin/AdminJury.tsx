"use client";

import { useState, useEffect } from "react";
import {
  getJury,
  addJuryMember,
  updateJuryMember,
  deleteJuryMember,
  type JuryMember,
} from "@/lib/firestore";
import { Plus, Trash2, Pencil, Check, X, UserCircle2 } from "lucide-react";

const EMPTY: Omit<JuryMember, "id"> = {
  name: "",
  role: "",
  photo: "",
  linkedin: "",
  order: 0,
};

export default function AdminJury() {
  const [members, setMembers] = useState<JuryMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editData, setEditData] = useState<Omit<JuryMember, "id">>(EMPTY);
  const [showAdd, setShowAdd] = useState(false);
  const [newData, setNewData] = useState<Omit<JuryMember, "id">>(EMPTY);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    getJury().then((data) => {
      setMembers(data);
      setLoading(false);
    });
  }, []);

  async function refresh() {
    const data = await getJury();
    setMembers(data);
  }

  async function handleAdd() {
    if (!newData.name || !newData.role) return;
    setSaving(true);
    await addJuryMember({ ...newData, order: members.length });
    setNewData(EMPTY);
    setShowAdd(false);
    await refresh();
    setSaving(false);
  }

  async function handleUpdate(id: string) {
    setSaving(true);
    await updateJuryMember(id, editData);
    setEditingId(null);
    await refresh();
    setSaving(false);
  }

  async function handleDelete(id: string) {
    if (!confirm("¿Eliminar este juez?")) return;
    await deleteJuryMember(id);
    await refresh();
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-5 h-5 border-2 border-white/20 border-t-[#FFA400] rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-lg font-bold">Jurado</h2>
          <p className="text-white/30 text-xs mt-0.5">{members.length} miembros</p>
        </div>
        <button
          onClick={() => { setShowAdd(true); setNewData({ ...EMPTY, order: members.length }); }}
          className="flex items-center gap-1.5 bg-[#FFA400] text-black text-xs font-semibold px-3 py-2 rounded-lg hover:bg-[#ffb520] transition-colors"
        >
          <Plus className="w-3.5 h-3.5" />
          Agregar juez
        </button>
      </div>

      {/* Add form */}
      {showAdd && (
        <div className="bg-white/[0.04] border border-white/[0.08] rounded-2xl p-5 mb-4">
          <p className="text-xs font-semibold text-white/50 uppercase tracking-wider mb-4">Nuevo juez</p>
          <JuryForm data={newData} onChange={setNewData} />
          <div className="flex items-center gap-2 mt-4">
            <button
              onClick={handleAdd}
              disabled={saving}
              className="flex items-center gap-1.5 bg-[#FFA400] text-black text-xs font-semibold px-3 py-2 rounded-lg hover:bg-[#ffb520] transition-colors disabled:opacity-50"
            >
              <Check className="w-3.5 h-3.5" />
              {saving ? "Guardando..." : "Guardar"}
            </button>
            <button
              onClick={() => setShowAdd(false)}
              className="flex items-center gap-1.5 text-white/30 hover:text-white/60 text-xs px-3 py-2 transition-colors"
            >
              <X className="w-3.5 h-3.5" />
              Cancelar
            </button>
          </div>
        </div>
      )}

      {/* Members grid */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {members.length === 0 && (
          <div className="col-span-3 text-center py-16 text-white/20 text-sm">
            No hay jueces aún. Agrega el primero.
          </div>
        )}
        {members.map((m) => (
          <div
            key={m.id}
            className="bg-white/[0.04] border border-white/[0.07] rounded-2xl p-4 hover:border-white/[0.12] transition-all"
          >
            {editingId === m.id ? (
              <div>
                <JuryForm data={editData} onChange={setEditData} />
                <div className="flex items-center gap-2 mt-4">
                  <button
                    onClick={() => handleUpdate(m.id!)}
                    disabled={saving}
                    className="flex items-center gap-1.5 bg-[#FFA400] text-black text-xs font-semibold px-3 py-2 rounded-lg hover:bg-[#ffb520] transition-colors disabled:opacity-50"
                  >
                    <Check className="w-3.5 h-3.5" />
                    {saving ? "Guardando..." : "Guardar"}
                  </button>
                  <button
                    onClick={() => setEditingId(null)}
                    className="text-white/30 hover:text-white/60 text-xs px-3 py-2 transition-colors"
                  >
                    Cancelar
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex items-start gap-3">
                {/* Photo */}
                <div className="w-12 h-12 rounded-xl overflow-hidden bg-white/[0.05] flex-shrink-0">
                  {m.photo ? (
                    <img src={m.photo} alt={m.name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <UserCircle2 className="w-6 h-6 text-white/20" />
                    </div>
                  )}
                </div>
                {/* Info */}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-white truncate">{m.name}</p>
                  <p className="text-xs text-white/40 truncate">{m.role}</p>
                  {m.linkedin && (
                    <a href={m.linkedin} target="_blank" rel="noopener noreferrer" className="text-[10px] text-[#FFA400]/60 hover:text-[#FFA400] transition-colors mt-0.5 block truncate">
                      LinkedIn ↗
                    </a>
                  )}
                </div>
                {/* Actions */}
                <div className="flex items-center gap-1 flex-shrink-0">
                  <button
                    onClick={() => { setEditingId(m.id!); setEditData({ name: m.name, role: m.role, photo: m.photo, linkedin: m.linkedin || "", order: m.order }); }}
                    className="w-7 h-7 flex items-center justify-center rounded-lg text-white/30 hover:text-white hover:bg-white/10 transition-all"
                  >
                    <Pencil className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => handleDelete(m.id!)}
                    className="w-7 h-7 flex items-center justify-center rounded-lg text-white/30 hover:text-red-400 hover:bg-red-400/10 transition-all"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

function JuryForm({
  data,
  onChange,
}: {
  data: Omit<JuryMember, "id">;
  onChange: (d: Omit<JuryMember, "id">) => void;
}) {
  return (
    <div className="grid sm:grid-cols-2 gap-3">
      <input
        value={data.name}
        onChange={(e) => onChange({ ...data, name: e.target.value })}
        placeholder="Nombre completo *"
        className="bg-white/[0.05] border border-white/[0.08] rounded-lg px-3 py-2 text-sm text-white placeholder-white/20 focus:outline-none focus:border-[#FFA400]/40 transition-colors"
      />
      <input
        value={data.role}
        onChange={(e) => onChange({ ...data, role: e.target.value })}
        placeholder="Rol / Especialidad *"
        className="bg-white/[0.05] border border-white/[0.08] rounded-lg px-3 py-2 text-sm text-white placeholder-white/20 focus:outline-none focus:border-[#FFA400]/40 transition-colors"
      />
      <input
        value={data.photo}
        onChange={(e) => onChange({ ...data, photo: e.target.value })}
        placeholder="URL de foto"
        className="bg-white/[0.05] border border-white/[0.08] rounded-lg px-3 py-2 text-sm text-white placeholder-white/20 focus:outline-none focus:border-[#FFA400]/40 transition-colors sm:col-span-2"
      />
      <input
        value={data.linkedin}
        onChange={(e) => onChange({ ...data, linkedin: e.target.value })}
        placeholder="LinkedIn URL"
        className="bg-white/[0.05] border border-white/[0.08] rounded-lg px-3 py-2 text-sm text-white placeholder-white/20 focus:outline-none focus:border-[#FFA400]/40 transition-colors sm:col-span-2"
      />
      {/* Preview */}
      {data.photo && (
        <div className="sm:col-span-2">
          <p className="text-[10px] text-white/30 mb-1.5 uppercase tracking-wider">Preview</p>
          <img src={data.photo} alt="preview" className="w-14 h-14 rounded-xl object-cover" />
        </div>
      )}
    </div>
  );
}
