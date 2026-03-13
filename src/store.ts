import { useState, useCallback, useEffect } from 'react';
import { v4 as uuid } from 'uuid';
import type { Task, MoveConfig } from './types';

const STORAGE_KEY = 'movrr-data';

interface StoredData {
  tasks: Task[];
  moveConfig: MoveConfig;
}

function loadData(): StoredData {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch { /* ignore */ }

  const today = new Date();
  const moveOut = new Date(today);
  moveOut.setDate(moveOut.getDate() + 30);
  const moveIn = new Date(moveOut);
  moveIn.setDate(moveIn.getDate() + 3);

  return {
    tasks: [],
    moveConfig: {
      moveOutDate: moveOut.toISOString().split('T')[0],
      moveInDate: moveIn.toISOString().split('T')[0],
    },
  };
}

function saveData(data: StoredData) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

export function useStore() {
  const [data, setData] = useState<StoredData>(loadData);

  useEffect(() => {
    saveData(data);
  }, [data]);

  const addTask = useCallback((task: Omit<Task, 'id' | 'completed'>) => {
    setData(prev => ({
      ...prev,
      tasks: [...prev.tasks, { ...task, id: uuid(), completed: false }],
    }));
  }, []);

  const updateTask = useCallback((id: string, updates: Partial<Task>) => {
    setData(prev => ({
      ...prev,
      tasks: prev.tasks.map(t => t.id === id ? { ...t, ...updates } : t),
    }));
  }, []);

  const deleteTask = useCallback((id: string) => {
    setData(prev => ({
      ...prev,
      tasks: prev.tasks.filter(t => t.id !== id),
    }));
  }, []);

  const updateMoveConfig = useCallback((config: Partial<MoveConfig>) => {
    setData(prev => ({
      ...prev,
      moveConfig: { ...prev.moveConfig, ...config },
    }));
  }, []);

  return {
    tasks: data.tasks,
    moveConfig: data.moveConfig,
    addTask,
    updateTask,
    deleteTask,
    updateMoveConfig,
  };
}
