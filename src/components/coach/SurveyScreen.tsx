import './SurveyScreen.css';
import React, { useState, useEffect, useRef } from 'react';
import { Button } from '../ui/button';
import { surveyApi } from '../../lib/api';

export function SurveyGateway({ onStart }: { onStart: () => void }) {
  return (
    <div className="focus-stage">
      <div className="focus-card">
        <h2 className="wisdom">Step complete.<br />Let's check in.</h2>
        <p className="wisdom-sub">Four questions. Four seconds each. Let's check your energy before the next step.</p>
        <Button className="btn-lg" onClick={onStart}>
          Start 16-second survey
        </Button>
      </div>
    </div>
  );
}

export function SurveyScreen({ stepId = "", onDone }: { stepId?: string; onDone: (answers: number[]) => void }) {
  const questions = [
    'How would you rate your enthusiasm right now?',
    'How would you rate your fatigue?',
    'How would you rate your anxiety?',
    'How would you rate your distraction?',
  ];
  const [idx, setIdx] = useState(0);
  const [answers, setAnswers] = useState<number[]>([]);
  const [selected, setSelected] = useState<number | null>(null);
  const [phase, setPhase] = useState<'in' | 'out'>('in');
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    setPhase('in');
    setSelected(null);
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => advance(null), 4000);
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [idx]);

  function advance(val: number | null) {
    if (timerRef.current) clearTimeout(timerRef.current);
    setSelected(val);
    setPhase('out');
    setTimeout(async () => {
      const next = [...answers, val ?? 3]; // Default to 3 if skipped
      setAnswers(next);
      if (idx < questions.length - 1) {
        setIdx(idx + 1);
      } else {
        onDone(next);
      }
    }, 280);
  }

  return (
    <div className="focus-stage">
      <div className="focus-card">
        <div
          className="survey-card"
          style={{
            transition: 'transform 450ms var(--ease-out), opacity 450ms var(--ease-out)',
            transform: phase === 'out' ? 'translateX(-32px)' : 'translateX(0)',
            opacity: phase === 'out' ? 0 : 1,
          }}
          key={idx}
        >
          <div className="survey-meta">QUESTION {idx + 1} OF {questions.length}</div>
          <div className="survey-progress"><div className="survey-progress-fill" key={`p-${idx}`} /></div>
          <h2 className="survey-question">{questions[idx]}</h2>
          <div className="survey-scale">
            {[1, 2, 3, 4, 5].map((n) => (
              <button
                key={n}
                className={`survey-dot ${selected === n ? 'selected' : ''}`}
                onClick={() => advance(n)}
              >
                {n}
              </button>
            ))}
          </div>
          <div className="survey-scale-labels">
            <span>Low</span><span /><span /><span /><span>High</span>
          </div>
        </div>
      </div>
    </div>
  );
}
