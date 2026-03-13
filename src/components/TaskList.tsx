import type { Task } from '../types';
import { CATEGORY_CONFIG, CATEGORY_COLORS } from '../types';
import { formatDateShort } from '../utils';

interface TaskListProps {
  tasks: Task[];
  onTaskClick: (task: Task) => void;
  onToggleComplete: (id: string, completed: boolean) => void;
}

export function TaskList({ tasks, onTaskClick, onToggleComplete }: TaskListProps) {
  const sorted = [...tasks].sort((a, b) => {
    if (a.completed !== b.completed) return a.completed ? 1 : -1;
    return a.startDate.localeCompare(b.startDate);
  });

  if (tasks.length === 0) return null;

  return (
    <div className="bg-white border border-warm-200 rounded-2xl shadow-sm overflow-hidden">
      <div className="p-4 border-b border-warm-100">
        <h3 className="font-display text-sm font-semibold text-warm-700">All Tasks</h3>
      </div>
      <div className="divide-y divide-warm-100 max-h-64 overflow-y-auto">
        {sorted.map(task => {
          const cfg = CATEGORY_CONFIG[task.category];
          const color = CATEGORY_COLORS[task.category];
          return (
            <div
              key={task.id}
              className="flex items-center gap-3 px-4 py-3 hover:bg-warm-50 cursor-pointer transition-colors"
              onClick={() => onTaskClick(task)}
            >
              <button
                className={`w-5 h-5 rounded-full border-2 flex-shrink-0 flex items-center justify-center transition-colors ${
                  task.completed ? 'bg-sage-300 border-sage-400' : ''
                }`}
                style={{ borderColor: task.completed ? undefined : color }}
                onClick={e => {
                  e.stopPropagation();
                  onToggleComplete(task.id, !task.completed);
                }}
              >
                {task.completed && (
                  <svg width="10" height="10" viewBox="0 0 12 12" fill="none">
                    <path d="M2 6L5 9L10 3" stroke="white" strokeWidth="2" strokeLinecap="round" />
                  </svg>
                )}
              </button>

              <div className="flex-1 min-w-0">
                <p className={`text-sm font-medium truncate ${task.completed ? 'line-through text-warm-400' : 'text-warm-700'}`}>
                  {task.title}
                </p>
                <p className="text-xs text-warm-400">
                  {formatDateShort(task.startDate)}
                  {task.startDate !== task.endDate && ` — ${formatDateShort(task.endDate)}`}
                </p>
              </div>

              <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${cfg.bg} ${cfg.color}`}>
                {cfg.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
