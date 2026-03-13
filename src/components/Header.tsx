import { format, parseISO } from '../utils';
import type { MoveConfig } from '../types';

interface HeaderProps {
  moveConfig: MoveConfig;
  onUpdateMoveConfig: (config: Partial<MoveConfig>) => void;
  taskCount: number;
  completedCount: number;
}

export function Header({ moveConfig, onUpdateMoveConfig, taskCount, completedCount }: HeaderProps) {
  const progress = taskCount > 0 ? Math.round((completedCount / taskCount) * 100) : 0;

  return (
    <header className="bg-white/80 backdrop-blur-sm border-b border-warm-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          {/* Logo & Title */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blush-300 to-lavender-300 flex items-center justify-center text-white text-lg">
              ✦
            </div>
            <div>
              <h1 className="font-display text-xl font-semibold text-warm-800 leading-tight">
                Movrr
              </h1>
              <p className="text-xs text-warm-400">your moving planner</p>
            </div>
          </div>

          {/* Move dates */}
          <div className="flex flex-wrap items-center gap-3 text-sm">
            <div className="flex items-center gap-2">
              <span className="text-warm-400 text-xs uppercase tracking-wide">Out</span>
              <input
                type="date"
                value={moveConfig.moveOutDate}
                onChange={e => onUpdateMoveConfig({ moveOutDate: e.target.value })}
                className="border border-warm-200 rounded-lg px-3 py-1.5 text-sm text-warm-700 bg-warm-50 focus:outline-none focus:ring-2 focus:ring-blush-300 focus:border-transparent"
              />
            </div>
            <span className="text-warm-300">→</span>
            <div className="flex items-center gap-2">
              <span className="text-warm-400 text-xs uppercase tracking-wide">In</span>
              <input
                type="date"
                value={moveConfig.moveInDate}
                onChange={e => onUpdateMoveConfig({ moveInDate: e.target.value })}
                className="border border-warm-200 rounded-lg px-3 py-1.5 text-sm text-warm-700 bg-warm-50 focus:outline-none focus:ring-2 focus:ring-blush-300 focus:border-transparent"
              />
            </div>
          </div>

          {/* Progress */}
          <div className="flex items-center gap-3">
            <div className="text-right">
              <p className="text-xs text-warm-400">
                {completedCount}/{taskCount} tasks
              </p>
              <p className="text-sm font-medium text-warm-600">{progress}% done</p>
            </div>
            <div className="w-20 h-2 bg-warm-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-blush-300 to-sage-300 rounded-full transition-all duration-500"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        </div>

        {/* Key dates display */}
        <div className="flex gap-4 mt-3 text-xs text-warm-400">
          <span>
            Move-out: <strong className="text-blush-500">{format(parseISO(moveConfig.moveOutDate), 'EEEE, MMM d')}</strong>
          </span>
          <span>
            Move-in: <strong className="text-sage-500">{format(parseISO(moveConfig.moveInDate), 'EEEE, MMM d')}</strong>
          </span>
        </div>
      </div>
    </header>
  );
}
