"use client";

import { useState, useEffect } from "react";
import { DailyQuest } from "@/types/quest";
import {
  subscribeToQuests,
  createQuest,
  updateQuest,
  deleteQuest,
  getNextQuestId,
} from "@/lib/questService";

export default function QuestsPage() {
  const [quests, setQuests] = useState<DailyQuest[]>([]);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editingFirestoreId, setEditingFirestoreId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    name: "",
    quantity: 0,
    unit: "",
    priority: 0,
  });

  // Subscribe to real-time updates from Firestore
  useEffect(() => {
    const unsubscribe = subscribeToQuests((updatedQuests) => {
      setQuests(updatedQuests);
    });

    // Cleanup subscription on unmount
    return () => unsubscribe();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (editingId !== null && editingFirestoreId) {
        // Update existing quest
        await updateQuest(editingFirestoreId, {
          ...formData,
          id: editingId,
        });
        setEditingId(null);
        setEditingFirestoreId(null);
      } else {
        // Create new quest
        const nextId = await getNextQuestId();
        await createQuest({
          id: nextId,
          ...formData,
        });
      }

      // Reset form
      setFormData({ name: "", quantity: 0, unit: "", priority: 0 });
    } catch (error) {
      console.error("Error saving quest:", error);
      alert("Failed to save quest. Please check your Firebase configuration.");
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (quest: DailyQuest) => {
    setEditingId(quest.id);
    setEditingFirestoreId(quest.firestoreId || null);
    setFormData({
      name: quest.name,
      quantity: quest.quantity,
      unit: quest.unit,
      priority: quest.priority || 0,
    });
  };

  const handleDelete = async (firestoreId: string) => {
    if (!confirm("Are you sure you want to delete this quest?")) return;

    setLoading(true);
    try {
      await deleteQuest(firestoreId);
    } catch (error) {
      console.error("Error deleting quest:", error);
      alert("Failed to delete quest.");
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setEditingId(null);
    setEditingFirestoreId(null);
    setFormData({ name: "", quantity: 0, unit: "", priority: 0 });
  };

  return (
    <div className="min-h-screen p-4 sm:p-8">
      <main className="max-w-5xl mx-auto">
        <h1 className="text-4xl font-bold text-white uppercase tracking-widest text-glow mb-8">
          Quest Management
        </h1>

        {/* Create/Edit Form */}
        <div className="glass-panel p-6 mb-8 rounded-sm">
          <h2 className="text-2xl font-bold text-cyan-400 uppercase tracking-wide mb-6 border-b border-cyan-500/30 pb-2">
            {editingId !== null ? "Edit Mission Parameters" : "Initialize New Mission"}
          </h2>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="name" className="block text-sm font-bold text-cyan-100 uppercase tracking-wider mb-2">
                Quest Name
              </label>
              <input
                id="name"
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-4 py-3 bg-slate-900/50 border border-cyan-500/30 rounded-sm text-white focus:ring-1 focus:ring-cyan-400 focus:border-cyan-400 transition-all placeholder-slate-600"
                placeholder="ENTER MISSION OBJECTIVE"
                required
              />
            </div>

            <div className="grid grid-cols-3 gap-6">
              <div>
                <label htmlFor="quantity" className="block text-sm font-bold text-cyan-100 uppercase tracking-wider mb-2">
                  Target Quantity
                </label>
                <input
                  id="quantity"
                  type="number"
                  value={formData.quantity}
                  onChange={(e) => setFormData({ ...formData, quantity: Number(e.target.value) })}
                  className="w-full px-4 py-3 bg-slate-900/50 border border-cyan-500/30 rounded-sm text-white focus:ring-1 focus:ring-cyan-400 focus:border-cyan-400 transition-all"
                  required
                />
              </div>

              <div>
                <label htmlFor="unit" className="block text-sm font-bold text-cyan-100 uppercase tracking-wider mb-2">
                  Unit Type
                </label>
                <input
                  id="unit"
                  type="text"
                  value={formData.unit}
                  onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                  className="w-full px-4 py-3 bg-slate-900/50 border border-cyan-500/30 rounded-sm text-white focus:ring-1 focus:ring-cyan-400 focus:border-cyan-400 transition-all placeholder-slate-600"
                  placeholder="e.g. KILLS, REPS"
                  required
                />
              </div>

              <div>
                <label htmlFor="priority" className="block text-sm font-bold text-cyan-100 uppercase tracking-wider mb-2">
                  Priority
                </label>
                <input
                  id="priority"
                  type="number"
                  value={formData.priority}
                  onChange={(e) => setFormData({ ...formData, priority: Number(e.target.value) })}
                  className="w-full px-4 py-3 bg-slate-900/50 border border-cyan-500/30 rounded-sm text-white focus:ring-1 focus:ring-cyan-400 focus:border-cyan-400 transition-all placeholder-slate-600"
                  placeholder="0 (High)"
                />
              </div>
            </div>

            <div className="flex gap-4 pt-4">
              <button
                type="submit"
                disabled={loading}
                className="btn-tech px-8 py-3 font-bold text-sm flex-grow sm:flex-grow-0 min-w-[160px]"
              >
                {loading ? "PROCESSING..." : editingId !== null ? "UPDATE PARAMETERS" : "INITIATE MISSION"}
              </button>
              {editingId !== null && (
                <button
                  type="button"
                  onClick={handleCancel}
                  disabled={loading}
                  className="px-8 py-3 border border-slate-600 text-slate-400 hover:text-white hover:border-slate-400 transition-colors uppercase tracking-wider font-bold text-sm"
                >
                  Abort
                </button>
              )}
            </div>
          </form>
        </div>

        {/* Quest List */}
        <div className="glass-panel p-6 rounded-sm">
          <h2 className="text-2xl font-bold text-cyan-400 uppercase tracking-wide mb-6 border-b border-cyan-500/30 pb-2">
            Active Missions Database
          </h2>
          
          {quests.length === 0 ? (
            <p className="text-cyan-400/60 text-center py-12 uppercase tracking-widest border border-dashed border-cyan-500/20 rounded-sm">
              No mission data found. Initialize new mission above.
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-cyan-500/30 text-cyan-400/80 text-xs uppercase tracking-widest">
                    <th className="py-4 px-4 font-medium">ID</th>
                    <th className="py-4 px-4 font-medium">Objective</th>
                    <th className="py-4 px-4 font-medium">Target</th>
                    <th className="py-4 px-4 font-medium">Unit</th>
                    <th className="py-4 px-4 font-medium">Priority</th>
                    <th className="py-4 px-4 font-medium text-right">Operations</th>
                  </tr>
                </thead>
                <tbody className="text-sm">
                  {quests.map((quest) => (
                    <tr 
                      key={quest.id}
                      className="border-b border-cyan-500/10 hover:bg-cyan-500/5 transition-colors group"
                    >
                      <td className="py-4 px-4 text-slate-400 font-mono">#{quest.id.toString().padStart(3, '0')}</td>
                      <td className="py-4 px-4 text-white font-bold uppercase tracking-wide group-hover:text-cyan-300 transition-colors">{quest.name}</td>
                      <td className="py-4 px-4 text-cyan-100 font-mono text-lg">{quest.quantity}</td>
                      <td className="py-4 px-4 text-slate-400 uppercase text-xs">{quest.unit}</td>
                      <td className="py-4 px-4 text-slate-400 font-mono">{quest.priority ?? 999}</td>
                      <td className="py-4 px-4 text-right">
                        <div className="flex gap-2 justify-end">
                          <button
                            onClick={() => handleEdit(quest)}
                            disabled={loading}
                            className="px-3 py-1 border border-cyan-500/30 text-cyan-400 hover:bg-cyan-500/20 hover:border-cyan-400 transition-all uppercase text-xs tracking-wider"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => quest.firestoreId && handleDelete(quest.firestoreId)}
                            disabled={loading}
                            className="px-3 py-1 border border-red-500/30 text-red-400 hover:bg-red-500/20 hover:border-red-400 transition-all uppercase text-xs tracking-wider"
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
