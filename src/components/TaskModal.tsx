import { useState, useEffect, useRef } from 'react';
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
const assignees: Array<{ value: Task['assignee']; label: string; icon: string }> = [
  { value: 'me', label: 'Me', icon: '👤' },
  { value: 'partner', label: 'Partner', icon: '💕' },
  { value: 'both', label: 'Both', icon: '👫' },
];

export function TaskModal({ task, initialStartDate, onSave, onUpdate, onDelete, onClose }: TaskModalProps) {
  const isEditing = !!task;
  const formRef = useRef<HTMLFormElement>(null);
  const [visible, setVisible] = useState(false);

  const today = new Date().toISOString().split('T')[0];
  const [title, setTitle] = useState(task?.title ?? '');
  const [category, setCategory] = useState<TaskCategory>(task?.category ?? 'packing');
  const [startDate, setStartDate] = useState(task?.startDate ?? initialStartDate ?? today);
  const [endDate, setEndDate] = useState(task?.endDate ?? initialStartDate ?? today);
  const [assignee, setAssignee] = useState<Task['assignee']>(task?.assignee ?? 'both');
  const [notes, setNotes] = useState(task?.notes ?? '');

  useEffect(() => {
    // Trigger enter animation
    requestAnimationFrame(() => setVisible(true));
  }, []);

  useEffect(() => {
    if (startDate > endDate) setEndDate(startDate);
  }, [startDate, endDate]);

  const handleClose = () => {
    setVisible(false);
    setTimeout(onClose, 200);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    if (isEditing && onUpdate) {
      onUpdate(task.id, { title, category, startDate, endDate, assignee, notes });
    } else {
      onSave({ title, category, startDate, endDate, assignee, notes });
    }
    handleClose();
  };

  const handleDelete = () => {
    if (isEditing && onDelete) {
      onDelete(task.id);
      handleClose();
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-0 sm:p-4">
      {/* Backdrop */}
      <div
        className={`absolute inset-0 bg-warm-800/40 backdrop-blur-sm transition-opacity duration-200 ${
          visible ? 'opacity-100' : 'opacity-0'
        }`}
        onClick={handleClose}
      />

      {/* Modal */}
      <form
        ref={formRef}
        onSubmit={handleSubmit}
        className={`relative bg-white rounded-t-3xl sm:rounded-2xl w-full sm:max-w-md max-h-[92vh] overflow-y-auto shadow-2xl transition-all duration-300 ease-out ${
          visible
            ? 'translate-y-0 opacity-100 scale-100'
            : 'translate-y-8 sm:translate-y-4 opacity-0 sm:scale-95'
        }`}
      >
        {/* Drag indicator for mobile */}
        <div className="sm:hidden flex justify-center pt-3 pb-1">
          <div className="w-10 h-1 rounded-full bg-warm-200" />
        </div>

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 sm:pt-6">
          <h2 className="font-display text-xl font-semibold text-warm-800">
            {isEditing ? 'Edit Task' : 'New Task'}
          </h2>
          <button
            type="button"
            onClick={handleClose}
            className="w-8 h-8 rounded-full bg-warm-100 flex items-center justify-center text-warm-400 hover:bg-warm-200 hover:text-warm-600 transition-all active:scale-90"
          >
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path d="M1 1l12 12M13 1L1 13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
          </button>
        </div>

        <div className="px-6 pb-2 space-y-5">
          {/* Title */}
          <div>
            <input
              type="text"
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder="What needs to be done?"
              autoFocus
              className="w-full border-0 border-b-2 border-warm-200 rounded-none px-0 py-3 text-base text-warm-700 placeholder-warm-300 focus:outline-none focus:border-blush-400 bg-transparent transition-colors"
            />
          </div>

          {/* Category */}
          <div>
            <label className="block text-[11px] font-medium text-warm-400 uppercase tracking-wider mb-2">
              Category
            </label>
            <div className="flex flex-wrap gap-1.5">
              {categories.map(cat => {
                const cfg = CATEGORY_CONFIG[cat];
                const active = category === cat;
                return (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setCategory(cat)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all active:scale-95 ${
                      active
                        ? `${cfg.bg} ${cfg.color} shadow-sm`
                        : 'bg-warm-50 text-warm-400 hover:bg-warm-100'
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
              <label className="block text-[11px] font-medium text-warm-400 uppercase tracking-wider mb-2">
                Start
              </label>
              <input
                type="date"
                value={startDate}
                onChange={e => setStartDate(e.target.value)}
                className="w-full border border-warm-200 rounded-xl px-3 py-2.5 text-sm text-warm-700 bg-warm-50/50 focus:outline-none focus:ring-2 focus:ring-blush-300/50 focus:border-blush-300 transition-all"
              />
            </div>
            <div>
              <label className="block text-[11px] font-medium text-warm-400 uppercase tracking-wider mb-2">
                End
              </label>
              <input
                type="date"
                value={endDate}
                onChange={e => setEndDate(e.target.value)}
                min={startDate}
                className="w-full border border-warm-200 rounded-xl px-3 py-2.5 text-sm text-warm-700 bg-warm-50/50 focus:outline-none focus:ring-2 focus:ring-blush-300/50 focus:border-blush-300 transition-all"
              />
            </div>
          </div>

          {/* Assignee */}
          <div>
            <label className="block text-[11px] font-medium text-warm-400 uppercase tracking-wider mb-2">
              Assigned To
            </label>
            <div className="flex gap-2">
              {assignees.map(a => (
                <button
                  key={a.value}
                  type="button"
                  onClick={() => setAssignee(a.value)}
                  className={`flex-1 py-2.5 rounded-xl text-xs font-medium transition-all active:scale-95 ${
                    assignee === a.value
                      ? 'bg-blush-50 text-blush-600 shadow-sm ring-1 ring-blush-200'
                      : 'bg-warm-50 text-warm-400 hover:bg-warm-100'
                  }`}
                >
                  <span className="text-sm">{a.icon}</span>
                  <span className="ml-1">{a.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-[11px] font-medium text-warm-400 uppercase tracking-wider mb-2">
              Notes
            </label>
            <textarea
              value={notes}
              onChange={e => setNotes(e.target.value)}
              rows={2}
              placeholder="Any details..."
              className="w-full border border-warm-200 rounded-xl px-3 py-2.5 text-sm text-warm-700 placeholder-warm-300 focus:outline-none focus:ring-2 focus:ring-blush-300/50 focus:border-blush-300 bg-warm-50/50 resize-none transition-all"
            />
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-5 flex items-center gap-3">
          {isEditing && (
            <button
              type="button"
              onClick={handleDelete}
              className="px-4 py-2.5 rounded-xl text-sm font-medium text-red-400 hover:bg-red-50 transition-all active:scale-95"
            >
              Delete
            </button>
          )}
          <div className="flex-1" />
          <button
            type="button"
            onClick={handleClose}
            className="px-5 py-2.5 rounded-xl text-sm font-medium text-warm-500 hover:bg-warm-100 transition-all active:scale-95"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={!title.trim()}
            className="px-6 py-2.5 rounded-xl text-sm font-medium bg-gradient-to-r from-blush-400 to-lavender-400 text-white shadow-sm hover:shadow-md transition-all active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {isEditing ? 'Save' : 'Add Task'}
          </button>
        </div>
      </form>
    </div>
  );
}
