import { useState, useCallback, useEffect, useRef } from 'react';
import { v4 as uuid } from 'uuid';
import type { Task, MoveConfig } from './types';

const API = import.meta.env.VITE_API_URL || 'http://localhost:3001';

// Fallback to localStorage when the API is not reachable
const STORAGE_KEY = 'movrr-data';

interface StoredData {
  tasks: Task[];
  moveConfig: MoveConfig;
}

function getDefaults(): StoredData {
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

function loadLocal(): StoredData {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch { /* ignore */ }
  return getDefaults();
}

function saveLocal(data: StoredData) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

export function useStore() {
  const [data, setData] = useState<StoredData>(loadLocal);
  const [apiAvailable, setApiAvailable] = useState<boolean | null>(null);
  const initialLoad = useRef(false);

  // Check API and load data on mount
  useEffect(() => {
    if (initialLoad.current) return;
    initialLoad.current = true;

    (async () => {
      try {
        const [tasksRes, configRes] = await Promise.all([
          fetch(`${API}/api/tasks`),
          fetch(`${API}/api/config`),
        ]);

        if (!tasksRes.ok || !configRes.ok) throw new Error('API error');

        const tasks: Task[] = await tasksRes.json();
        const moveConfig: MoveConfig = await configRes.json();

        // If we had local data but backend is empty, push local data to backend
        const localData = loadLocal();
        if (tasks.length === 0 && localData.tasks.length > 0) {
          // Migrate localStorage tasks to backend
          for (const task of localData.tasks) {
            await fetch(`${API}/api/tasks`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(task),
            });
          }
          await fetch(`${API}/api/config`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(localData.moveConfig),
          });
          setData(localData);
        } else {
          setData({ tasks, moveConfig });
        }

        setApiAvailable(true);
      } catch {
        setApiAvailable(false);
      }
    })();
  }, []);

  // Save to localStorage as fallback
  useEffect(() => {
    saveLocal(data);
  }, [data]);

  const addTask = useCallback((task: Omit<Task, 'id' | 'completed'>) => {
    const newTask = { ...task, id: uuid(), completed: false };
    setData(prev => ({ ...prev, tasks: [...prev.tasks, newTask] }));

    if (apiAvailable) {
      fetch(`${API}/api/tasks`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newTask),
      }).catch(() => {});
    }
  }, [apiAvailable]);

  const updateTask = useCallback((id: string, updates: Partial<Task>) => {
    setData(prev => ({
      ...prev,
      tasks: prev.tasks.map(t => t.id === id ? { ...t, ...updates } : t),
    }));

    if (apiAvailable) {
      fetch(`${API}/api/tasks/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      }).catch(() => {});
    }
  }, [apiAvailable]);

  const deleteTask = useCallback((id: string) => {
    setData(prev => ({
      ...prev,
      tasks: prev.tasks.filter(t => t.id !== id),
    }));

    if (apiAvailable) {
      fetch(`${API}/api/tasks/${id}`, { method: 'DELETE' }).catch(() => {});
    }
  }, [apiAvailable]);

  const updateMoveConfig = useCallback((config: Partial<MoveConfig>) => {
    setData(prev => ({
      ...prev,
      moveConfig: { ...prev.moveConfig, ...config },
    }));

    if (apiAvailable) {
      fetch(`${API}/api/config`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(config),
      }).catch(() => {});
    }
  }, [apiAvailable]);

  return {
    tasks: data.tasks,
    moveConfig: data.moveConfig,
    addTask,
    updateTask,
    deleteTask,
    updateMoveConfig,
  };
}
