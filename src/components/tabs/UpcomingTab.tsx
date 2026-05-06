import './UpcomingTab.css';
import React, { useState, useEffect } from 'react';
import { WeekTimeline, TaskPopup } from './SharedTabs';
import { IconChev, IconPlus } from '../shared/Icons';
import { Task } from '../../types/models';
import { taskApi } from '../../lib/api';

function UpcomingCard({ task, onEdit, onLaunch }: { task: Partial<Task>; onEdit: (task: Partial<Task>) => void; onLaunch: (task: Partial<Task>) => void; }) {
  const [open, setOpen] = useState(false);
  return (
    <div className={`up-card ${open ? 'open' : ''}`}>
      <button className="up-card-head" onClick={() => setOpen(o => !o)}>
        <div className="up-card-head-main">
          <div className="up-card-meta">
            <span>{task.timeLabel}</span>
            <span className="up-card-meta-dot">•</span>
            <span>{task.dateLabel}</span>
          </div>
          <div className="up-card-title">{task.title}</div>
        </div>
        <div className={`up-card-chev ${open ? 'open' : ''}`}><IconChev size={18} /></div>
      </button>
      {open && (
        <div className="up-card-body">
          <p className="up-card-desc">{task.description}</p>
          <div className="up-card-actions">
            <button className="btn-ghost-edit" onClick={(e) => { e.stopPropagation(); onEdit(task); }}>
              <svg viewBox="0 0 16 16" width="13" height="13" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                <path d="M11.5 2.5l2 2L6 12H4v-2l7.5-7.5z" />
              </svg>
              Edit
            </button>
            <button className="btn-go-pill" onClick={(e) => { e.stopPropagation(); onLaunch(task); }}>
              GO
              <svg viewBox="0 0 16 16" width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M5 3l5 5-5 5" />
              </svg>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export function UpcomingTab({ onLaunchTask }: { onLaunchTask: (task: Partial<Task>) => void }) {
  const [tasks, setTasks] = useState<Partial<Task>[]>([]);
  const todayIso = new Date().toISOString().split('T')[0];
  const [activeIso, setActiveIso] = useState(todayIso);
  const [weekOffset, setWeekOffset] = useState(0);
  const [popup, setPopup] = useState<{ mode: 'create' | 'edit'; initial?: Partial<Task> } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadTasks = async () => {
      try {
        setLoading(true);
        const response = await taskApi.getUpcomingTasks();
        // Map API response to frontend task format
        const mappedTasks = response.data.map((task: any) => ({
          id: task.id,
          title: task.title,
          description: task.description,
          isoDate: '2024-12-27', // TODO: Extract from task data if available
          timeLabel: new Date(task.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          dateLabel: new Date(task.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        }));
        setTasks(mappedTasks);
      } catch (err) {
        console.error('Failed to load upcoming tasks:', err);
        setError('Failed to load tasks');
      } finally {
        setLoading(false);
      }
    };
    loadTasks();
  }, []);

  const visible = tasks.filter(t => t.isoDate === activeIso);

  const saveTask = (data: { title: string; description: string }) => {
    if (popup?.mode === 'edit' && popup.initial) {
      setTasks(ts => ts.map(t => t.id === popup.initial?.id ? { ...t, ...data } : t));
    } else {
      const niceDate = new Date(activeIso + 'T00:00').toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
      setTasks(ts => [...ts, {
        id: Date.now().toString(),
        isoDate: activeIso,
        timeLabel: 'All day',
        dateLabel: niceDate,
        title: data.title || 'Untitled task',
        description: data.description || 'No description yet.',
      }]);
    }
    setPopup(null);
  };

  return (
    <>
      <h1 className="page-title"><b>Upcoming</b> <span className="title-light">Plan what's next</span></h1>
      <WeekTimeline
        activeIso={activeIso}
        onPick={setActiveIso}
        weekOffset={weekOffset}
        onAdvanceWeek={() => setWeekOffset(w => w + 1)}
        onRewindWeek={() => setWeekOffset(w => w - 1)}
        onReset={() => setWeekOffset(0)}
      />
      <div className="up-toolbar">
        <div className="up-toolbar-label">
          {visible.length} {visible.length === 1 ? 'task' : 'tasks'} planned
        </div>
        <button className="btn-add" onClick={() => setPopup({ mode: 'create' })}>
          <IconPlus /> Add Task
        </button>
      </div>
      <div className="up-list">
        {visible.length === 0 && (
          <div className="up-empty">
            <div className="up-empty-title">Nothing planned yet</div>
            <div className="up-empty-sub">Tap <b>+ Add Task</b> to add something gentle to this day.</div>
          </div>
        )}
        {visible.map(t => (
          <UpcomingCard
            key={t.id}
            task={t}
            onEdit={(task) => setPopup({ mode: 'edit', initial: task })}
            onLaunch={(task) => onLaunchTask(task)}
          />
        ))}
      </div>
      {popup && (
        <TaskPopup
          mode={popup.mode}
          initial={popup.initial}
          onCancel={() => setPopup(null)}
          onSave={saveTask}
        />
      )}
    </>
  );
}
