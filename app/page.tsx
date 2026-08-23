"use client";

import { useState, useEffect } from "react";
import { DailyQuest, DailyProgress } from "@/types/quest";
import {
  subscribeToQuests,
  subscribeToProgress,
  updateProgress,
} from "@/lib/questService";

export default function Home() {
  const [quests, setQuests] = useState<DailyQuest[]>([]);
  const [progress, setProgress] = useState<DailyProgress[]>([]);
  const [selectedDate, setSelectedDate] = useState(() => {
    const now = new Date();
    // Adjust for local timezone to ensure we get the correct local date
    const localDate = new Date(now.getTime() - (now.getTimezoneOffset() * 60000));
    return localDate.toISOString().split("T")[0];
  });

  // Subscribe to quests
  useEffect(() => {
    const unsubscribe = subscribeToQuests((updatedQuests) => {
      setQuests(updatedQuests);
    });
    return () => unsubscribe();
  }, []);

  // Subscribe to progress for selected date
  useEffect(() => {
    const unsubscribe = subscribeToProgress(selectedDate, (updatedProgress) => {
      setProgress(updatedProgress);
    });
    return () => unsubscribe();
  }, [  selectedDate]);

  const handleDateChange = (days: number) => {
    const date = new Date(selectedDate);
    date.setDate(date.getDate() + days);
    setSelectedDate(date.toISOString().split("T")[0]);
  };

  const handleProgressUpdate = async (
    questId: number,
    newQuantity: number,
    existingProgress?: DailyProgress
  ) => {
    try {
      await updateProgress(questId, selectedDate, newQuantity, existingProgress);
    } catch (error) {
      console.error("Error updating progress:", error);
      alert("Failed to update progress.");
    }
  };

  const getProgressForQuest = (questId: number) => {
    return progress.find((p) => p.questId === questId);
  };

  // Calculate total daily progress
  const totalQuests = quests.length;
  const completedQuests = quests.filter(q => {
    const p = getProgressForQuest(q.id);
    return (p?.quantity || 0) >= q.quantity;
  }).length;
  const dailyPercentage = totalQuests > 0 ? (completedQuests / totalQuests) * 100 : 0;

  return (
    <div className="min-h-screen p-4 sm:p-8">
      <main className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-[1fr_2fr] gap-8 items-start">
        {/* Character Image - Left Side */}
        <div className="hidden lg:block sticky top-8 h-[80vh] rounded-sm overflow-hidden border border-cyan-900/30 relative group">
          {/* Overlay Gradients for blending */}
          <div className="absolute inset-0 bg-gradient-to-t from-[#000000] via-transparent to-transparent z-10" />
          <div className="absolute inset-0 bg-gradient-to-r from-[#000000]/80 via-transparent to-transparent z-10" />
          <div className="absolute inset-0 bg-cyan-500/10 mix-blend-overlay z-20" />
          
          {/* High Res Image */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img 
            src="/igris.jpg" 
            alt="Igris" 
            className="w-full h-full object-cover object-[center_20%] opacity-90 transition-transform duration-700 group-hover:scale-105"
          />
          
          {/* Name Tag */}
          <div className="absolute bottom-8 left-8 z-30">
            <h2 className="text-4xl font-bold text-white uppercase tracking-widest text-glow">IGRIS</h2>
            <p className="text-red-500 font-mono tracking-widest text-sm">THE BLOOD RED COMMANDER</p>
          </div>
        </div>

        {/* Main Content - Right Side */}
        <div className="w-full">
        <div className="flex flex-col md:flex-row justify-between items-end mb-8 gap-4">
          <div>
            <h1 className="text-4xl font-bold text-white uppercase tracking-widest text-glow mb-2">
              Daily Progress
            </h1>
            <p className="text-cyan-400/80 uppercase tracking-wider text-sm">
              Complete missions to earn rewards
            </p>
          </div>

          {/* Date Picker */}
          <div className="glass-panel px-4 py-2 rounded-sm flex items-center gap-4">
            <button
              onClick={() => handleDateChange(-1)}
              className="text-cyan-400 hover:text-white transition-colors"
            >
              ◀
            </button>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="bg-transparent border-none text-white focus:ring-0 font-mono uppercase"
            />
            <button
              onClick={() => handleDateChange(1)}
              className="text-cyan-400 hover:text-white transition-colors"
            >
              ▶
            </button>
          </div>
        </div>

        {/* Daily Progress Summary */}
        <div className="glass-panel p-4 mb-8 rounded-sm flex items-center gap-4">
          <div className="flex-grow">
            <div className="flex justify-between text-sm uppercase tracking-wider mb-2">
              <span className="text-cyan-400">Daily Progress</span>
              <span className="text-white">{completedQuests} / {totalQuests} Completed</span>
            </div>
            <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden border border-slate-700/50">
              <div 
                className="h-full bg-yellow-500 transition-all duration-500 ease-out relative"
                style={{ width: `${dailyPercentage}%` }}
              >
                <div className="absolute right-0 top-0 bottom-0 w-2 bg-white/50 blur-[2px]" />
              </div>
            </div>
          </div>
        </div>

        {/* Progress List */}
        <div className="space-y-4">
          {quests.length === 0 ? (
            <div className="glass-panel p-8 text-center text-cyan-400/60 uppercase tracking-widest">
              No active missions detected.
            </div>
          ) : (
            quests.map((quest) => {
              const questProgress = getProgressForQuest(quest.id);
              const currentQuantity = questProgress?.quantity || 0;
              const percentage = Math.min(
                (currentQuantity / quest.quantity) * 100,
                100
              );
              const isCompleted = currentQuantity >= quest.quantity;

              return (
                <div
                  key={quest.id}
                  className="glass-panel p-0 relative overflow-hidden group transition-all hover:border-cyan-400/40"
                >
                  {/* Background gradient for active item */}
                  <div className="absolute inset-0 bg-gradient-to-r from-cyan-900/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />

                  <div className="p-4 sm:p-6 flex flex-col sm:flex-row items-center gap-6 relative z-10">
                    {/* Icon / Rank Badge Placeholder */}
                    <div className="hidden sm:flex flex-shrink-0 w-16 h-16 bg-slate-800/50 border border-slate-600 rounded-sm items-center justify-center shadow-inner">
                      <div className={`w-12 h-12 rounded-full border-2 flex items-center justify-center ${isCompleted ? 'border-yellow-500 text-yellow-500' : 'border-cyan-500/50 text-cyan-500/50'}`}>
                        <span className="font-bold text-lg">{isCompleted ? '★' : '!'}</span>
                      </div>
                    </div>

                    {/* Content */}
                    <div className="flex-grow w-full">
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="text-lg font-bold text-white uppercase tracking-wide">
                          {quest.name}
                        </h3>
                        <span className={`font-mono text-lg ${isCompleted ? 'text-yellow-400' : 'text-cyan-400'}`}>
                          {currentQuantity} <span className="text-slate-500">/</span> {quest.quantity} <span className="text-sm ml-1">{quest.unit}</span>
                        </span>
                      </div>

                      {/* Progress Bar */}
                      <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden border border-slate-700/50">
                        <div
                          className={`h-full transition-all duration-500 ease-out relative ${
                            isCompleted ? "bg-yellow-500" : "bg-cyan-500"
                          }`}
                          style={{ width: `${percentage}%` }}
                        >
                          {/* Glow effect on bar */}
                          <div className="absolute right-0 top-0 bottom-0 w-2 bg-white/50 blur-[2px]" />
                        </div>
                      </div>
                      
                      <div className="mt-1 flex justify-end text-xs text-slate-400 uppercase">
                        <span>{percentage.toFixed(0)}%</span>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-4 w-full sm:w-auto justify-end">
                      <div className="flex items-center bg-slate-900/80 border border-slate-700 rounded-sm">
                        <button 
                          onClick={() => handleProgressUpdate(quest.id, Math.max(0, currentQuantity - 1), questProgress)}
                          className="px-3 py-1 text-cyan-400 hover:bg-cyan-900/30 transition-colors"
                        >
                          -
                        </button>
                        <input
                          type="number"
                          min="0"
                          value={currentQuantity}
                          onChange={(e) =>
                            handleProgressUpdate(
                              quest.id,
                              Number(e.target.value),
                              questProgress
                            )
                          }
                          className="w-12 bg-transparent border-none text-center text-white focus:ring-0 p-1 font-mono"
                        />
                        <button 
                          onClick={() => handleProgressUpdate(quest.id, currentQuantity + 1, questProgress)}
                          className="px-3 py-1 text-cyan-400 hover:bg-cyan-900/30 transition-colors"
                        >
                          +
                        </button>
                      </div>
                      
                      <button 
                        onClick={() => handleProgressUpdate(quest.id, quest.quantity, questProgress)}
                        className={`btn-tech px-6 py-2 font-bold text-sm min-w-[100px] ${isCompleted ? 'opacity-50 cursor-not-allowed grayscale' : ''}`}
                        disabled={isCompleted}
                      >
                        {isCompleted ? 'Done' : 'Complete'}
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
        </div>
      </main>
    </div>
  );
}
