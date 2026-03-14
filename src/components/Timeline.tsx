import { useRef, useState, useCallback, useMemo, useEffect } from 'react';
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
  startOfWeek,
  eachDayOfInterval,
} from '../utils';

interface TimelineProps {
  tasks: Task[];
  moveOutDate: string;
  moveInDate: string;
  onTaskClick: (task: Task) => void;
  onUpdateTask: (id: string, updates: Partial<Task>) => void;
  onAddTaskAtDate: (date: string) => void;
}

const DAY_WIDTH = 48;
const ROW_HEIGHT = 44;
const HEADER_HEIGHT = 76;

// Mobile calendar view component
function MobileCalendar({
  tasks,
  moveOutDate,
  moveInDate,
  onTaskClick,
  onUpdateTask,
  onAddTaskAtDate,
}: TimelineProps) {
  const today = new Date();
  const [selectedDate, setSelectedDate] = useState(format(today, 'yyyy-MM-dd'));
  const [currentMonth, setCurrentMonth] = useState(today);

  const monthStart = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1);
  const calStart = startOfWeek(monthStart, { weekStartsOn: 0 });
  const calEnd = new Date(calStart);
  calEnd.setDate(calStart.getDate() + 41); // 6 weeks

  const calDays = eachDayOfInterval({ start: calStart, end: calEnd });

  const moveOutStr = moveOutDate;
  const moveInStr = moveInDate;

  const tasksForDate = (dateStr: string) =>
    tasks.filter(t => t.startDate <= dateStr && t.endDate >= dateStr);

  const selectedTasks = tasksForDate(selectedDate);

  const prevMonth = () => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1));
  const nextMonth = () => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1));

  return (
    <div className="flex flex-col gap-3">
      {/* Month navigation */}
      <div className="bg-white rounded-2xl border border-warm-100 shadow-sm overflow-hidden">
        <div className="flex items-center justify-between px-4 py-3">
          <button onClick={prevMonth} className="w-8 h-8 rounded-xl bg-warm-50 flex items-center justify-center text-warm-500 hover:bg-warm-100 active:scale-95 transition-all">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M10 4L6 8l4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
          </button>
          <h3 className="font-display text-base font-semibold text-warm-700">
            {format(currentMonth, 'MMMM yyyy')}
          </h3>
          <button onClick={nextMonth} className="w-8 h-8 rounded-xl bg-warm-50 flex items-center justify-center text-warm-500 hover:bg-warm-100 active:scale-95 transition-all">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M6 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
          </button>
        </div>

        {/* Day names */}
        <div className="grid grid-cols-7 px-2">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => (
            <div key={d} className="text-center text-[10px] font-medium text-warm-400 uppercase tracking-wider py-1">
              {d}
            </div>
          ))}
        </div>

        {/* Calendar grid */}
        <div className="grid grid-cols-7 gap-px bg-warm-100/50 mx-2 mb-2 rounded-xl overflow-hidden">
          {calDays.map((day, i) => {
            const dateStr = format(day, 'yyyy-MM-dd');
            const inMonth = day.getMonth() === currentMonth.getMonth();
            const isSelected = dateStr === selectedDate;
            const isTodayDate = isToday(day);
            const isMoveOut = dateStr === moveOutStr;
            const isMoveIn = dateStr === moveInStr;
            const dayTasks = tasksForDate(dateStr);
            const hasTask = dayTasks.length > 0;

            return (
              <button
                key={i}
                onClick={() => setSelectedDate(dateStr)}
                className={`relative flex flex-col items-center justify-center py-2 transition-all ${
                  isSelected
                    ? 'bg-blush-400 text-white shadow-sm'
                    : isTodayDate
                    ? 'bg-blush-50 text-blush-600'
                    : inMonth
                    ? 'bg-white text-warm-700 hover:bg-warm-50 active:bg-warm-100'
                    : 'bg-warm-50/50 text-warm-300'
                }`}
              >
                <span className={`text-sm font-medium ${
                  isSelected ? 'text-white' : isMoveOut ? 'text-blush-500 font-bold' : isMoveIn ? 'text-sage-500 font-bold' : ''
                }`}>
                  {day.getDate()}
                </span>
                {(isMoveOut || isMoveIn) && (
                  <span className={`text-[7px] font-bold uppercase leading-none ${
                    isSelected ? 'text-white/80' : isMoveOut ? 'text-blush-400' : 'text-sage-400'
                  }`}>
                    {isMoveOut ? 'OUT' : 'IN'}
                  </span>
                )}
                {hasTask && !isSelected && (
                  <div className="flex gap-0.5 mt-0.5">
                    {dayTasks.slice(0, 3).map((t, j) => (
                      <div
                        key={j}
                        className="w-1 h-1 rounded-full"
                        style={{ backgroundColor: CATEGORY_COLORS[t.category] }}
                      />
                    ))}
                  </div>
                )}
                {hasTask && isSelected && (
                  <div className="w-1 h-1 rounded-full bg-white/80 mt-0.5" />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Selected date tasks */}
      <div className="bg-white rounded-2xl border border-warm-100 shadow-sm overflow-hidden">
        <div className="flex items-center justify-between px-4 py-3 border-b border-warm-50">
          <div>
            <h4 className="text-sm font-semibold text-warm-700">
              {format(parseISO(selectedDate), 'EEEE, MMM d')}
            </h4>
            <p className="text-[11px] text-warm-400">
              {selectedTasks.length === 0 ? 'No tasks' : `${selectedTasks.length} task${selectedTasks.length > 1 ? 's' : ''}`}
            </p>
          </div>
          <button
            onClick={() => onAddTaskAtDate(selectedDate)}
            className="w-8 h-8 rounded-xl bg-gradient-to-br from-blush-400 to-lavender-400 text-white flex items-center justify-center shadow-sm hover:shadow-md active:scale-95 transition-all"
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M8 3v10M3 8h10" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
            </svg>
          </button>
        </div>

        {selectedTasks.length === 0 ? (
          <button
            onClick={() => onAddTaskAtDate(selectedDate)}
            className="w-full py-8 flex flex-col items-center gap-2 text-warm-300 hover:text-warm-400 hover:bg-warm-50/50 transition-colors"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className="text-warm-300">
              <path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
            <span className="text-xs">Tap to add a task</span>
          </button>
        ) : (
          <div className="divide-y divide-warm-50">
            {selectedTasks.map(task => {
              const color = CATEGORY_COLORS[task.category];
              return (
                <div
                  key={task.id}
                  className="flex items-center gap-3 px-4 py-3 active:bg-warm-50 transition-colors"
                  onClick={() => onTaskClick(task)}
                >
                  <button
                    className={`w-5 h-5 rounded-full border-2 flex-shrink-0 flex items-center justify-center transition-all ${
                      task.completed ? 'bg-sage-300 border-sage-400 scale-95' : 'hover:scale-110'
                    }`}
                    style={{ borderColor: task.completed ? undefined : color }}
                    onClick={e => {
                      e.stopPropagation();
                      onUpdateTask(task.id, { completed: !task.completed });
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
                    <p className="text-[11px] text-warm-400">
                      {format(parseISO(task.startDate), 'MMM d')}
                      {task.startDate !== task.endDate && ` — ${format(parseISO(task.endDate), 'MMM d')}`}
                    </p>
                  </div>
                  <div
                    className="w-2 h-8 rounded-full flex-shrink-0"
                    style={{ backgroundColor: color + '66' }}
                  />
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

// Desktop Gantt timeline
function DesktopTimeline({
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

  // Scroll to today on mount
  useEffect(() => {
    if (scrollRef.current) {
      const todayIdx = days.findIndex(d => isToday(d));
      if (todayIdx >= 0) {
        const scrollTo = Math.max(0, todayIdx * DAY_WIDTH - scrollRef.current.clientWidth / 3);
        scrollRef.current.scrollLeft = scrollTo;
      }
    }
  }, [days]);

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
    <div className="flex-1 overflow-hidden border border-warm-100 rounded-2xl bg-white shadow-sm">
      <div
        ref={scrollRef}
        className="overflow-auto scroll-smooth"
        style={{ maxHeight: 'calc(100dvh - 200px)' }}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
      >
        <div style={{ width: totalWidth, minHeight: totalHeight }} className="relative">
          {/* Month headers */}
          <div className="sticky top-0 z-20 bg-white/90 backdrop-blur-md border-b border-warm-100">
            <div className="flex" style={{ height: 32 }}>
              {months.map(m => (
                <div
                  key={m.name}
                  className="text-[11px] font-semibold text-warm-500 flex items-center px-3 border-r border-warm-50"
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
                    className={`flex flex-col items-center justify-center border-r border-warm-50 cursor-pointer transition-colors hover:bg-blush-50/80 ${
                      today ? 'bg-blush-50/60' : isWeekend ? 'bg-warm-50/30' : ''
                    }`}
                    style={{ width: DAY_WIDTH }}
                    onClick={() => onAddTaskAtDate(format(day, 'yyyy-MM-dd'))}
                  >
                    <span className={`text-[10px] uppercase tracking-wide ${
                      today ? 'text-blush-500 font-bold' : 'text-warm-400 font-medium'
                    }`}>
                      {format(day, 'EEE')}
                    </span>
                    <span className={`text-xs font-medium leading-none ${
                      today
                        ? 'bg-blush-400 text-white w-6 h-6 rounded-full flex items-center justify-center'
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
                      <span className={`text-[7px] font-bold uppercase leading-none ${
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
                      ? 'border-blush-200/80 bg-blush-50/20'
                      : isMoveIn
                      ? 'border-sage-200/80 bg-sage-50/20'
                      : today
                      ? 'border-blush-100/80 bg-blush-50/10'
                      : isWeekend
                      ? 'border-warm-100/50 bg-warm-50/20'
                      : 'border-warm-50'
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
                className="absolute top-0 w-0.5 bg-blush-400/80 z-10 rounded-full"
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
                      isDragging ? 'z-30 scale-[1.03] shadow-lg' : 'z-10 hover:z-20'
                    } transition-all duration-150`}
                    style={{
                      left: startCol * DAY_WIDTH + 3,
                      top: rowIdx * ROW_HEIGHT + 6,
                      width: span * DAY_WIDTH - 6,
                      height: ROW_HEIGHT - 12,
                    }}
                  >
                    {/* Resize handle - start */}
                    <div
                      className="absolute left-0 top-0 bottom-0 w-2.5 cursor-col-resize z-10 hover:bg-white/30 rounded-l-lg"
                      onPointerDown={e => handlePointerDown(e, task, 'resize-start')}
                    />

                    {/* Task bar */}
                    <div
                      className={`w-full h-full rounded-lg border flex items-center px-2.5 gap-1.5 transition-all ${
                        task.completed ? 'opacity-40' : ''
                      } hover:shadow-md hover:brightness-[1.02]`}
                      style={{
                        backgroundColor: color + '30',
                        borderColor: color + '60',
                      }}
                      onPointerDown={e => handlePointerDown(e, task, 'move')}
                      onClick={e => {
                        if (!dragState) {
                          e.stopPropagation();
                          onTaskClick(task);
                        }
                      }}
                    >
                      <button
                        className={`w-4 h-4 rounded-full border-2 flex-shrink-0 flex items-center justify-center transition-all ${
                          task.completed
                            ? 'bg-sage-300 border-sage-400 text-white'
                            : 'border-current hover:scale-110'
                        }`}
                        style={{ borderColor: task.completed ? undefined : color, color }}
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

                      <span
                        className={`text-xs font-medium truncate ${
                          task.completed ? 'line-through text-warm-400' : 'text-warm-700'
                        }`}
                      >
                        {task.title}
                      </span>

                      {task.assignee && span >= 3 && (
                        <span className="ml-auto text-[10px] text-warm-400 flex-shrink-0">
                          {task.assignee === 'me' ? '👤' : task.assignee === 'partner' ? '💕' : '👫'}
                        </span>
                      )}
                    </div>

                    {/* Resize handle - end */}
                    <div
                      className="absolute right-0 top-0 bottom-0 w-2.5 cursor-col-resize z-10 hover:bg-white/30 rounded-r-lg"
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
                  Click any date to add your first moving task
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export function Timeline(props: TimelineProps) {
  const [isMobile, setIsMobile] = useState(window.innerWidth < 640);

  useEffect(() => {
    const onResize = () => setIsMobile(window.innerWidth < 640);
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  return isMobile ? <MobileCalendar {...props} /> : <DesktopTimeline {...props} />;
}
