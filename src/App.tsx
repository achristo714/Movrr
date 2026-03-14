import { useState } from 'react';
import { useStore } from './store';
import { Header } from './components/Header';
import { Timeline } from './components/Timeline';
import { TaskList } from './components/TaskList';
import { TaskModal } from './components/TaskModal';
import type { Task } from './types';

function App() {
  const { tasks, moveConfig, addTask, updateTask, deleteTask, updateMoveConfig } = useStore();
  const [modalOpen, setModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [initialDate, setInitialDate] = useState<string | undefined>();
  const [showList, setShowList] = useState(false);

  const completedCount = tasks.filter(t => t.completed).length;

  const openNewTask = (date?: string) => {
    setEditingTask(null);
    setInitialDate(date);
    setModalOpen(true);
  };

  const openEditTask = (task: Task) => {
    setEditingTask(task);
    setInitialDate(undefined);
    setModalOpen(true);
  };

  return (
    <div className="min-h-dvh flex flex-col bg-cream-50">
      <Header
        moveConfig={moveConfig}
        onUpdateMoveConfig={updateMoveConfig}
        taskCount={tasks.length}
        completedCount={completedCount}
      />

      <main className="flex-1 flex flex-col gap-3 p-3 sm:p-5 max-w-7xl mx-auto w-full">
        {/* Toolbar */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5 bg-warm-100/60 rounded-xl p-0.5">
            <button
              onClick={() => setShowList(false)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                !showList
                  ? 'bg-white text-warm-700 shadow-sm'
                  : 'text-warm-400 hover:text-warm-600'
              }`}
            >
              <span className="sm:hidden">
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none" className="inline -mt-0.5">
                  <rect x="1" y="1" width="5" height="5" rx="1" stroke="currentColor" strokeWidth="1.2"/>
                  <rect x="8" y="1" width="5" height="5" rx="1" stroke="currentColor" strokeWidth="1.2"/>
                  <rect x="1" y="8" width="5" height="5" rx="1" stroke="currentColor" strokeWidth="1.2"/>
                  <rect x="8" y="8" width="5" height="5" rx="1" stroke="currentColor" strokeWidth="1.2"/>
                </svg>
              </span>
              <span className="hidden sm:inline">Timeline</span>
            </button>
            <button
              onClick={() => setShowList(true)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                showList
                  ? 'bg-white text-warm-700 shadow-sm'
                  : 'text-warm-400 hover:text-warm-600'
              }`}
            >
              <span className="sm:hidden">
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none" className="inline -mt-0.5">
                  <path d="M1 3h12M1 7h12M1 11h12" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
                </svg>
              </span>
              <span className="hidden sm:inline">List</span>
            </button>
          </div>

          <button
            onClick={() => openNewTask()}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium bg-gradient-to-r from-blush-400 to-lavender-400 text-white shadow-sm hover:shadow-md transition-all active:scale-95"
          >
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path d="M7 1v12M1 7h12" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
            </svg>
            <span className="hidden sm:inline">Add Task</span>
          </button>
        </div>

        {/* Content */}
        {showList ? (
          <TaskList
            tasks={tasks}
            onTaskClick={openEditTask}
            onToggleComplete={(id, completed) => updateTask(id, { completed })}
          />
        ) : (
          <Timeline
            tasks={tasks}
            moveOutDate={moveConfig.moveOutDate}
            moveInDate={moveConfig.moveInDate}
            onTaskClick={openEditTask}
            onUpdateTask={updateTask}
            onAddTaskAtDate={openNewTask}
          />
        )}
      </main>

      {/* FAB for mobile */}
      <button
        onClick={() => openNewTask()}
        className="sm:hidden fixed bottom-6 right-6 w-14 h-14 rounded-2xl bg-gradient-to-br from-blush-400 to-lavender-400 text-white text-2xl shadow-lg hover:shadow-xl transition-all active:scale-90 z-40 flex items-center justify-center"
      >
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
          <path d="M10 2v16M2 10h16" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"/>
        </svg>
      </button>

      {/* Modal */}
      {modalOpen && (
        <TaskModal
          task={editingTask}
          initialStartDate={initialDate}
          onSave={addTask}
          onUpdate={updateTask}
          onDelete={deleteTask}
          onClose={() => {
            setModalOpen(false);
            setEditingTask(null);
          }}
        />
      )}
    </div>
  );
}

export default App;
