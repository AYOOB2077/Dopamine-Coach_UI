import './RoadmapScreen.css';
import React from 'react';
import { Task, Step } from '../../types/models';
import { Button } from '../ui/button';
import { focusSessionApi, stepApi } from '../../lib/api';

export function RoadmapScreen({ task, onStart }: { task: Partial<Task>; onStart: (steps: Partial<Step>[]) => void }) {
  const steps = task.steps || [
    { 
      title: 'Clarify the outcome in one sentence',
      decomposition: 'Define what success looks like. Write one clear sentence.',
      primaryVerb: 'Identify',
      deliverable: 'A single-sentence outcome statement',
    },
    { 
      title: 'Sketch the shape of the first draft',
      decomposition: 'Plan the structure. Outline the main sections.',
      primaryVerb: 'Design',
      deliverable: 'A rough outline or structure',
    },
    { 
      title: 'Write the opening section',
      decomposition: 'Start with the introduction. Set the tone and context.',
      primaryVerb: 'Create',
      deliverable: 'A complete opening section',
    },
    { 
      title: 'Review and refine',
      decomposition: 'Check for clarity. Tighten language and flow.',
      primaryVerb: 'Refine',
      deliverable: 'Polished and coherent content',
    },
    { 
      title: 'Share for feedback',
      decomposition: 'Get outside perspective. Incorporate suggestions.',
      primaryVerb: 'Gather',
      deliverable: 'Feedback notes and action items',
    },
  ];

  const sessionMetadata = task.sessionMetadata;
  const priorityTag = sessionMetadata?.intentPriority || 'Medium';

  return (
    <div className="panel">
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
        <div>
          <h2 className="page-title" style={{ textAlign: 'left', marginBottom: 8 }}>Your Roadmap</h2>
          <p className="screen-subtitle">
            {task.title || 'Your focus'} — {steps.length} steps, one at a time.
          </p>
        </div>
        <div style={{ 
          padding: '8px 16px', 
          backgroundColor: getPriorityColor(priorityTag), 
          color: 'white', 
          borderRadius: '6px',
          fontWeight: '600',
          fontSize: '14px'
        }}>
          {priorityTag}
        </div>
      </div>
      
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 36 }}>
        {steps.map((s, i) => (
          <div key={i} className={`step-card ${i === 0 ? 'active' : ''}`}>
            <div className="step-card-num">{i + 1}</div>
            <div style={{ flex: 1 }}>
              <div className="step-card-sub">Step {i + 1} of {steps.length}</div>
              <div className="step-card-title">{s.title}</div>
              {s.decomposition && (
                <p style={{ fontSize: '13px', color: '#666', marginTop: '6px' }}>
                  {s.decomposition}
                </p>
              )}
              {s.primaryVerb && (
                <div style={{ fontSize: '12px', color: '#888', marginTop: '6px' }}>
                  <strong>Action:</strong> {s.primaryVerb}
                  {s.deliverable && ` • Deliverable: ${s.deliverable}`}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
      <div style={{ display: 'flex', justifyContent: 'center' }}>
        <Button className="btn-lg" onClick={async () => {
          try {
            if (steps.length > 0 && task.id) {
              // Start the first step
              if (steps[0].id) {
                await stepApi.startStep(steps[0]);
              }
              // Initialize focus session
              await focusSessionApi.startSession(task.id, steps[0].id || 'temp-id');
            }
          } catch (e) {
            console.error('Failed to start step or initialize focus session', e);
          }
          onStart(steps);
        }}>Start work</Button>
      </div>
    </div>
  );
}

function getPriorityColor(priority: string): string {
  switch (priority) {
    case 'High':
      return '#ef4444'; // Red
    case 'Medium':
      return '#f59e0b'; // Amber
    case 'Low':
      return '#10b981'; // Emerald
    default:
      return '#6b7280'; // Gray
  }
}
