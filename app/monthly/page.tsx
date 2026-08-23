"use client";

import { useState, useEffect } from "react";
import { DailyQuest, DailyProgress } from "@/types/quest";
import {
  subscribeToQuests,
  subscribeToMonthlyProgress,
} from "@/lib/questService";

export default function MonthlyView() {
  const [quests, setQuests] = useState<DailyQuest[]>([]);
  const [progress, setProgress] = useState<DailyProgress[]>([]);
  const [currentDate, setCurrentDate] = useState(new Date());

  // Get start and end of month
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  
  // Adjust for local timezone to ensure we get the correct local date strings
  // We need to be careful with timezone offsets when generating date strings
  
  const getDaysInMonth = (year: number, month: number) => {
    const date = new Date(year, month, 1);
    const days = [];
    while (date.getMonth() === month) {
      // Create a date object that represents this day in local time
      // We use the year, month, date constructor which uses local time
      const d = new Date(year, month, date.getDate());
      
      // Format as YYYY-MM-DD using local time components
      const yearStr = d.getFullYear();
      const monthStr = String(d.getMonth() + 1).padStart(2, '0');
      const dayStr = String(d.getDate()).padStart(2, '0');
      const dateStr = `${yearStr}-${monthStr}-${dayStr}`;
      
      days.push({
        date: dateStr,
        day: d.getDate(),
        weekday: d.toLocaleDateString('en-US', { weekday: 'narrow' })
      });
      date.setDate(date.getDate() + 1);
    }
    return days;
  };

  const days = getDaysInMonth(year, month);
  const startDateStr = days[0].date;
  const endDateStr = days[days.length - 1].date;

  // Subscribe to quests
  useEffect(() => {
    const unsubscribe = subscribeToQuests((updatedQuests) => {
      setQuests(updatedQuests);
    });
    return () => unsubscribe();
  }, []);

  // Subscribe to monthly progress
  useEffect(() => {
    const unsubscribe = subscribeToMonthlyProgress(startDateStr, endDateStr, (updatedProgress) => {
      setProgress(updatedProgress);
    });
    return () => unsubscribe();
  }, [startDateStr, endDateStr]);

  const handleMonthChange = (offset: number) => {
    const newDate = new Date(currentDate);
    newDate.setMonth(newDate.getMonth() + offset);
    setCurrentDate(newDate);
  };

  const getProgress = (questId: number, date: string) => {
    return progress.find(p => p.questId === questId && p.date === date);
  };

  const isCompleted = (quest: DailyQuest, date: string) => {
    const p = getProgress(quest.id, date);
    return (p?.quantity || 0) >= quest.quantity;
  };

  return (
    <div className="min-h-screen p-4 sm:p-8">
      <main className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-bold text-white uppercase tracking-widest text-glow">
            Monthly View
          </h1>
          
          <div className="glass-panel px-4 py-2 rounded-sm flex items-center gap-4">
            <button
              onClick={() => handleMonthChange(-1)}
              className="text-cyan-400 hover:text-white transition-colors"
            >
              ◀
            </button>
            <span className="text-white font-mono uppercase text-lg min-w-[150px] text-center">
              {currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
            </span>
            <button
              onClick={() => handleMonthChange(1)}
              className="text-cyan-400 hover:text-white transition-colors"
            >
              ▶
            </button>
          </div>
        </div>

        <div className="glass-panel p-0 overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr>
                <th className="p-4 text-left text-cyan-400 uppercase tracking-wider border-b border-cyan-900/30 sticky left-0 bg-[#0f172a] z-10 min-w-[200px] shadow-[2px_0_5px_-2px_rgba(0,0,0,0.5)]">
                  Quest
                </th>
                {days.map((day) => (
                  <th key={day.date} className="p-2 text-center border-b border-cyan-900/30 min-w-[40px]">
                    <div className="text-xs text-slate-400">{day.weekday}</div>
                    <div className="text-white font-mono">{day.day}</div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {quests.map((quest) => (
                <tr key={quest.id} className="hover:bg-cyan-900/10 transition-colors">
                  <td className="p-4 border-b border-cyan-900/30 sticky left-0 bg-[#0f172a] z-10 font-medium text-white shadow-[2px_0_5px_-2px_rgba(0,0,0,0.5)]">
                    {quest.name}
                  </td>
                  {days.map((day) => {
                    const completed = isCompleted(quest, day.date);
                    const p = getProgress(quest.id, day.date);
                    const hasProgress = (p?.quantity || 0) > 0;
                    
                    return (
                      <td key={day.date} className="p-2 text-center border-b border-cyan-900/30">
                        {completed ? (
                          <span className="text-yellow-500 font-bold">★</span>
                        ) : hasProgress ? (
                          <span className="text-cyan-500/50 text-xs">{(p?.quantity || 0)}</span>
                        ) : (
                          <span className="text-slate-700">·</span>
                        )}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  );
}
