import { useState, useEffect } from 'react';
import type { Task, TaskCategory } from '../types';
import { CATEGORY_CONFIG } from '../types';

interface TaskModalProps {
  task?: Task | null;
  initialStartDate?: string;
  onSave: (task: Omit<Task, 'id' | 'completed'>) => void;
  onUpdate?: (id: string, updates: Partial<Task>) => void;
  onDelete?: (id: string) => void;
  onClose: () => void;
}

const categories = Object.keys(CATEGORY_CONFIG) as TaskCategory[];
const assignees: Array<{ value: Task['assignee']; label: string }> = [
  { value: 'me', label: 'Me' },
  { value: 'partner', label: 'Partner' },
  { value: 'both', label: 'Both' },
];

export function TaskModal({ task, initialStartDate, onSave, onUpdate, onDelete, onClose }: TaskModalProps) {
  const isEditing = !!task;

  const today = new Date().toISOString().split('T')[0];
  const [title, setTitle] = useState(task?.title ?? '');
  const [category, setCategory] = useState<TaskCategory>(task?.category ?? 'packing');
  const [startDate, setStartDate] = useState(task?.startDate ?? initialStartDate ?? today);
  const [endDate, setEndDate] = useState(task?.endDate ?? initialStartDate ?? today);
  const [assignee, setAssignee] = useState<Task['assignee']>(task?.assignee ?? 'both');
  const [notes, setNotes] = useState(task?.notes ?? '');

  useEffect(() => {
    if (startDate > endDate) setEndDate(startDate);
  }, [startDate, endDate]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    if (isEditing && onUpdate) {
      onUpdate(task.id, { title, category, startDate, endDate, assignee, notes });
    } else {
      onSave({ title, category, startDate, endDate, assignee, notes });
    }
    onClose();
  };

  const handleDelete = () => {
    if (isEditing && onDelete) {
      onDelete(task.id);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-0 sm:p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-warm-800/30 backdrop-blur-sm" onClick={onClose} />

      {/* Modal */}
      <form
        onSubmit={handleSubmit}
        className="relative bg-white rounded-t-2xl sm:rounded-2xl w-full sm:max-w-md max-h-[90vh] overflow-y-auto shadow-xl"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-warm-100">
          <h2 className="font-display text-lg font-semibold text-warm-800">
            {isEditing ? 'Edit Task' : 'New Task'}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-warm-100 flex items-center justify-center text-warm-400 hover:bg-warm-200 transition-colors"
          >
            ×
          </button>
        </div>

        <div className="p-5 space-y-4">
          {/* Title */}
          <div>
            <label className="block text-xs font-medium text-warm-500 uppercase tracking-wide mb-1.5">
              Task Name
            </label>
            <input
              type="text"
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder="e.g., Pack kitchen boxes"
              autoFocus
              className="w-full border border-warm-200 rounded-xl px-4 py-2.5 text-warm-700 placeholder-warm-300 focus:outline-none focus:ring-2 focus:ring-blush-300 focus:border-transparent bg-warm-50"
            />
          </div>

          {/* Category */}
          <div>
            <label className="block text-xs font-medium text-warm-500 uppercase tracking-wide mb-1.5">
              Category
            </label>
            <div className="flex flex-wrap gap-2">
              {categories.map(cat => {
                const cfg = CATEGORY_CONFIG[cat];
                const active = category === cat;
                return (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setCategory(cat)}
                    className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${
                      active
                        ? `${cfg.bg} ${cfg.border} ${cfg.color} ring-2 ring-offset-1 ring-blush-200`
                        : 'bg-warm-50 border-warm-200 text-warm-400 hover:border-warm-300'
                    }`}
                  >
                    {cfg.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Dates */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-warm-500 uppercase tracking-wide mb-1.5">
                Start
              </label>
              <input
                type="date"
                value={startDate}
                onChange={e => setStartDate(e.target.value)}
                className="w-full border border-warm-200 rounded-xl px-3 py-2 text-sm text-warm-700 bg-warm-50 focus:outline-none focus:ring-2 focus:ring-blush-300 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-warm-500 uppercase tracking-wide mb-1.5">
                End
              </label>
              <input
                type="date"
                value={endDate}
                onChange={e => setEndDate(e.target.value)}
                min={startDate}
                className="w-full border border-warm-200 rounded-xl px-3 py-2 text-sm text-warm-700 bg-warm-50 focus:outline-none focus:ring-2 focus:ring-blush-300 focus:border-transparent"
              />
            </div>
          </div>

          {/* Assignee */}
          <div>
            <label className="block text-xs font-medium text-warm-500 uppercase tracking-wide mb-1.5">
              Assigned To
            </label>
            <div className="flex gap-2">
              {assignees.map(a => (
                <button
                  key={a.value}
                  type="button"
                  onClick={() => setAssignee(a.value)}
                  className={`flex-1 py-2 rounded-xl text-xs font-medium border transition-all ${
                    assignee === a.value
                      ? 'bg-blush-100 border-blush-300 text-blush-600'
                      : 'bg-warm-50 border-warm-200 text-warm-400 hover:border-warm-300'
                  }`}
                >
                  {a.label}
                </button>
              ))}
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-xs font-medium text-warm-500 uppercase tracking-wide mb-1.5">
              Notes
            </label>
            <textarea
              value={notes}
              onChange={e => setNotes(e.target.value)}
              rows={2}
              placeholder="Any details..."
              className="w-full border border-warm-200 rounded-xl px-4 py-2.5 text-sm text-warm-700 placeholder-warm-300 focus:outline-none focus:ring-2 focus:ring-blush-300 focus:border-transparent bg-warm-50 resize-none"
            />
          </div>
        </div>

        {/* Footer */}
        <div className="p-5 border-t border-warm-100 flex gap-3">
          {isEditing && (
            <button
              type="button"
              onClick={handleDelete}
              className="px-4 py-2.5 rounded-xl text-sm font-medium text-red-400 hover:bg-red-50 transition-colors"
            >
              Delete
            </button>
          )}
          <div className="flex-1" />
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl text-sm font-medium text-warm-500 hover:bg-warm-100 transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={!title.trim()}
            className="px-6 py-2.5 rounded-xl text-sm font-medium bg-gradient-to-r from-blush-400 to-lavender-400 text-white shadow-sm hover:shadow-md transition-all disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {isEditing ? 'Save' : 'Add Task'}
          </button>
        </div>
      </form>
    </div>
  );
}
