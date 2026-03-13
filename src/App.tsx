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
    <div className="min-h-dvh flex flex-col">
      <Header
        moveConfig={moveConfig}
        onUpdateMoveConfig={updateMoveConfig}
        taskCount={tasks.length}
        completedCount={completedCount}
      />

      <main className="flex-1 flex flex-col gap-4 p-4 sm:p-6 max-w-7xl mx-auto w-full">
        {/* Toolbar */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowList(!showList)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${
                showList
                  ? 'bg-blush-100 border-blush-300 text-blush-600'
                  : 'bg-white border-warm-200 text-warm-500 hover:border-warm-300'
              }`}
            >
              {showList ? '✦ Timeline' : '☰ List'}
            </button>
            <span className="text-xs text-warm-400 hidden sm:inline">
              Drag tasks to reschedule · Resize edges to adjust duration
            </span>
          </div>

          <button
            onClick={() => openNewTask()}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium bg-gradient-to-r from-blush-400 to-lavender-400 text-white shadow-sm hover:shadow-md transition-all active:scale-95"
          >
            <span className="text-lg leading-none">+</span>
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
        className="sm:hidden fixed bottom-6 right-6 w-14 h-14 rounded-full bg-gradient-to-br from-blush-400 to-lavender-400 text-white text-2xl shadow-lg hover:shadow-xl transition-all active:scale-90 z-40 flex items-center justify-center"
      >
        +
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
