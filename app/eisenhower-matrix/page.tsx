"use client";

import { useState, useEffect } from "react";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragOverlay,
  defaultDropAnimationSideEffects,
  DragStartEvent,
  DragOverEvent,
  DragEndEvent,
  DropAnimation,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { EisenhowerItem } from "@/types/eisenhower";
import {
  subscribeToEisenhowerItems,
  addEisenhowerItem,
  updateEisenhowerItem,
  deleteEisenhowerItem,
  updateEisenhowerOrder,
} from "@/lib/eisenhowerService";

const quadrants = {
  "urgent-important": { title: "Do First", color: "red" },
  "not-urgent-important": { title: "Schedule", color: "cyan" },
  "urgent-not-important": { title: "Delegate", color: "yellow" },
  "not-urgent-not-important": { title: "Don't Do", color: "slate" },
};

function SortableItem({ item }: { item: EisenhowerItem }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: item.id,
    data: { item },
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={`p-3 mb-2 rounded bg-slate-800/50 border border-slate-700/50 hover:border-cyan-500/30 group flex justify-between items-center cursor-grab active:cursor-grabbing ${
        item.completed ? "opacity-50" : ""
      }`}
    >
      <div className="flex items-center gap-2 overflow-hidden">
        <input
          type="checkbox"
          checked={item.completed}
          onChange={(e) => {
            e.stopPropagation(); // prevent drag
            updateEisenhowerItem(item.id, { completed: !item.completed });
          }}
          className="w-4 h-4 rounded border-slate-600 bg-slate-900/50 text-cyan-500 focus:ring-0 focus:ring-offset-0 cursor-pointer"
          onPointerDown={(e) => e.stopPropagation()} 
        />
        <span
          className={`text-sm truncate ${
            item.completed ? "line-through text-slate-500" : "text-slate-200"
          }`}
        >
          {item.title}
        </span>
      </div>
      <button
        onClick={(e) => {
          e.stopPropagation(); // prevent drag
          deleteEisenhowerItem(item.id);
        }}
        className="text-slate-500 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity"
        onPointerDown={(e) => e.stopPropagation()}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={1.5}
          stroke="currentColor"
          className="w-4 h-4"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M6 18L18 6M6 6l12 12"
          />
        </svg>
      </button>
    </div>
  );
}

function Quadrant({
  id,
  title,
  items,
  color,
  onAddItem,
}: {
  id: string;
  title: string;
  items: EisenhowerItem[];
  color: string;
  onAddItem: (text: string) => void;
}) {
  const [newItemText, setNewItemText] = useState("");
  const { setNodeRef } = useSortable({
    id: id,
    data: { type: "container", id },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newItemText.trim()) return;
    onAddItem(newItemText);
    setNewItemText("");
  };

  const colorClasses = {
    red: "border-red-500/20 bg-red-500/5 text-red-200",
    cyan: "border-cyan-500/20 bg-cyan-500/5 text-cyan-200",
    yellow: "border-amber-500/20 bg-amber-500/5 text-amber-200",
    slate: "border-slate-500/20 bg-slate-500/5 text-slate-200",
  };

  const headerColorClasses = {
    red: "text-red-400 border-red-500/30 bg-red-900/20",
    cyan: "text-cyan-400 border-cyan-500/30 bg-cyan-900/20",
    yellow: "text-amber-400 border-amber-500/30 bg-amber-900/20",
    slate: "text-slate-400 border-slate-500/30 bg-slate-900/20",
  };

  return (
    <div className="flex flex-col h-full rounded-lg overflow-hidden border border-slate-800 bg-slate-900/30">
      <div
        className={`p-3 font-bold text-sm uppercase tracking-wider border-b ${
          headerColorClasses[color as keyof typeof headerColorClasses]
        }`}
      >
        {title}
      </div>
      <div
        ref={setNodeRef}
        className={`flex-1 p-4 min-h-[200px] overflow-y-auto ${
          colorClasses[color as keyof typeof colorClasses]
        }`}
      >
        <SortableContext
          items={items.map((i) => i.id)}
          strategy={verticalListSortingStrategy}
        >
          {items.map((item) => (
            <SortableItem key={item.id} item={item} />
          ))}
        </SortableContext>
      </div>
      <form
        onSubmit={handleSubmit}
        className="p-3 bg-slate-900/50 border-t border-slate-800"
      >
        <input
          type="text"
          value={newItemText}
          onChange={(e) => setNewItemText(e.target.value)}
          placeholder="Add task..."
          className="w-full bg-slate-800 border-slate-700 rounded px-3 py-1.5 text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500/50"
        />
      </form>
    </div>
  );
}

