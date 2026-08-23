"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

export default function Navbar() {
  const pathname = usePathname() || "/";
  const [showMobileTabs, setShowMobileTabs] = useState(false);
  return (
    <nav className="glass-panel border-b-0 border-b-cyan-500/20 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center gap-8">
            <div className="flex-shrink-0 flex items-center gap-2">
              <div className="w-8 h-8 bg-cyan-500/20 rounded-sm border border-cyan-400/50 flex items-center justify-center">
                <span className="text-cyan-400 font-bold text-lg">Q</span>
              </div>
              <span className="text-2xl font-bold text-white tracking-wider uppercase text-glow">
                Daily Quest
              </span>
            </div>
            <div className="hidden sm:flex sm:space-x-4">
              <Link
                href="/"
                className="px-4 py-2 rounded-sm text-sm font-medium text-cyan-100 hover:text-white hover:bg-cyan-500/10 transition-all border border-transparent hover:border-cyan-500/30 uppercase tracking-wide"
              >
                Daily Progress
              </Link>
              <Link
                href="/quests"
                className="px-4 py-2 rounded-sm text-sm font-medium text-cyan-100 hover:text-white hover:bg-cyan-500/10 transition-all border border-transparent hover:border-cyan-500/30 uppercase tracking-wide"
              >
                Quest Management
              </Link>
              <Link
                href="/monthly"
                className="px-4 py-2 rounded-sm text-sm font-medium text-cyan-100 hover:text-white hover:bg-cyan-500/10 transition-all border border-transparent hover:border-cyan-500/30 uppercase tracking-wide"
              >
                Monthly View
              </Link>
              <Link
                href="/mottos"
                className="px-4 py-2 rounded-sm text-sm font-medium text-cyan-100 hover:text-white hover:bg-cyan-500/10 transition-all border border-transparent hover:border-cyan-500/30 uppercase tracking-wide"
              >
                Mottos
              </Link>
              <Link
                href="/eisenhower-matrix"
                className="px-4 py-2 rounded-sm text-sm font-medium text-cyan-100 hover:text-white hover:bg-cyan-500/10 transition-all border border-transparent hover:border-cyan-500/30 uppercase tracking-wide"
              >
                Eisenhower Matrix
              </Link>
            </div>
          </div>
          
          {/* Right side stats/currency placeholder */}
          <div className="flex items-center gap-4">
            <div className="hidden md:flex items-center gap-2 px-3 py-1 bg-slate-900/50 rounded border border-slate-700">
              <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
              <span className="text-xs text-slate-300 uppercase tracking-wider">System Online</span>
            </div>
            {/* Mobile toggler */}
            <button
              aria-label="Toggle navigation"
              aria-expanded={showMobileTabs}
              onClick={() => setShowMobileTabs((s) => !s)}
              className="sm:hidden inline-flex items-center justify-center p-2 rounded-md text-slate-300 hover:text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
            >
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                {showMobileTabs ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>
      </div>
      {/* Mobile bottom tab bar (toggleable) */}
      {showMobileTabs && (
        <div className="sm:hidden fixed bottom-0 left-0 right-0 bg-slate-900/90 backdrop-blur z-50 border-t border-slate-700">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-14">
              {[{
                href: '/',
                label: 'Daily'
              },{
                href: '/quests',
                label: 'Quests'
              },{
                href: '/monthly',
                label: 'Monthly'
              },{
                href: '/mottos',
                label: 'Mottos'
              },{
                href: '/eisenhower-matrix',
                label: 'Matrix'
              }].map((item) => {
                const active = pathname === item.href || pathname.startsWith(item.href + '/');
                return (
                  <Link key={item.href} href={item.href} onClick={() => setShowMobileTabs(false)} className={`flex-1 text-center py-3 text-xs ${active ? 'text-cyan-300 font-semibold' : 'text-slate-300'} `}>
                    {item.label}
                  </Link>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}
