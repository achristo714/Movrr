import { useRef, useState, useCallback, useMemo } from 'react';
import type { Task } from '../types';
import { CATEGORY_COLORS } from '../types';
import {
  getTimelineRange,
  dateToCol,
  parseISO,
  format,
  isToday,
  isSameMonth,
  differenceInDays,
  addDays,
} from '../utils';

interface TimelineProps {
  tasks: Task[];
  moveOutDate: string;
  moveInDate: string;
  onTaskClick: (task: Task) => void;
  onUpdateTask: (id: string, updates: Partial<Task>) => void;
  onAddTaskAtDate: (date: string) => void;
}

const DAY_WIDTH = 44;
const ROW_HEIGHT = 42;
const HEADER_HEIGHT = 72;

export function Timeline({
  tasks,
  moveOutDate,
  moveInDate,
  onTaskClick,
  onUpdateTask,
  onAddTaskAtDate,
}: TimelineProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [dragState, setDragState] = useState<{
    taskId: string;
    mode: 'move' | 'resize-start' | 'resize-end';
    startX: number;
    originalStart: string;
    originalEnd: string;
  } | null>(null);

  const { start: timelineStart, days } = useMemo(
    () => getTimelineRange(moveOutDate, moveInDate),
    [moveOutDate, moveInDate]
  );

  const moveOutCol = dateToCol(parseISO(moveOutDate), timelineStart);
  const moveInCol = dateToCol(parseISO(moveInDate), timelineStart);

  // Group tasks into non-overlapping rows
  const taskRows = useMemo(() => {
    const sorted = [...tasks].sort((a, b) => a.startDate.localeCompare(b.startDate));
    const rows: Task[][] = [];

    for (const task of sorted) {
      const taskStart = dateToCol(parseISO(task.startDate), timelineStart);

      let placed = false;
      for (const row of rows) {
        const lastInRow = row[row.length - 1];
        const lastEnd = dateToCol(parseISO(lastInRow.endDate), timelineStart);
        if (taskStart > lastEnd) {
          row.push(task);
          placed = true;
          break;
        }
      }
      if (!placed) rows.push([task]);
    }
    return rows;
  }, [tasks, timelineStart]);

  const totalWidth = days.length * DAY_WIDTH;
  const totalHeight = HEADER_HEIGHT + Math.max(taskRows.length, 3) * ROW_HEIGHT + 60;

  // Drag handlers
  const handlePointerDown = useCallback(
    (e: React.PointerEvent, task: Task, mode: 'move' | 'resize-start' | 'resize-end') => {
      e.stopPropagation();
      e.preventDefault();
      (e.target as HTMLElement).setPointerCapture(e.pointerId);
      setDragState({
        taskId: task.id,
        mode,
        startX: e.clientX,
        originalStart: task.startDate,
        originalEnd: task.endDate,
      });
    },
    []
  );

  const handlePointerMove = useCallback(
    (e: React.PointerEvent) => {
      if (!dragState) return;
      const dx = e.clientX - dragState.startX;
      const dayDelta = Math.round(dx / DAY_WIDTH);
      if (dayDelta === 0) return;

      const origStart = parseISO(dragState.originalStart);
      const origEnd = parseISO(dragState.originalEnd);

      let newStart: string;
      let newEnd: string;

      switch (dragState.mode) {
        case 'move':
          newStart = format(addDays(origStart, dayDelta), 'yyyy-MM-dd');
          newEnd = format(addDays(origEnd, dayDelta), 'yyyy-MM-dd');
          break;
        case 'resize-start': {
          const ns = addDays(origStart, dayDelta);
          if (differenceInDays(origEnd, ns) < 0) return;
          newStart = format(ns, 'yyyy-MM-dd');
          newEnd = dragState.originalEnd;
          break;
        }
        case 'resize-end': {
          const ne = addDays(origEnd, dayDelta);
          if (differenceInDays(ne, origStart) < 0) return;
          newStart = dragState.originalStart;
          newEnd = format(ne, 'yyyy-MM-dd');
          break;
        }
      }

      onUpdateTask(dragState.taskId, { startDate: newStart, endDate: newEnd });
    },
    [dragState, onUpdateTask]
  );

  const handlePointerUp = useCallback(() => {
    setDragState(null);
  }, []);

  // Months for header
  const months = useMemo(() => {
    const result: { name: string; startCol: number; span: number }[] = [];
    let current = '';
    for (let i = 0; i < days.length; i++) {
      const label = format(days[i], 'MMM yyyy');
      if (label !== current) {
        if (result.length) result[result.length - 1].span = i - result[result.length - 1].startCol;
        result.push({ name: label, startCol: i, span: 0 });
        current = label;
      }
    }
    if (result.length) result[result.length - 1].span = days.length - result[result.length - 1].startCol;
    return result;
  }, [days]);

  return (
    <div className="flex-1 overflow-hidden border border-warm-200 rounded-2xl bg-white shadow-sm">
      <div
        ref={scrollRef}
        className="overflow-auto"
        style={{ maxHeight: 'calc(100dvh - 220px)' }}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
      >
        <div style={{ width: totalWidth, minHeight: totalHeight }} className="relative">
          {/* Month headers */}
          <div className="sticky top-0 z-20 bg-white/95 backdrop-blur-sm border-b border-warm-100">
            <div className="flex" style={{ height: 32 }}>
              {months.map(m => (
                <div
                  key={m.name}
                  className="text-xs font-medium text-warm-500 flex items-center px-2 border-r border-warm-100"
                  style={{ width: m.span * DAY_WIDTH }}
                >
                  {m.name}
                </div>
              ))}
            </div>
            {/* Day headers */}
            <div className="flex" style={{ height: HEADER_HEIGHT - 32 }}>
              {days.map((day, i) => {
                const isMoveOut = i === moveOutCol;
                const isMoveIn = i === moveInCol;
                const today = isToday(day);
                const isWeekend = day.getDay() === 0 || day.getDay() === 6;

                return (
                  <div
                    key={i}
                    className={`flex flex-col items-center justify-center border-r border-warm-100 cursor-pointer transition-colors hover:bg-blush-50 ${
                      today ? 'bg-blush-50' : isWeekend ? 'bg-warm-50/50' : ''
                    }`}
                    style={{ width: DAY_WIDTH }}
                    onClick={() => onAddTaskAtDate(format(day, 'yyyy-MM-dd'))}
                  >
                    <span className={`text-[10px] uppercase ${
                      today ? 'text-blush-500 font-semibold' : 'text-warm-400'
                    }`}>
                      {format(day, 'EEE')}
                    </span>
                    <span className={`text-xs font-medium ${
                      today
                        ? 'bg-blush-400 text-white w-5 h-5 rounded-full flex items-center justify-center'
                        : isMoveOut
                        ? 'text-blush-500 font-bold'
                        : isMoveIn
                        ? 'text-sage-500 font-bold'
                        : !isSameMonth(day, days[Math.floor(days.length / 2)])
                        ? 'text-warm-300'
                        : 'text-warm-600'
                    }`}>
                      {format(day, 'd')}
                    </span>
                    {(isMoveOut || isMoveIn) && (
                      <span className={`text-[8px] font-bold uppercase ${
                        isMoveOut ? 'text-blush-400' : 'text-sage-400'
                      }`}>
                        {isMoveOut ? 'OUT' : 'IN'}
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Grid lines */}
          <div className="absolute left-0 right-0" style={{ top: HEADER_HEIGHT }}>
            {days.map((day, i) => {
              const isWeekend = day.getDay() === 0 || day.getDay() === 6;
              const isMoveOut = i === moveOutCol;
              const isMoveIn = i === moveInCol;
              const today = isToday(day);

              return (
                <div
                  key={i}
                  className={`absolute top-0 bottom-0 border-r ${
                    isMoveOut
                      ? 'border-blush-300 bg-blush-50/30'
                      : isMoveIn
                      ? 'border-sage-300 bg-sage-50/30'
                      : today
                      ? 'border-blush-200 bg-blush-50/20'
                      : isWeekend
                      ? 'border-warm-100 bg-warm-50/30'
                      : 'border-warm-100/50'
                  }`}
                  style={{
                    left: i * DAY_WIDTH,
                    width: DAY_WIDTH,
                    height: totalHeight - HEADER_HEIGHT,
                  }}
                  onClick={() => onAddTaskAtDate(format(day, 'yyyy-MM-dd'))}
                />
              );
            })}

            {/* Today marker line */}
            {days.some(d => isToday(d)) && (
              <div
                className="absolute top-0 w-0.5 bg-blush-400 z-10"
                style={{
                  left: days.findIndex(d => isToday(d)) * DAY_WIDTH + DAY_WIDTH / 2,
                  height: totalHeight - HEADER_HEIGHT,
                }}
              />
            )}
          </div>

          {/* Task bars */}
          <div className="relative" style={{ top: HEADER_HEIGHT }}>
            {taskRows.map((row, rowIdx) =>
              row.map(task => {
                const startCol = dateToCol(parseISO(task.startDate), timelineStart);
                const endCol = dateToCol(parseISO(task.endDate), timelineStart);
                const span = endCol - startCol + 1;
                const color = CATEGORY_COLORS[task.category];
                const isDragging = dragState?.taskId === task.id;

                return (
                  <div
                    key={task.id}
                    className={`absolute flex items-center group cursor-grab active:cursor-grabbing ${
                      isDragging ? 'z-30 scale-[1.02] shadow-lg' : 'z-10 hover:z-20'
                    } transition-shadow`}
                    style={{
                      left: startCol * DAY_WIDTH + 2,
                      top: rowIdx * ROW_HEIGHT + 6,
                      width: span * DAY_WIDTH - 4,
                      height: ROW_HEIGHT - 12,
                    }}
                  >
                    {/* Resize handle - start */}
                    <div
                      className="absolute left-0 top-0 bottom-0 w-2 cursor-col-resize z-10 hover:bg-white/30 rounded-l-lg"
                      onPointerDown={e => handlePointerDown(e, task, 'resize-start')}
                    />

                    {/* Task bar */}
                    <div
                      className={`w-full h-full rounded-lg border flex items-center px-2 gap-1.5 transition-all ${
                        task.completed ? 'opacity-50' : ''
                      } hover:shadow-md`}
                      style={{
                        backgroundColor: color + '33',
                        borderColor: color + '88',
                      }}
                      onPointerDown={e => handlePointerDown(e, task, 'move')}
                      onClick={e => {
                        if (!dragState) {
                          e.stopPropagation();
                          onTaskClick(task);
                        }
                      }}
                    >
                      {/* Completed checkbox */}
                      <button
                        className={`w-4 h-4 rounded-full border-2 flex-shrink-0 flex items-center justify-center transition-colors ${
                          task.completed
                            ? 'bg-sage-300 border-sage-400 text-white'
                            : 'border-warm-300 hover:border-blush-400'
                        }`}
                        style={{ borderColor: task.completed ? undefined : color }}
                        onClick={e => {
                          e.stopPropagation();
                          onUpdateTask(task.id, { completed: !task.completed });
                        }}
                        onPointerDown={e => e.stopPropagation()}
                      >
                        {task.completed && (
                          <svg width="8" height="8" viewBox="0 0 12 12" fill="none">
                            <path d="M2 6L5 9L10 3" stroke="white" strokeWidth="2" strokeLinecap="round" />
                          </svg>
                        )}
                      </button>

                      {/* Title */}
                      <span
                        className={`text-xs font-medium truncate ${
                          task.completed ? 'line-through text-warm-400' : 'text-warm-700'
                        }`}
                      >
                        {task.title}
                      </span>

                      {/* Assignee badge */}
                      {task.assignee && span >= 3 && (
                        <span className="ml-auto text-[10px] text-warm-400 flex-shrink-0">
                          {task.assignee === 'me' ? '👤' : task.assignee === 'partner' ? '💕' : '👫'}
                        </span>
                      )}
                    </div>

                    {/* Resize handle - end */}
                    <div
                      className="absolute right-0 top-0 bottom-0 w-2 cursor-col-resize z-10 hover:bg-white/30 rounded-r-lg"
                      onPointerDown={e => handlePointerDown(e, task, 'resize-end')}
                    />
                  </div>
                );
              })
            )}
          </div>

          {/* Empty state */}
          {tasks.length === 0 && (
            <div className="absolute inset-0 flex items-center justify-center" style={{ top: HEADER_HEIGHT }}>
              <div className="text-center p-8">
                <div className="text-4xl mb-3">📦</div>
                <p className="font-display text-lg text-warm-500 mb-1">No tasks yet</p>
                <p className="text-sm text-warm-400">
                  Click any date on the timeline or use the + button to add your first moving task
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