export default function EisenhowerPage() {
  const [items, setItems] = useState<EisenhowerItem[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = subscribeToEisenhowerItems((newItems) => {
      setItems(newItems);
    });
    return () => unsubscribe();
  }, []);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string);
  };

  const handleDragOver = (event: DragOverEvent) => {
    const { active, over } = event;
    if (!over) return;

    // Find the containers
    const activeContainerId = items.find((i) => i.id === active.id)?.quadrant;
    // Over could be an item or a container
    let overContainerId = over.id as string;
    
    // If over is an item, find its container
    const overItem = items.find((i) => i.id === over.id);
    if (overItem) {
      overContainerId = overItem.quadrant;
    }

    if (
      activeContainerId &&
      overContainerId &&
      activeContainerId !== overContainerId &&
      Object.keys(quadrants).includes(overContainerId)
    ) {
      // Optimistic update for dragging between containers
      setItems((prev) => {
        const activeItem = prev.find((i) => i.id === active.id);
        if (!activeItem) return prev;
        
        // Remove from old container and add to new container locally
        // But dragEnd will handle the final persistence
        return prev.map((item) => {
            if (item.id === active.id) {
                return { ...item, quadrant: overContainerId as any };
            }
            return item;
        });
      });
    }
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveId(null);

    if (!over) return;

    const activeItem = items.find((i) => i.id === active.id);
    const overItem = items.find((i) => i.id === over.id);

    // Identify target quadrant
    let targetQuadrant = over.id as string;
    // If we dropped over an item, get that item's quadrant
    if (overItem) {
      targetQuadrant = overItem.quadrant;
    }

    // Check if target is valid quadrant
    if (!Object.keys(quadrants).includes(targetQuadrant) && !overItem) {
        return; 
    }

    if (activeItem) {
      // Reorder logic
      // If we dropped on the same container and it's sorting
      if (active.id !== over.id && activeItem.quadrant === targetQuadrant) {
        const oldIndex = items.findIndex((i) => i.id === active.id);
        const newIndex = items.findIndex((i) => i.id === over.id);
        const newItems = arrayMove(items, oldIndex, newIndex);
        setItems(newItems);
        // Update order in Firebase for all items in this quadrant
        // To be safe and simple, we re-assign order based on index
        const quadrantItems = newItems.filter(i => i.quadrant === targetQuadrant);
        const updates = quadrantItems.map((item, index) => ({
            ...item,
            order: index
        }));
        updateEisenhowerOrder(updates);
      } else if (activeItem.quadrant !== targetQuadrant) {
          // Moved to another quadrant 
          // (Handled optimistically in DragOver mostly, but finalize here)
          const newItems = items.map(item => {
              if (item.id === active.id) {
                  return { ...item, quadrant: targetQuadrant as any };
              }
              return item;
          });
          setItems(newItems);
          // Update the item in firebase
          updateEisenhowerItem(activeItem.id, { quadrant: targetQuadrant as any });
          
          // Also optionally reorder the target quadrant
          // For simplicity, we just push to the end or keep current position if we can calculate it
          // Let's just update the item's quadrant and let it float
      }
    }
  };

  const dropAnimation: DropAnimation = {
    sideEffects: defaultDropAnimationSideEffects({
      styles: {
        active: {
          opacity: '0.5',
        },
      },
    }),
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 p-8 pt-4">
      <div className="max-w-7xl mx-auto">
        <header className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2 text-glow">
            Eisenhower Matrix
          </h1>
          <p className="text-slate-400">
            Prioritize your tasks by urgency and importance.
          </p>
        </header>

        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragStart={handleDragStart}
          onDragOver={handleDragOver}
          onDragEnd={handleDragEnd}
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 h-[calc(100vh-200px)]">
            {Object.entries(quadrants).map(([key, { title, color }]) => (
              <Quadrant
                key={key}
                id={key}
                title={title}
                color={color}
                items={items.filter((i) => i.quadrant === key)}
                onAddItem={(text) =>
                  addEisenhowerItem(text, key as any)
                }
              />
            ))}
          </div>
          <DragOverlay dropAnimation={dropAnimation}>
            {activeId ? (
                <div className="p-3 mb-2 rounded bg-slate-800 border border-cyan-500/50 shadow-lg shadow-cyan-500/20">
                    {items.find(i => i.id === activeId)?.title}
                </div>
            ) : null}
          </DragOverlay>
        </DndContext>
      </div>
    </div>
  );
}
