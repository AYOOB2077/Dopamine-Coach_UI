import './UpcomingTab.css';
import React, { useState, useEffect } from 'react';
import { WeekTimeline, TaskPopup } from './SharedTabs';
import { IconChev, IconPlus } from '../shared/Icons';
import { Task } from '../../types/models';
import { taskApi } from '../../lib/api';

function UpcomingCard({ task, onEdit, onDelete, onLaunch }: { task: Partial<Task>; onEdit: (task: Partial<Task>) => void; onDelete: (task: Partial<Task>) => void; onLaunch: (task: Partial<Task>) => void; }) {
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
            <div style={{ display: 'flex', gap: '8px' }}>
              <button className="btn-ghost-edit" onClick={(e) => { e.stopPropagation(); onEdit(task); }}>
                <svg viewBox="0 0 16 16" width="13" height="13" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M11.5 2.5l2 2L6 12H4v-2l7.5-7.5z" />
                </svg>
                Edit
              </button>
              <button className="btn-ghost-edit" style={{ color: '#ef4444' }} onClick={(e) => { e.stopPropagation(); onDelete(task); }}>
                <svg viewBox="0 0 16 16" width="13" height="13" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M2.5 4h11M5.5 4v-1.5h5V4M6.5 7v5M9.5 7v5M4 4l1 9.5h6L12 4" />
                </svg>
                Delete
              </button>
            </div>
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
  const [taskToDelete, setTaskToDelete] = useState<Partial<Task> | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadTasks = async () => {
    try {
      setLoading(true);
      // Replace with actual user ID from auth context or local storage
      const userId = localStorage.getItem('user_id') || 'placeholder-user-id';
      
      const response = await taskApi.getUpcomingTasks(userId, activeIso);
      
      // Map API response to frontend task format
      const mappedTasks = response.data.map((task: any) => {
        const createdAt = new Date(task.createdAt);
        return {
          id: task.id,
          title: task.title,
          description: task.description,
          isoDate: activeIso,
          timeLabel: createdAt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          dateLabel: createdAt.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        };
      });
      setTasks(mappedTasks);
    } catch (err) {
      console.error('Failed to load upcoming tasks:', err);
      setError('Failed to load tasks');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTasks();
  }, [activeIso]);

  const visible = tasks; // Tasks are now fetched directly for the activeIso

  const saveTask = async (data: { title: string; description: string }) => {
    const userId = localStorage.getItem('user_id') || 'placeholder-user-id';
    
    if (popup?.mode === 'edit' && popup.initial) {
      try {
        await taskApi.updateTask(popup.initial.id!, {
          title: data.title || 'Untitled task',
          description: data.description || 'No description yet.',
          status: 0,
          taskLevel: 0
        });
        setTasks(ts => ts.map(t => t.id === popup.initial?.id ? { ...t, ...data } : t));
        loadTasks();
      } catch (err) {
        console.error('Failed to update task:', err);
      }
    } else {
      try {
        const now = new Date();
        const [year, month, day] = activeIso.split('-');
        now.setFullYear(parseInt(year, 10), parseInt(month, 10) - 1, parseInt(day, 10));

        // Adjust for local timezone offset so the ISO string reflects the user's local time instead of strictly UTC.
        const tzOffset = now.getTimezoneOffset() * 60000;
        const localNow = new Date(now.getTime() - tzOffset);

        await taskApi.createTask(userId, {
          title: data.title || 'Untitled task',
          description: data.description || 'No description yet.',
          date: localNow.toISOString() // This sends local time format with Z, tricking naive backends to accept it as local time
        });
        // Reload tasks from backend immediately after creation
        loadTasks();
      } catch (err) {
        console.error('Failed to create task:', err);
        // Fallback optimistic UI update in case of failure or if needed
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
    }
    setPopup(null);
  };

  const deleteTask = async (task: Partial<Task>) => {
    if (!task.id) return;
    try {
      await taskApi.deleteTask(task.id);
      loadTasks(); // Reload the list after successful deletion
    } catch (err) {
      console.error('Failed to delete task:', err);
    }
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
        <button 
          className="btn-add" 
          onClick={() => setPopup({ mode: 'create' })}
          disabled={activeIso < todayIso}
          style={activeIso < todayIso ? { opacity: 0.5, cursor: 'not-allowed' } : undefined}
        >
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
            onDelete={(task) => setTaskToDelete(task)}
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
      {taskToDelete && (
        <div className="up-modal-scrim" onClick={() => setTaskToDelete(null)}>
          <div className="up-modal" onClick={e => e.stopPropagation()}>
            <div className="up-modal-head">
              <div className="up-modal-title">Delete Task</div>
              <button className="up-modal-close" onClick={() => setTaskToDelete(null)} aria-label="Close">
                <svg viewBox="0 0 16 16" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
                  <path d="M3 3l10 10M13 3L3 13" />
                </svg>
              </button>
            </div>
            <div className="up-modal-body" style={{ padding: '8px 24px 24px' }}>
              <p style={{ margin: 0, fontSize: '15px', color: '#4b5563' }}>
                Are you sure about deleting "{taskToDelete.title}"?
              </p>
            </div>
            <div className="up-modal-foot" style={{ gap: '12px' }}>
              <button 
                className="btn-ghost-edit" 
                style={{ color: '#ef4444', marginRight: 'auto' }} 
                onClick={() => {
                  deleteTask(taskToDelete);
                  setTaskToDelete(null);
                }}
              >
                OK
              </button>
              <button 
                className="btn-go-pill" 
                autoFocus 
                onClick={() => setTaskToDelete(null)}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
