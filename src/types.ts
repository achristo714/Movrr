export type TaskCategory =
  | 'packing'
  | 'cleaning'
  | 'logistics'
  | 'utilities'
  | 'admin'
  | 'personal';

export interface Task {
  id: string;
  title: string;
  category: TaskCategory;
  startDate: string; // ISO date string YYYY-MM-DD
  endDate: string;   // ISO date string YYYY-MM-DD
  completed: boolean;
  notes?: string;
  assignee?: 'me' | 'partner' | 'both';
}

export interface MoveConfig {
  moveOutDate: string;
  moveInDate: string;
}

export const CATEGORY_CONFIG: Record<TaskCategory, { label: string; color: string; bg: string; border: string }> = {
  packing:   { label: 'Packing',    color: 'text-blush-600',    bg: 'bg-blush-100',    border: 'border-blush-300' },
  cleaning:  { label: 'Cleaning',   color: 'text-sage-500',     bg: 'bg-sage-100',     border: 'border-sage-300' },
  logistics: { label: 'Logistics',  color: 'text-lavender-500', bg: 'bg-lavender-100', border: 'border-lavender-300' },
  utilities: { label: 'Utilities',  color: 'text-sky-300',      bg: 'bg-sky-100',      border: 'border-sky-200' },
  admin:     { label: 'Admin',      color: 'text-warm-600',     bg: 'bg-warm-100',     border: 'border-warm-300' },
  personal:  { label: 'Personal',   color: 'text-blush-400',    bg: 'bg-cream-200',    border: 'border-cream-300' },
};

export const CATEGORY_COLORS: Record<TaskCategory, string> = {
  packing:   '#f5b5a0',
  cleaning:  '#9ab89a',
  logistics: '#c4aee4',
  utilities: '#82bde4',
  admin:     '#d1c4b7',
  personal:  '#f9f0e2',
};
