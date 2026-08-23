"use client";

import { useEffect, useState } from "react";
import {
  DndContext,
  DragEndEvent,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  SortableContext,
  arrayMove,
  verticalListSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Motto } from "@/types/motto";
import {
  createMotto,
  deleteMotto,
  subscribeToMottos,
  updateMotto,
  updateMottoOrder,
} from "@/lib/mottoService";

function SortableMottoItem({
  motto,
  onDelete,
  onEdit,
}: {
  motto: Motto;
  onDelete: (id: string) => void;
  onEdit: (motto: Motto) => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({ id: motto.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="glass-panel p-4 rounded-sm border border-cyan-500/20 flex items-center gap-3"
    >
      <button
        type="button"
        {...attributes}
        {...listeners}
        className="px-2 py-1 border border-cyan-500/30 text-cyan-300 hover:text-white hover:border-cyan-400 transition-colors cursor-grab active:cursor-grabbing"
      >
        ⋮⋮
      </button>
      <p className="flex-1 text-white uppercase tracking-wide">{motto.text}</p>
      <button
        type="button"
        onClick={() => onEdit(motto)}
        className="px-3 py-1 border border-cyan-500/30 text-cyan-400 hover:bg-cyan-500/20 hover:border-cyan-400 transition-all uppercase text-xs tracking-wider"
      >
        Edit
      </button>
      <button
        type="button"
        onClick={() => onDelete(motto.id)}
        className="px-3 py-1 border border-red-500/30 text-red-400 hover:bg-red-500/20 hover:border-red-400 transition-all uppercase text-xs tracking-wider"
      >
        Delete
      </button>
    </div>
  );
}

export default function MottosPage() {
  const [mottos, setMottos] = useState<Motto[]>([]);
  const [newMotto, setNewMotto] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingText, setEditingText] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const unsubscribe = subscribeToMottos((updatedMottos) => {
      setMottos(updatedMottos);
    });

    return () => unsubscribe();
  }, []);

  const sensors = useSensors(useSensor(PointerSensor));

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMotto.trim()) return;
    setLoading(true);
    try {
      await createMotto(newMotto.trim());
      setNewMotto("");
    } catch (error) {
      console.error("Error creating motto:", error);
      alert("Failed to create motto.");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this motto?")) return;
    setLoading(true);
    try {
      await deleteMotto(id);
    } catch (error) {
      console.error("Error deleting motto:", error);
      alert("Failed to delete motto.");
    } finally {
      setLoading(false);
    }
  };

  const handleEditStart = (motto: Motto) => {
    setEditingId(motto.id);
    setEditingText(motto.text);
  };

  const handleEditSave = async () => {
    if (!editingId || !editingText.trim()) return;
    setLoading(true);
    try {
      await updateMotto(editingId, { text: editingText.trim() });
      setEditingId(null);
      setEditingText("");
    } catch (error) {
      console.error("Error updating motto:", error);
      alert("Failed to update motto.");
    } finally {
      setLoading(false);
    }
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = mottos.findIndex((m) => m.id === active.id);
    const newIndex = mottos.findIndex((m) => m.id === over.id);

    if (oldIndex < 0 || newIndex < 0) return;

    const reordered = arrayMove(mottos, oldIndex, newIndex);
    setMottos(reordered);

    try {
      await updateMottoOrder(reordered);
    } catch (error) {
      console.error("Error updating motto order:", error);
      alert("Failed to save new motto order.");
    }
  };

  return (
    <div className="min-h-screen p-4 sm:p-8">
      <main className="max-w-5xl mx-auto">
        <h1 className="text-4xl font-bold text-white uppercase tracking-widest text-glow mb-8">
          Motto Board
        </h1>

        <div className="glass-panel p-6 mb-8 rounded-sm">
          <h2 className="text-2xl font-bold text-cyan-400 uppercase tracking-wide mb-6 border-b border-cyan-500/30 pb-2">
            Add Motto
          </h2>
          <form onSubmit={handleCreate} className="flex gap-3">
            <input
              type="text"
              value={newMotto}
              onChange={(e) => setNewMotto(e.target.value)}
              placeholder="ENTER ENCOURAGING MOTTO"
              className="flex-1 px-4 py-3 bg-slate-900/50 border border-cyan-500/30 rounded-sm text-white focus:ring-1 focus:ring-cyan-400 focus:border-cyan-400 transition-all placeholder-slate-600"
            />
            <button type="submit" disabled={loading} className="btn-tech px-6 py-3 font-bold text-sm">
              Add
            </button>
          </form>
        </div>

        <div className="glass-panel p-6 rounded-sm">
          <h2 className="text-2xl font-bold text-cyan-400 uppercase tracking-wide mb-6 border-b border-cyan-500/30 pb-2">
            Your Mottos (Drag to Rearrange)
          </h2>

          {editingId && (
            <div className="mb-6 p-4 border border-cyan-500/30 rounded-sm bg-slate-900/40">
              <label className="block text-sm font-bold text-cyan-100 uppercase tracking-wider mb-2">
                Edit Motto
              </label>
              <div className="flex gap-3">
                <input
                  type="text"
                  value={editingText}
                  onChange={(e) => setEditingText(e.target.value)}
                  className="flex-1 px-4 py-3 bg-slate-900/50 border border-cyan-500/30 rounded-sm text-white focus:ring-1 focus:ring-cyan-400 focus:border-cyan-400 transition-all"
                />
                <button type="button" onClick={handleEditSave} disabled={loading} className="btn-tech px-5 py-3 text-sm font-bold">
                  Save
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setEditingId(null);
                    setEditingText("");
                  }}
                  className="px-5 py-3 border border-slate-600 text-slate-400 hover:text-white hover:border-slate-400 transition-colors uppercase tracking-wider font-bold text-sm"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}

          {mottos.length === 0 ? (
            <p className="text-cyan-400/60 text-center py-12 uppercase tracking-widest border border-dashed border-cyan-500/20 rounded-sm">
              No mottos yet. Add your first encouragement above.
            </p>
          ) : (
            <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
              <SortableContext items={mottos.map((m) => m.id)} strategy={verticalListSortingStrategy}>
                <div className="space-y-3">
                  {mottos.map((motto) => (
                    <SortableMottoItem
                      key={motto.id}
                      motto={motto}
                      onDelete={handleDelete}
                      onEdit={handleEditStart}
                    />
                  ))}
                </div>
              </SortableContext>
            </DndContext>
          )}
        </div>
      </main>
    </div>
  );
}
