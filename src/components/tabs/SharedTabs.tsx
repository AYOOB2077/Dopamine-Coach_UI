import './SharedTabs.css';
import React, { useState } from 'react';
import { Task } from '../../types/models';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';
import { taskApi } from '../../lib/api';

export function WeekTimeline({
  anchor = new Date(),
  activeIso,
  onPick,
  onAdvanceWeek,
  onRewindWeek,
  onReset,
  weekOffset = 0
}: {
  anchor?: Date;
  activeIso: string;
  onPick: (iso: string) => void;
  onAdvanceWeek?: () => void;
  onRewindWeek?: () => void;
  onReset?: () => void;
  weekOffset?: number;
}) {
  const toIso = (d: Date) => {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${dd}`;
  };

  const start = new Date(anchor);
  start.setDate(start.getDate() + weekOffset * 7);

  const days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(start);
    d.setDate(start.getDate() + i);
    return d;
  });

  const monthLabel = `${start.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}`;
  const DOW = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];

  const todayIso = toIso(new Date());

  return (
    <div className="weektl">
      <div className="weektl-head">
        <div className="weektl-month">{monthLabel}</div>
        <div className="weektl-ctrls">
          {onRewindWeek && (
            <button className="weektl-btn weektl-btn-icon" onClick={onRewindWeek} aria-label="Previous week">
              <svg viewBox="0 0 16 16" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M10 3l-5 5 5 5" />
              </svg>
            </button>
          )}
          {weekOffset !== 0 && onReset && (
            <button className="weektl-btn" onClick={onReset} aria-label="Back to this week">This week</button>
          )}
          {onAdvanceWeek && (
            <button className="weektl-btn weektl-btn-icon" onClick={onAdvanceWeek} aria-label="Next week">
              <svg viewBox="0 0 16 16" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M6 3l5 5-5 5" />
              </svg>
            </button>
          )}
        </div>
      </div>
      <div className="weektl-rail">
        {days.map((d) => {
          const iso = toIso(d);
          const isActive = iso === activeIso;
          const isToday = iso === todayIso;
          const dayNum = d.getDate();
          return (
            <button key={iso} className={`weektl-chip ${isActive ? 'active' : ''} ${isToday ? 'today' : ''}`} onClick={() => onPick(iso)}>
              <div className="weektl-chip-dow">{DOW[d.getDay()]}</div>
              <div className="weektl-chip-num">{dayNum}</div>
              <div className="weektl-chip-underline" />
            </button>
          );
        })}
      </div>
    </div>
  );
}

export function TaskPopup({
  mode,
  initial,
  onCancel,
  onSave
}: {
  mode: 'create' | 'edit';
  initial?: Partial<Task>;
  onCancel: () => void;
  onSave: (data: { title: string; description: string }) => void;
}) {
  const [title, setTitle] = useState(initial?.title || '');
  const [desc, setDesc] = useState(initial?.description || '');

  return (
    <div className="up-modal-scrim" onClick={onCancel}>
      <div className="up-modal" onClick={e => e.stopPropagation()}>
        <div className="up-modal-head">
          <div className="up-modal-title">{mode === 'edit' ? 'Edit Task' : 'New Task'}</div>
          <button className="up-modal-close" onClick={onCancel} aria-label="Close">
            <svg viewBox="0 0 16 16" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
              <path d="M3 3l10 10M13 3L3 13" />
            </svg>
          </button>
        </div>
        <div className="up-modal-body">
          <Input
            className="up-modal-input"
            placeholder="Title of the Task"
            value={title}
            onChange={e => setTitle(e.target.value)}
            autoFocus
          />
          <Textarea
            className="up-modal-textarea"
            placeholder="What do you want to achieve?"
            rows={4}
            value={desc}
            onChange={e => setDesc(e.target.value)}
          />
        </div>
        <div className="up-modal-foot">
          <Button variant="ghost" onClick={onCancel}>Cancel</Button>
          <Button onClick={() => {
            onSave({ title: title.trim(), description: desc.trim() });
          }}>
            {mode === 'edit' ? 'Save changes' : 'Add task'}
          </Button>
        </div>
      </div>
    </div>
  );
}
