import { parseISO, differenceInDays } from '../utils';
import type { MoveConfig } from '../types';

interface HeaderProps {
  moveConfig: MoveConfig;
  onUpdateMoveConfig: (config: Partial<MoveConfig>) => void;
  taskCount: number;
  completedCount: number;
}

export function Header({ moveConfig, onUpdateMoveConfig, taskCount, completedCount }: HeaderProps) {
  const progress = taskCount > 0 ? Math.round((completedCount / taskCount) * 100) : 0;
  const daysUntilMove = differenceInDays(parseISO(moveConfig.moveOutDate), new Date());

  return (
    <header className="bg-white/70 backdrop-blur-xl border-b border-warm-100 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 sm:py-4">
        <div className="flex items-center justify-between gap-3">
          {/* Logo */}
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-2xl bg-gradient-to-br from-blush-400 to-lavender-400 flex items-center justify-center text-white text-base sm:text-lg shadow-sm">
              ✦
            </div>
            <div>
              <h1 className="font-display text-lg sm:text-xl font-semibold text-warm-800 leading-none">
                Movrr
              </h1>
              <p className="text-[10px] sm:text-xs text-warm-400 leading-tight mt-0.5">
                {daysUntilMove > 0 ? `${daysUntilMove} days to move` : 'Moving day!'}
              </p>
            </div>
          </div>

          {/* Move dates - hidden on mobile, shown in compact form */}
          <div className="hidden sm:flex items-center gap-2 text-sm">
            <div className="flex items-center gap-1.5 bg-warm-50 rounded-xl px-3 py-1.5">
              <span className="text-warm-400 text-[10px] uppercase tracking-wider font-medium">Out</span>
              <input
                type="date"
                value={moveConfig.moveOutDate}
                onChange={e => onUpdateMoveConfig({ moveOutDate: e.target.value })}
                className="bg-transparent text-sm text-warm-700 focus:outline-none cursor-pointer"
              />
            </div>
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="text-warm-300">
              <path d="M6 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            <div className="flex items-center gap-1.5 bg-warm-50 rounded-xl px-3 py-1.5">
              <span className="text-warm-400 text-[10px] uppercase tracking-wider font-medium">In</span>
              <input
                type="date"
                value={moveConfig.moveInDate}
                onChange={e => onUpdateMoveConfig({ moveInDate: e.target.value })}
                className="bg-transparent text-sm text-warm-700 focus:outline-none cursor-pointer"
              />
            </div>
          </div>

          {/* Progress */}
          <div className="flex items-center gap-2.5">
            <div className="text-right">
              <p className="text-xs sm:text-sm font-semibold text-warm-700">{progress}%</p>
              <p className="text-[10px] text-warm-400 leading-tight">
                {completedCount}/{taskCount}
              </p>
            </div>
            <div className="w-10 h-10 sm:w-12 sm:h-12 relative">
              <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                <circle cx="18" cy="18" r="15" fill="none" stroke="currentColor" strokeWidth="2.5" className="text-warm-100" />
                <circle
                  cx="18" cy="18" r="15" fill="none"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  className="text-blush-400"
                  strokeDasharray={`${progress * 0.942} 100`}
                  style={{ transition: 'stroke-dasharray 0.5s ease' }}
                />
              </svg>
            </div>
          </div>
        </div>

        {/* Mobile date display */}
        <div className="sm:hidden flex items-center gap-3 mt-2 text-[11px]">
          <div className="flex items-center gap-1.5 flex-1 bg-warm-50/80 rounded-lg px-2.5 py-1.5">
            <span className="text-warm-400 font-medium">Out</span>
            <input
              type="date"
              value={moveConfig.moveOutDate}
              onChange={e => onUpdateMoveConfig({ moveOutDate: e.target.value })}
              className="bg-transparent text-[11px] text-warm-600 focus:outline-none flex-1 min-w-0"
            />
          </div>
          <svg width="12" height="12" viewBox="0 0 16 16" fill="none" className="text-warm-300 flex-shrink-0">
            <path d="M6 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          <div className="flex items-center gap-1.5 flex-1 bg-warm-50/80 rounded-lg px-2.5 py-1.5">
            <span className="text-warm-400 font-medium">In</span>
            <input
              type="date"
              value={moveConfig.moveInDate}
              onChange={e => onUpdateMoveConfig({ moveInDate: e.target.value })}
              className="bg-transparent text-[11px] text-warm-600 focus:outline-none flex-1 min-w-0"
            />
          </div>
        </div>
      </div>
    </header>
  );
}
