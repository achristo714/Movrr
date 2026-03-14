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

  if (tasks.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center py-16">
        <div className="text-center">
          <div className="text-4xl mb-3">📦</div>
          <p className="font-display text-lg text-warm-500 mb-1">No tasks yet</p>
          <p className="text-sm text-warm-400">Add your first moving task to get started</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2">
      {sorted.map(task => {
        const cfg = CATEGORY_CONFIG[task.category];
        const color = CATEGORY_COLORS[task.category];
        return (
          <div
            key={task.id}
            className={`bg-white border border-warm-100 rounded-xl px-4 py-3 flex items-center gap-3 cursor-pointer transition-all hover:shadow-sm hover:border-warm-200 active:scale-[0.99] ${
              task.completed ? 'opacity-60' : ''
            }`}
            onClick={() => onTaskClick(task)}
          >
            <button
              className={`w-5 h-5 rounded-full border-2 flex-shrink-0 flex items-center justify-center transition-all ${
                task.completed ? 'bg-sage-300 border-sage-400' : 'hover:scale-110'
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

            <div
              className="w-1 h-8 rounded-full flex-shrink-0"
              style={{ backgroundColor: color + '80' }}
            />

            <div className="flex-1 min-w-0">
              <p className={`text-sm font-medium truncate ${task.completed ? 'line-through text-warm-400' : 'text-warm-700'}`}>
                {task.title}
              </p>
              <p className="text-[11px] text-warm-400 mt-0.5">
                {formatDateShort(task.startDate)}
                {task.startDate !== task.endDate && ` — ${formatDateShort(task.endDate)}`}
                {task.assignee && <span className="ml-2">{task.assignee === 'me' ? '👤' : task.assignee === 'partner' ? '💕' : '👫'}</span>}
              </p>
            </div>

            <span className={`text-[10px] font-medium px-2 py-1 rounded-lg ${cfg.bg} ${cfg.color}`}>
              {cfg.label}
            </span>
          </div>
        );
      })}
    </div>
  );
}
