import './FocusScreen.css';
import React, { useRef, useState } from 'react';
import { Hourglass, HourglassHandle } from '../shared/Icons';
import { Step } from '../../types/models';
import { focusSessionApi, stepApi } from '../../lib/api';

export function FocusScreen({
  stepTitle,
  step,
  onComplete,
  onEnd,
  onRestart,
  onAddTime,
  onHyperFocus,
  isHyperFocusActive,
  onHyperFocusDeactivate
}: {
  stepTitle: string;
  step?: Partial<Step>;
  onComplete: () => void;
  onEnd: () => void;
  onRestart: () => void;
  onAddTime: () => void;
  onHyperFocus: () => void;
  isHyperFocusActive: boolean;
  onHyperFocusDeactivate: () => void;
}) {
  const hourglassRef = useRef<HourglassHandle>(null);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [showDeactivateOverlay, setShowDeactivateOverlay] = useState(false);
  const [holdProgress, setHoldProgress] = useState(0);
  const holdIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const showToastMessage = (msg: string) => {
    setToastMessage(msg);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 2000);
  };

  const startHold = () => {
    let progress = 0;
    holdIntervalRef.current = setInterval(() => {
      progress += 100 / 30;
      setHoldProgress(progress);
      if (progress >= 100) {
        clearInterval(holdIntervalRef.current!);
        setShowDeactivateOverlay(false);
        setHoldProgress(0);
        onHyperFocusDeactivate();
        showToastMessage('Focus mode disabled');
      }
    }, 100);
  };

  const stopHold = () => {
    if (holdIntervalRef.current) {
      clearInterval(holdIntervalRef.current);
      holdIntervalRef.current = null;
    }
    setHoldProgress(0);
  };


  return (
    <div className="focus-stage focus-stage-bare">
      <div className="focus-center">
        <h2 className="focus-step-title">{stepTitle}</h2>
        {step?.primaryVerb && (
          <p style={{ fontSize: '14px', color: '#666', marginTop: '8px' }}>
            <strong>{step.primaryVerb}</strong> {step.deliverable ? `→ ${step.deliverable}` : ''}
          </p>
        )}
        {step?.decomposition && (
          <p style={{ fontSize: '13px', color: '#888', marginTop: '12px', maxWidth: '300px', lineHeight: '1.5' }}>
            {step.decomposition}
          </p>
        )}
        {step?.passionAnchor && (
          <p style={{ fontSize: '12px', color: '#999', marginTop: '12px', fontStyle: 'italic', maxWidth: '300px' }}>
            "{step.passionAnchor}"
          </p>
        )}
        {step?.incupTags && step.incupTags.length > 0 && (
          <div style={{ display: 'flex', gap: '6px', marginTop: '12px', flexWrap: 'wrap', justifyContent: 'center' }}>
            {step.incupTags.map((tag, i) => (
              <span
                key={i}
                style={{
                  fontSize: '11px',
                  backgroundColor: '#e5e7eb',
                  color: '#374151',
                  padding: '4px 8px',
                  borderRadius: '4px'
                }}
              >
                {tag}
              </span>
            ))}
          </div>
        )}
        <Hourglass
          key={step?.id || 'default'}
          ref={hourglassRef}
          duration={(step?.estimatedTime || 25) * 60}
          onTimeUp={onComplete}
        />
      </div>
      <div className="focus-pad" role="toolbar" aria-label="Focus controls">
        <button className="focus-sq focus-sq-add" onClick={() => { hourglassRef.current?.addTime(); onAddTime(); }} title="Add time" aria-label="Add time">
          <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="13" r="8" /><path d="M12 9v4l2.5 1.5" /><path d="M9 3h6" /><path d="M12 3v2" />
          </svg>
        </button>
        <button className="focus-sq focus-sq-restart" onClick={() => { hourglassRef.current?.restart(); onRestart(); }} title="Restart step" aria-label="Restart step">
          <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M3 12a9 9 0 1 0 2.64-6.36" /><path d="M3 4v5h5" />
          </svg>
        </button>
        <button className="focus-sq focus-sq-end" onClick={async () => {
          try {
            // Provide a real or derived sessionId from context if available
            await focusSessionApi.endSession('session-id-placeholder');
          } catch (e) {
            console.error('Failed to end focus session', e);
          }
          onEnd();
        }} title="End session" aria-label="End session">
          <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor" stroke="none">
            <rect x="6" y="6" width="12" height="12" rx="1.5" />
          </svg>
        </button>
        <button className="focus-sq focus-sq-complete" onClick={async () => {
          try {
            if (step && step.id) {
              await stepApi.completeStep(step);
            }
          } catch (e) {
            console.error('Failed to mark step complete', e);
          }
          hourglassRef.current?.drain(); // drain() calls onComplete internally after 600ms
        }} title="Complete step" aria-label="Complete step">
          <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M5 12.5l4.5 4.5L19 7.5" />
          </svg>
        </button>
        <button
          className="focus-sq focus-sq-hyper"
          onClick={() => {
            if (isHyperFocusActive) {
              setShowDeactivateOverlay(true);
            } else {
              onHyperFocus();
              showToastMessage('Hyper Focus mode has been activated 🔥');
            }
          }}
          title="HyperFocus"
          aria-label="HyperFocus — skip to next step"
        >
          <img
            src="https://media.giphy.com/media/l2JhLp5e3TQrvbZOU/giphy.gif"
            alt=""
            style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '12px' }}
          />
        </button>
      </div>
      {showDeactivateOverlay && (
        <div className="hf-overlay">
          <div className="hf-overlay-card">
            <div className="hf-overlay-emoji">🔥</div>
            <h3 className="hf-overlay-title">You're in the zone!</h3>
            <p className="hf-overlay-desc">Are you sure you want to interrupt your focus?</p>
            <div className="hf-hold-bar-wrap">
              <div className="hf-hold-bar-fill" style={{ width: `${holdProgress}%` }}/>
            </div>
            <button
              className="hf-hold-btn"
              onMouseDown={startHold}
              onMouseUp={stopHold}
              onMouseLeave={stopHold}
              onTouchStart={startHold}
              onTouchEnd={stopHold}
            >
              Hold to disable
            </button>
            <button className="hf-cancel-btn" onClick={() => {
              setShowDeactivateOverlay(false);
              setHoldProgress(0);
            }}>
              Keep focusing
            </button>
          </div>
        </div>
      )}
      {showToast && (
        <div className="mini-toast">
          <span className="mini-toast-icon">🔥</span>
          {toastMessage}
        </div>
      )}
    </div>
  );
}
