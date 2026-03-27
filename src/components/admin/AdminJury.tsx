"use client";

import { useState, useEffect, useRef } from "react";
import {
  getJury,
  addJuryMember,
  updateJuryMember,
  deleteJuryMember,
  type JuryMember,
} from "@/lib/firestore";
import { uploadImage } from "@/lib/cloudinary";
import { Plus, Trash2, Pencil, Check, X, UserCircle2, Upload, Loader2 } from "lucide-react";

const EMPTY: Omit<JuryMember, "id"> = {
  name: "",
  role: "",
  photo: "",
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
        <div className="bg-white/[0.04] border border-white/[0.08] rounded-2xl p-5 mb-5">
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
              className="text-white/30 hover:text-white/60 text-xs px-3 py-2 transition-colors"
            >
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
                <JuryForm
                  data={editData}
                  onChange={setEditData}
                />
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
                <div className="w-14 h-14 rounded-xl overflow-hidden bg-white/[0.05] flex-shrink-0">
                  {m.photo ? (
                    <img src={m.photo} alt={m.name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <UserCircle2 className="w-6 h-6 text-white/20" />
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-white truncate">{m.name}</p>
                  <p className="text-xs text-white/40 truncate">{m.role}</p>
                </div>
                <div className="flex items-center gap-1 flex-shrink-0">
                  <button
                    onClick={() => {
                      setEditingId(m.id!);
                      setEditData({ name: m.name, role: m.role, photo: m.photo, order: m.order });
                    }}
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

// ─── Photo uploader ───────────────────────────────────────────────────────────
function PhotoUploader({
  value,
  onChange,
}: {
  value: string;
  onChange: (url: string) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const url = await uploadImage(file);
      onChange(url);
    } catch (err) {
      console.error(err);
      alert("Error al subir la foto.");
    }
    setUploading(false);
  }

  return (
    <div className="flex items-center gap-3">
      {/* Preview */}
      <div
        className="w-16 h-16 rounded-xl overflow-hidden bg-white/[0.05] border border-white/[0.08] flex-shrink-0 cursor-pointer hover:border-[#FFA400]/40 transition-colors"
        onClick={() => inputRef.current?.click()}
      >
        {value ? (
          <img src={value} alt="preview" className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center gap-1">
            <UserCircle2 className="w-6 h-6 text-white/20" />
          </div>
        )}
      </div>

      {/* Upload button */}
      <div className="flex-1">
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={uploading}
          className="flex items-center gap-2 text-xs text-white/40 hover:text-white/70 border border-white/[0.08] hover:border-white/20 rounded-lg px-3 py-2 transition-all w-full justify-center"
        >
          {uploading ? (
            <><Loader2 className="w-3.5 h-3.5 animate-spin" /> Subiendo...</>
          ) : (
            <><Upload className="w-3.5 h-3.5" /> {value ? "Cambiar foto" : "Subir foto"}</>
          )}
        </button>
        {value && (
          <button
            type="button"
            onClick={() => onChange("")}
            className="text-[10px] text-white/20 hover:text-red-400 mt-1 w-full text-center transition-colors"
          >
            Quitar foto
          </button>
        )}
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleFile}
      />
    </div>
  );
}

// ─── Jury Form ────────────────────────────────────────────────────────────────
function JuryForm({
  data,
  onChange,
}: {
  data: Omit<JuryMember, "id">;
  onChange: (d: Omit<JuryMember, "id">) => void;
}) {
  const inputCls = "w-full bg-white/[0.05] border border-white/[0.08] rounded-lg px-3 py-2 text-sm text-white placeholder-white/20 focus:outline-none focus:border-[#FFA400]/40 transition-colors";

  return (
    <div className="space-y-3">
      {/* Photo upload */}
      <PhotoUploader
        value={data.photo}
        onChange={(url) => onChange({ ...data, photo: url })}
      />

      <input
        value={data.name}
        onChange={(e) => onChange({ ...data, name: e.target.value })}
        placeholder="Nombre completo *"
        className={inputCls}
      />
      <input
        value={data.role}
        onChange={(e) => onChange({ ...data, role: e.target.value })}
        placeholder="Puesto / Especialidad *"
        className={inputCls}
      />
    </div>
  );
}
