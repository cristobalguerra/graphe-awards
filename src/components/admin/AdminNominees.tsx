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
import { Plus, Trash2, Pencil, Check, X, ChevronLeft, ChevronRight, Image as ImageIcon } from "lucide-react";

const NOMINEES_PER_CATEGORY = 3;

const EMPTY_NOMINEE = (categoryId: string, order: number): Omit<NomineeDoc, "id"> => ({
  name: "",
  project: "",
  semester: "",
  categoryId,
  images: [{ url: "" }, { url: "" }, { url: "" }],
  description: "",
  order,
});


export default function AdminNominees() {
  const [nominees, setNominees] = useState<NomineeDoc[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editData, setEditData] = useState<Omit<NomineeDoc, "id"> | null>(null);
  const [addingSlot, setAddingSlot] = useState<{ catId: string; slot: number } | null>(null);
  const [newData, setNewData] = useState<Omit<NomineeDoc, "id"> | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    refresh();
  }, []);

  async function refresh() {
    const data = await getNominees();
    setNominees(data);
    setLoading(false);
  }

  async function handleAdd() {
    if (!newData || !newData.name || !newData.project) return;
    setSaving(true);
    await addNominee(newData);
    setAddingSlot(null);
    setNewData(null);
    await refresh();
    setSaving(false);
  }

  async function handleUpdate(id: string) {
    if (!editData) return;
    setSaving(true);
    await updateNominee(id, editData);
    setEditingId(null);
    setEditData(null);
    await refresh();
    setSaving(false);
  }

  async function handleDelete(id: string) {
    if (!confirm("¿Eliminar este nominado?")) return;
    await deleteNominee(id);
    await refresh();
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-5 h-5 border-2 border-white/20 border-t-[#FFA400] rounded-full animate-spin" />
      </div>
    );
  }

  const total = nominees.length;

  return (
    <div>
      <div className="mb-8">
        <h2 className="text-lg font-bold">Nominados</h2>
        <p className="text-white/30 text-xs mt-0.5">
          {total} de {CATEGORIES.length * NOMINEES_PER_CATEGORY} slots llenos · 3 proyectos por categoría
        </p>
      </div>

      {/* Una sección por categoría */}
      <div className="space-y-8">
        {CATEGORIES.map((cat) => {
          const catNominees = nominees
            .filter((n) => n.categoryId === cat.id)
            .sort((a, b) => a.order - b.order);

          return (
            <div key={cat.id} className="rounded-2xl border border-white/[0.07] overflow-hidden">
              {/* Category header */}
              <div
                className="px-5 py-3 flex items-center gap-3 border-b border-white/[0.06]"
                style={{ backgroundColor: `${cat.color}10` }}
              >
                <div
                  className="w-2 h-2 rounded-full"
                  style={{ backgroundColor: cat.color }}
                />
                <span className="text-sm font-semibold text-white">{cat.name}</span>
                <span className="text-xs text-white/30 ml-auto">
                  {catNominees.length}/{NOMINEES_PER_CATEGORY} nominados
                </span>
              </div>

              {/* 3 slots */}
              <div className="grid sm:grid-cols-3 divide-x divide-white/[0.05]">
                {Array.from({ length: NOMINEES_PER_CATEGORY }).map((_, slotIdx) => {
                  const nominee = catNominees[slotIdx];
                  const isEditing = nominee && editingId === nominee.id;
                  const isAdding = !nominee && addingSlot?.catId === cat.id && addingSlot?.slot === slotIdx;

                  return (
                    <div key={slotIdx} className="min-h-[180px] bg-[#111110]">
                      {/* Slot vacío */}
                      {!nominee && !isAdding && (
                        <button
                          onClick={() => {
                            setAddingSlot({ catId: cat.id, slot: slotIdx });
                            setNewData(EMPTY_NOMINEE(cat.id, slotIdx));
                          }}
                          className="w-full h-full min-h-[180px] flex flex-col items-center justify-center gap-2 text-white/20 hover:text-white/40 hover:bg-white/[0.02] transition-all group"
                        >
                          <div
                            className="w-8 h-8 rounded-full border border-dashed border-white/10 group-hover:border-white/20 flex items-center justify-center transition-all"
                            style={{ borderColor: `${cat.color}30` }}
                          >
                            <Plus className="w-4 h-4" style={{ color: cat.color + "60" }} />
                          </div>
                          <span className="text-[10px] tracking-wider uppercase">Nominado {slotIdx + 1}</span>
                        </button>
                      )}

                      {/* Formulario de agregar */}
                      {isAdding && newData && (
                        <div className="p-4 space-y-3">
                          <p className="text-[10px] font-semibold uppercase tracking-wider mb-3" style={{ color: cat.color }}>
                            Nominado {slotIdx + 1}
                          </p>
                          <NomineeForm data={newData} onChange={setNewData} catColor={cat.color} />
                          <div className="flex gap-2 pt-1">
                            <button
                              onClick={handleAdd}
                              disabled={saving}
                              className="flex items-center gap-1 text-[11px] font-semibold px-3 py-1.5 rounded-lg transition-colors disabled:opacity-50 text-black"
                              style={{ backgroundColor: cat.color }}
                            >
                              <Check className="w-3 h-3" />
                              {saving ? "..." : "Guardar"}
                            </button>
                            <button
                              onClick={() => { setAddingSlot(null); setNewData(null); }}
                              className="text-[11px] text-white/30 hover:text-white/60 px-2 py-1.5 transition-colors"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </div>
                        </div>
                      )}

                      {/* Nominado existente */}
                      {nominee && !isEditing && (
                        <div className="h-full">
                          {/* Slider preview */}
                          <SliderPreview images={nominee.images} color={cat.color} />
                          {/* Info */}
                          <div className="p-3">
                            <p className="text-xs font-semibold text-white leading-tight">{nominee.name}</p>
                            <p className="text-[11px] text-white/40 italic mt-0.5">"{nominee.project}"</p>
                            <p className="text-[10px] text-white/25 mt-1 uppercase tracking-wider">{nominee.semester}</p>
                            <div className="flex gap-1 mt-2">
                              <button
                                onClick={() => {
                                  setEditingId(nominee.id!);
                                  setEditData({
                                    name: nominee.name,
                                    project: nominee.project,
                                    semester: nominee.semester,
                                    categoryId: nominee.categoryId,
                                    images: nominee.images.length >= 3
                                      ? nominee.images
                                      : [...nominee.images, ...Array(3 - nominee.images.length).fill({ url: "" })],
                                    description: nominee.description || "",
                                    order: nominee.order,
                                  });
                                }}
                                className="flex items-center gap-1 text-[10px] text-white/30 hover:text-white px-2 py-1 rounded-lg hover:bg-white/10 transition-all"
                              >
                                <Pencil className="w-3 h-3" /> Editar
                              </button>
                              <button
                                onClick={() => handleDelete(nominee.id!)}
                                className="flex items-center gap-1 text-[10px] text-white/30 hover:text-red-400 px-2 py-1 rounded-lg hover:bg-red-400/10 transition-all"
                              >
                                <Trash2 className="w-3 h-3" />
                              </button>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Editando nominado existente */}
                      {nominee && isEditing && editData && (
                        <div className="p-4 space-y-3">
                          <p className="text-[10px] font-semibold uppercase tracking-wider mb-3" style={{ color: cat.color }}>
                            Editando nominado {slotIdx + 1}
                          </p>
                          <NomineeForm data={editData} onChange={setEditData} catColor={cat.color} />
                          <div className="flex gap-2 pt-1">
                            <button
                              onClick={() => handleUpdate(nominee.id!)}
                              disabled={saving}
                              className="flex items-center gap-1 text-[11px] font-semibold px-3 py-1.5 rounded-lg transition-colors disabled:opacity-50 text-black"
                              style={{ backgroundColor: cat.color }}
                            >
                              <Check className="w-3 h-3" />
                              {saving ? "..." : "Guardar"}
                            </button>
                            <button
                              onClick={() => { setEditingId(null); setEditData(null); }}
                              className="text-[11px] text-white/30 hover:text-white/60 px-2 py-1.5 transition-colors"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── Slider preview ───────────────────────────────────────────────────────────
function SliderPreview({ images, color }: { images: { url: string }[]; color: string }) {
  const [idx, setIdx] = useState(0);
  const valid = images?.filter((i) => i.url) || [];
  if (valid.length === 0) {
    return (
      <div className="aspect-video bg-white/[0.02] flex items-center justify-center">
        <ImageIcon className="w-5 h-5 text-white/10" />
      </div>
    );
  }
  return (
    <div className="aspect-video relative overflow-hidden group bg-black">
      <img src={valid[idx].url} alt="" className="w-full h-full object-cover" />
      {valid.length > 1 && (
        <>
          <button onClick={() => setIdx((i) => (i - 1 + valid.length) % valid.length)}
            className="absolute left-1 top-1/2 -translate-y-1/2 w-5 h-5 rounded-full bg-black/70 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
            <ChevronLeft className="w-3 h-3 text-white" />
          </button>
          <button onClick={() => setIdx((i) => (i + 1) % valid.length)}
            className="absolute right-1 top-1/2 -translate-y-1/2 w-5 h-5 rounded-full bg-black/70 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
            <ChevronRight className="w-3 h-3 text-white" />
          </button>
          <div className="absolute bottom-1 left-1/2 -translate-x-1/2 flex gap-1">
            {valid.map((_, i) => (
              <button key={i} onClick={() => setIdx(i)}
                className="w-1 h-1 rounded-full transition-all"
                style={{ backgroundColor: i === idx ? color : "rgba(255,255,255,0.3)" }} />
            ))}
          </div>
        </>
      )}
    </div>
  );
}

// ─── Nominee form ─────────────────────────────────────────────────────────────
function NomineeForm({
  data,
  onChange,
  catColor,
}: {
  data: Omit<NomineeDoc, "id">;
  onChange: (d: Omit<NomineeDoc, "id"> | null) => void;
  catColor: string;
}) {
  function updateImage(idx: number, url: string) {
    const imgs = [...data.images];
    imgs[idx] = { ...imgs[idx], url };
    onChange({ ...data, images: imgs });
  }

  const inputCls = "w-full bg-white/[0.05] border border-white/[0.08] rounded-lg px-3 py-2 text-xs text-white placeholder-white/20 focus:outline-none transition-colors";

  return (
    <div className="space-y-2">
      <input value={data.name} onChange={(e) => onChange({ ...data, name: e.target.value })}
        placeholder="Nombre del estudiante *" className={inputCls}
        style={{ borderColor: data.name ? `${catColor}40` : undefined }} />
      <input value={data.project} onChange={(e) => onChange({ ...data, project: e.target.value })}
        placeholder="Nombre del proyecto *" className={inputCls} />

      {/* 3 imágenes */}
      <div className="space-y-1.5">
        <p className="text-[9px] text-white/20 uppercase tracking-widest">Imágenes 16:9</p>
        {[0, 1, 2].map((i) => (
          <div key={i} className="flex items-center gap-2">
            <span className="text-[9px] text-white/20 w-3">{i + 1}</span>
            <input
              value={data.images[i]?.url || ""}
              onChange={(e) => updateImage(i, e.target.value)}
              placeholder={`URL imagen ${i + 1}`}
              className={inputCls}
            />
            {data.images[i]?.url && (
              <div className="w-8 h-5 rounded overflow-hidden flex-shrink-0">
                <img src={data.images[i].url} alt="" className="w-full h-full object-cover" />
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
