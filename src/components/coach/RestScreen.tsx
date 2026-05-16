import './RestScreen.css';
import React, { useState, useEffect, useRef } from 'react';
import { surveyApi } from '../../lib/api';

export interface RestAdvice {
  Diagnosis: string;
  HowToConsumeTasks: string;
  ExternalBehavior: string;
}

// Countdown ring constants
const RADIUS = 42;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

interface RestScreenProps {
  stepId?: string;
  answers?: number[];
  estimatedTime?: number;
  onDone: () => void;
}

export function RestScreen({ stepId = "", answers = [], estimatedTime = 10, onDone }: RestScreenProps) {
  const [advice, setAdvice] = useState<RestAdvice | null>(null);
  const [secondsLeft, setSecondsLeft] = useState<number | null>(null);
  const [totalRestTime, setTotalRestTime] = useState<number | null>(null);
  const [isGenerating, setIsGenerating] = useState(true);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    // 25% of estimated time (converted to seconds)
    const totalSecs = Math.floor(estimatedTime * 60 * 0.25);
    const finalSecs = totalSecs > 15 ? totalSecs : 15; // At least 15 seconds
    
    setTotalRestTime(finalSecs);
    setSecondsLeft(finalSecs);

    const fetchAdvice = async () => {
      try {
        const response = await fetch('http://localhost:5293/api/StepFeels', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            stepId: stepId,
            scoreEnthusiasm: answers[0] ?? 3,
            scoreFatigue: answers[1] ?? 3,
            scoreAnxiety: answers[2] ?? 3,
            scoreDistraction: answers[3] ?? 3
          })
        });
        const data = await response.json();
        
        // Extract the first advice from the strategicAdvices array, if it exists
        const adviceList = data.strategicAdvices || data.StrategicAdvices || [];
        const firstAdvice = adviceList.length > 0 ? adviceList[0] : null;

        if (firstAdvice) {
          setAdvice({
            Diagnosis: firstAdvice.diagnosis || firstAdvice.Diagnosis,
            HowToConsumeTasks: firstAdvice.howToConsumeTasks || firstAdvice.HowToConsumeTasks,
            ExternalBehavior: firstAdvice.externalBehavior || firstAdvice.ExternalBehavior,
          });
        } else {
          // Fallback if the top-level object directly has them (just in case)
          setAdvice({
            Diagnosis: data.diagnosis || data.Diagnosis || 'No diagnosis available.',
            HowToConsumeTasks: data.howToConsumeTasks || data.HowToConsumeTasks || 'No strategy available.',
            ExternalBehavior: data.externalBehavior || data.ExternalBehavior || 'No baseline adjustment available.',
          });
        }
      } catch (e) {
        console.error('Failed to submit survey / fetch advice', e);
      } finally {
        setIsGenerating(false);
      }
    };

    fetchAdvice();
  }, [stepId, answers, estimatedTime]);

  useEffect(() => {
    if (totalRestTime === null) return;

    intervalRef.current = setInterval(() => {
      setSecondsLeft((s) => {
        if (s !== null && s <= 1) {
          clearInterval(intervalRef.current!);
          surveyApi.completeRest('placeholder-session-id').catch((e: any) => 
            console.error('Failed to report rest completion', e)
          );
          onDone();
          return 0;
        }
        return s !== null ? s - 1 : 0;
      });
    }, 1000);
    return () => clearInterval(intervalRef.current!);
  }, [totalRestTime, onDone]);

  if (totalRestTime === null || secondsLeft === null) return <div className="focus-stage" />;

  const progress = secondsLeft / totalRestTime; // 1 → 0
  const dashOffset = CIRCUMFERENCE * (1 - progress);
  const percentElapsed = 1 - progress;

  const mins = Math.floor(secondsLeft / 60);
  const secs = secondsLeft % 60;
  
  let timerColor = 'turquoise';
  let showNumbers = false;

  if (percentElapsed >= 0.5 && percentElapsed < 0.75) {
    timerColor = 'yellow';
    showNumbers = true;
  } else if (percentElapsed >= 0.75) {
    timerColor = '#ff4d4d'; // Soft red
    showNumbers = true;
  }

  const timeLabel = showNumbers 
    ? (mins > 0 ? `${mins}:${String(secs).padStart(2, '0')}` : `${secs}`) 
    : '';

  return (
    <div className="rest-stage">
      <div className="rest-card" style={{ maxWidth: '600px', width: '100%' }}>
        {/* Pulsing leaf icon */}
        <div className="rest-icon" aria-hidden="true">
          <svg viewBox="0 0 32 32" width="40" height="40" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M16 28C16 28 6 22 6 13a10 10 0 0 1 20 0c0 9-10 15-10 15z" fill="rgba(255,255,255,0.25)" />
            <line x1="16" y1="28" x2="16" y2="14" />
          </svg>
        </div>

        {/* Countdown ring */}
        <div className="rest-timer-wrap" aria-label={`${timeLabel} remaining`} style={{ marginBottom: '2rem' }}>
          <svg className="rest-timer-svg" viewBox="0 0 100 100">
            <circle className="rest-timer-track" cx="50" cy="50" r={RADIUS} />
            <circle
              className="rest-timer-fill"
              cx="50"
              cy="50"
              r={RADIUS}
              strokeDasharray={CIRCUMFERENCE}
              strokeDashoffset={dashOffset}
              style={{ stroke: timerColor, transition: 'stroke 0.5s ease-in-out' }}
            />
          </svg>
          <div className="rest-timer-label" style={{ color: timerColor }}>{timeLabel}</div>
        </div>

        {/* Advice Area */}
        <div style={{ textAlign: 'left', minHeight: '200px' }}>
          {isGenerating ? (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', opacity: 0.8 }}>
              <div className="login-spinner" style={{ marginBottom: '1rem', width: '30px', height: '30px' }} />
              <p>Analyzing your metrics and generating advice...</p>
            </div>
          ) : advice ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <strong style={{ opacity: 0.6, fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Diagnosis</strong>
                <p style={{ marginTop: '0.2rem', fontSize: '1rem', lineHeight: '1.4' }}>{advice.Diagnosis}</p>
              </div>
              <div>
                <strong style={{ opacity: 0.6, fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Next Steps Strategy</strong>
                <p style={{ marginTop: '0.2rem', fontSize: '1rem', lineHeight: '1.4' }}>{advice.HowToConsumeTasks}</p>
              </div>
              <div>
                <strong style={{ opacity: 0.6, fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Adjusting Baseline</strong>
                <p style={{ marginTop: '0.2rem', fontSize: '1rem', lineHeight: '1.4' }}>{advice.ExternalBehavior}</p>
              </div>
            </div>
          ) : (
            <p>Could not load advice for this session.</p>
          )}
        </div>

        {/* Skip */}
        <button
          className="rest-skip"
          onClick={() => {
            clearInterval(intervalRef.current!);
            onDone();
          }}
          aria-label="Skip rest and continue"
          style={{ marginTop: '2rem' }}
        >
          Skip rest →
        </button>
      </div>
    </div>
  );
}
