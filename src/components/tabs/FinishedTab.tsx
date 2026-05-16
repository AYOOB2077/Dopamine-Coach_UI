import './FinishedTab.css';
import React, { useState, useEffect } from 'react';
import { IconChev, IconCheck } from '../shared/Icons';
import { taskApi } from '../../lib/api';

interface FinishedCard {
  n: number;
  title: string;
  finishedOn: string;
  steps: Array<{ title: string; ts: string }>;
  defaultOpen?: boolean;
}

function FinishedCardComponent({ n, title, finishedOn, steps, defaultOpen = false }: FinishedCard) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className={`finished-card ${open ? 'open' : ''}`}>
      <button className="finished-card-head" onClick={() => setOpen((o: boolean) => !o)}>
        <div className="finished-card-head-main">
          <div className="finished-card-meta">
            <span>Task {n}</span>
            <span className="finished-card-meta-dot">•</span>
            <span>Finished {finishedOn}</span>
          </div>
          <div className="finished-card-title">{title}</div>
        </div>
        <div className="finished-card-head-right">
          <div className="finished-card-count">{steps.length} steps</div>
          <div className={`finished-card-chev ${open ? 'open' : ''}`}><IconChev size={18} /></div>
        </div>
      </button>
      {open && (
        <div className="finished-log">
          <div className="finished-log-label">Completed sub-steps</div>
          <ul className="finished-steps">
            {steps.map((s, i: number) => (
              <li key={i} className="finished-step">
                <div className="finished-step-check" aria-hidden="true">
                  <IconCheck size={11} />
                </div>
                <div className="finished-step-title">{s.title}</div>
                <div className="finished-step-ts">{s.ts}</div>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

export function FinishedTab() {
  const [cards, setCards] = useState<FinishedCard[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadFinishedTasks = async () => {
      try {
        setLoading(true);
        const userId = localStorage.getItem('user_id') || 'placeholder-user-id';
        const response = await taskApi.getFinishedTasks(userId);
        
        // Map API response to frontend finished card format
        const finishedCards = response.data.map((task: any, index: number) => ({
          n: index + 1,
          title: task.title,
          finishedOn: new Date(task.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
          steps: (task.steps || []).map((step: any) => ({
            title: step.stepTitle,
            ts: new Date(step.completedAt || step.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          })),
          defaultOpen: false,
        }));
        setCards(finishedCards);
      } catch (err) {
        console.error('Failed to load finished tasks:', err);
        setError('Failed to load tasks');
      } finally {
        setLoading(false);
      }
    };
    loadFinishedTasks();
  }, []);

  return (
    <>
      <h1 className="page-title"><b>Finished</b> <span className="title-light">Completed tasks log</span></h1>
      <div className="finished-list">
        {cards.map((c, i) => <FinishedCardComponent key={i} {...c} />)}
      </div>
    </>
  );
}
