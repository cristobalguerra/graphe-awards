"use client";

import { useState, useEffect } from "react";
import {
  getNominees,
  addNominee,
  updateNominee,
  deleteNominee,
  type NomineeDoc,
} from "@/lib/firestore";
import { CATEGORIES } from "@/lib/data";
import { Plus, Trash2, Pencil, Check, X, ChevronLeft, ChevronRight, Image } from "lucide-react";

const EMPTY: Omit<NomineeDoc, "id"> = {
  name: "",
  project: "",
  semester: "",
  categoryId: "fotografia",
  images: [{ url: "" }, { url: "" }, { url: "" }],
  description: "",
  order: 0,
};

export default function AdminNominees() {
  const [nominees, setNominees] = useState<NomineeDoc[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editData, setEditData] = useState<Omit<NomineeDoc, "id">>(EMPTY);
  const [showAdd, setShowAdd] = useState(false);
  const [newData, setNewData] = useState<Omit<NomineeDoc, "id">>(EMPTY);
  const [saving, setSaving] = useState(false);
  const [filterCat, setFilterCat] = useState<string>("all");

  useEffect(() => {
    getNominees().then((data) => {
      setNominees(data);
      setLoading(false);
    });
  }, []);

  async function refresh() {
    const data = await getNominees();
    setNominees(data);
  }

  async function handleAdd() {
    if (!newData.name || !newData.project) return;
    setSaving(true);
    const filtered = nominees.filter((n) => n.categoryId === newData.categoryId);
    await addNominee({ ...newData, order: filtered.length });
    setNewData(EMPTY);
    setShowAdd(false);
    await refresh();
    setSaving(false);
  }

  async function handleUpdate(id: string) {
    setSaving(true);
    await updateNominee(id, editData);
    setEditingId(null);
    await refresh();
    setSaving(false);
  }

  async function handleDelete(id: string) {
    if (!confirm("¿Eliminar este nominado?")) return;
    await deleteNominee(id);
    await refresh();
  }

  const filtered = filterCat === "all" ? nominees : nominees.filter((n) => n.categoryId === filterCat);

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
          <h2 className="text-lg font-bold">Nominados</h2>
          <p className="text-white/30 text-xs mt-0.5">{nominees.length} proyectos</p>
        </div>
        <button
          onClick={() => { setShowAdd(true); setNewData(EMPTY); }}
          className="flex items-center gap-1.5 bg-[#FFA400] text-black text-xs font-semibold px-3 py-2 rounded-lg hover:bg-[#ffb520] transition-colors"
        >
          <Plus className="w-3.5 h-3.5" />
          Agregar nominado
        </button>
      </div>

      {/* Category filter */}
      <div className="flex items-center gap-2 mb-5 overflow-x-auto pb-1 scrollbar-hide">
        <button
          onClick={() => setFilterCat("all")}
          className={`text-xs px-3 py-1.5 rounded-full whitespace-nowrap transition-all border ${
            filterCat === "all"
              ? "bg-white/10 border-white/20 text-white"
              : "border-white/[0.06] text-white/30 hover:text-white/60"
          }`}
        >
          Todas ({nominees.length})
        </button>
        {CATEGORIES.map((cat) => {
          const count = nominees.filter((n) => n.categoryId === cat.id).length;
          return (
            <button
              key={cat.id}
              onClick={() => setFilterCat(cat.id)}
              className={`text-xs px-3 py-1.5 rounded-full whitespace-nowrap transition-all border ${
                filterCat === cat.id
                  ? "text-black font-semibold"
                  : "border-white/[0.06] text-white/30 hover:text-white/60"
              }`}
              style={
                filterCat === cat.id
                  ? { backgroundColor: cat.color, borderColor: cat.color }
                  : {}
              }
            >
              {cat.name} ({count})
            </button>
          );
        })}
      </div>

      {/* Add form */}
      {showAdd && (
        <div className="bg-white/[0.04] border border-white/[0.08] rounded-2xl p-5 mb-4">
          <p className="text-xs font-semibold text-white/50 uppercase tracking-wider mb-4">Nuevo nominado</p>
          <NomineeForm data={newData} onChange={setNewData} />
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

      {/* Nominees grid */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {filtered.length === 0 && (
          <div className="col-span-3 text-center py-16 text-white/20 text-sm">
            No hay nominados en esta categoría.
          </div>
        )}
        {filtered.map((n) => {
          const cat = CATEGORIES.find((c) => c.id === n.categoryId);
          return (
            <div
              key={n.id}
              className="bg-white/[0.04] border border-white/[0.07] rounded-2xl overflow-hidden hover:border-white/[0.12] transition-all"
            >
              {editingId === n.id ? (
                <div className="p-4">
                  <NomineeForm data={editData} onChange={setEditData} />
                  <div className="flex items-center gap-2 mt-4">
                    <button
                      onClick={() => handleUpdate(n.id!)}
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
                <>
                  {/* Image slider preview */}
                  <NomineeSliderPreview images={n.images} />
                  {/* Info */}
                  <div className="p-4">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span
                            className="text-[10px] font-semibold px-2 py-0.5 rounded-full"
                            style={{ backgroundColor: `${cat?.color}20`, color: cat?.color }}
                          >
                            {cat?.name}
                          </span>
                          <span className="text-[10px] text-white/30">{n.semester}</span>
                        </div>
                        <p className="text-sm font-semibold text-white truncate">{n.name}</p>
                        <p className="text-xs text-white/40 truncate italic">"{n.project}"</p>
                      </div>
                      <div className="flex items-center gap-1 flex-shrink-0">
                        <button
                          onClick={() => {
                            setEditingId(n.id!);
                            setEditData({
                              name: n.name, project: n.project, semester: n.semester,
                              categoryId: n.categoryId,
                              images: n.images.length >= 3 ? n.images : [...n.images, ...Array(3 - n.images.length).fill({ url: "" })],
                              description: n.description || "", order: n.order
                            });
                          }}
                          className="w-7 h-7 flex items-center justify-center rounded-lg text-white/30 hover:text-white hover:bg-white/10 transition-all"
                        >
                          <Pencil className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDelete(n.id!)}
                          className="w-7 h-7 flex items-center justify-center rounded-lg text-white/30 hover:text-red-400 hover:bg-red-400/10 transition-all"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                </>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── Nominee Slider Preview ───────────────────────────────────────────────────
function NomineeSliderPreview({ images }: { images: { url: string; caption?: string }[] }) {
  const [idx, setIdx] = useState(0);
  const validImages = images.filter((img) => img.url);

  if (validImages.length === 0) {
    return (
      <div className="aspect-video bg-white/[0.03] flex items-center justify-center">
        <Image className="w-6 h-6 text-white/10" />
      </div>
    );
  }

  return (
    <div className="aspect-video relative overflow-hidden bg-black group">
      <img
        src={validImages[idx].url}
        alt={`Imagen ${idx + 1}`}
        className="w-full h-full object-cover"
      />
      {validImages.length > 1 && (
        <>
          <button
            onClick={() => setIdx((i) => (i - 1 + validImages.length) % validImages.length)}
            className="absolute left-2 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-black/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
          >
            <ChevronLeft className="w-3.5 h-3.5 text-white" />
          </button>
          <button
            onClick={() => setIdx((i) => (i + 1) % validImages.length)}
            className="absolute right-2 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-black/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
          >
            <ChevronRight className="w-3.5 h-3.5 text-white" />
          </button>
          <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1">
            {validImages.map((_, i) => (
              <button
                key={i}
                onClick={() => setIdx(i)}
                className={`w-1.5 h-1.5 rounded-full transition-all ${i === idx ? "bg-white" : "bg-white/30"}`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}

// ─── Nominee Form ─────────────────────────────────────────────────────────────
function NomineeForm({
  data,
  onChange,
}: {
  data: Omit<NomineeDoc, "id">;
  onChange: (d: Omit<NomineeDoc, "id">) => void;
}) {
  function updateImage(idx: number, url: string) {
    const imgs = [...data.images];
    imgs[idx] = { ...imgs[idx], url };
    onChange({ ...data, images: imgs });
  }

  return (
    <div className="space-y-3">
      <div className="grid sm:grid-cols-2 gap-3">
        <input
          value={data.name}
          onChange={(e) => onChange({ ...data, name: e.target.value })}
          placeholder="Nombre del estudiante *"
          className="bg-white/[0.05] border border-white/[0.08] rounded-lg px-3 py-2 text-sm text-white placeholder-white/20 focus:outline-none focus:border-[#FFA400]/40 transition-colors"
        />
        <input
          value={data.project}
          onChange={(e) => onChange({ ...data, project: e.target.value })}
          placeholder="Nombre del proyecto *"
          className="bg-white/[0.05] border border-white/[0.08] rounded-lg px-3 py-2 text-sm text-white placeholder-white/20 focus:outline-none focus:border-[#FFA400]/40 transition-colors"
        />
        <input
          value={data.semester}
          onChange={(e) => onChange({ ...data, semester: e.target.value })}
          placeholder="Semestre (ej. 7mo)"
          className="bg-white/[0.05] border border-white/[0.08] rounded-lg px-3 py-2 text-sm text-white placeholder-white/20 focus:outline-none focus:border-[#FFA400]/40 transition-colors"
        />
        <select
          value={data.categoryId}
          onChange={(e) => onChange({ ...data, categoryId: e.target.value })}
          className="bg-white/[0.05] border border-white/[0.08] rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-[#FFA400]/40 transition-colors"
        >
          {CATEGORIES.map((cat) => (
            <option key={cat.id} value={cat.id} className="bg-[#111]">{cat.name}</option>
          ))}
        </select>
      </div>
      <textarea
        value={data.description}
        onChange={(e) => onChange({ ...data, description: e.target.value })}
        placeholder="Descripción del proyecto"
        rows={2}
        className="w-full bg-white/[0.05] border border-white/[0.08] rounded-lg px-3 py-2 text-sm text-white placeholder-white/20 focus:outline-none focus:border-[#FFA400]/40 transition-colors resize-none"
      />

      {/* Images 16:9 */}
      <div>
        <p className="text-[10px] text-white/30 uppercase tracking-wider mb-2">Imágenes del proyecto (formato 16:9)</p>
        <div className="grid gap-3">
          {[0, 1, 2].map((i) => (
            <div key={i} className="space-y-1.5">
              <div className="flex items-center gap-2">
                <span className="text-[10px] text-white/20 w-5">{i + 1}.</span>
                <input
                  value={data.images[i]?.url || ""}
                  onChange={(e) => updateImage(i, e.target.value)}
                  placeholder={`URL imagen ${i + 1}`}
                  className="flex-1 bg-white/[0.05] border border-white/[0.08] rounded-lg px-3 py-2 text-sm text-white placeholder-white/20 focus:outline-none focus:border-[#FFA400]/40 transition-colors"
                />
              </div>
              {data.images[i]?.url && (
                <div className="ml-7 aspect-video w-32 rounded-lg overflow-hidden">
                  <img src={data.images[i].url} alt="" className="w-full h-full object-cover" />
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
