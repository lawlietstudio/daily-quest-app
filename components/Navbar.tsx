import Link from "next/link";

export default function Navbar() {
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
          </div>
        </div>
      </div>
    </nav>
  );
}
