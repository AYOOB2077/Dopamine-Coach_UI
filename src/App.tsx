import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';
import { Shell } from './components/layout/Shell';
import {
  CoachScreen,
  GeneratingScreen,
  RoadmapScreen,
  FocusScreen,
  RestScreen,
  SurveyGateway,
  SurveyScreen,
  RecoveryScreen,
} from './components/coach';
import { OngoingTab } from './components/tabs/OngoingTab';
import { UpcomingTab } from './components/tabs/UpcomingTab';
import { FinishedTab } from './components/tabs/FinishedTab';
import { LoginScreen } from './components/auth/LoginScreen';
import { SignupScreen } from './components/auth/SignupScreen';
import { SetupScreen } from './components/auth/SetupScreen';
import { SettingsScreen } from './components/user/SettingsScreen';
import { Task, Step, BackendRoadmapResponse } from './types/models';

import { taskApi, stepApi } from './lib/api';

export default function App() {
  const navigate = useNavigate();
  const location = useLocation();

  // Determine active tab from URL path
  const pathPart = location.pathname.split('/')[1] || 'coach';
  const tab = ['coach', 'ongoing', 'upcoming', 'finished'].includes(pathPart) ? pathPart : 'coach';

  const [darkMode, setDarkMode] = useState(false);
  
  // Track auth status. In a real app, this would check tokens initially.
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    return !!localStorage.getItem('auth_token');
  });

  const [task, setTask] = useState<Partial<Task> | null>(null);
  const [steps, setSteps] = useState<Partial<Step>[]>([]);
  const [stepIdx, setStepIdx] = useState(0);
  const [answers, setAnswers] = useState<number[]>([]);
  const [skipInterruption, setSkipInterruption] = useState(false);

  const focusMode = location.pathname.includes('/coach/') && 
    ['focus', 'rest', 'gateway', 'survey', 'recovery'].some(p => location.pathname.includes(p));

  const handleGo = async ({ title, body }: { title: string; body: string }) => {
    try {
      const userId = localStorage.getItem('user_id');
      if (!userId) {
        console.error('User not logged in or missing user_id');
        return;
      }

      // Show waiting screen while generating
      navigate('/coach/generating');

      // Create the AI task which includes steps generation
      const taskRes = await taskApi.createTaskWithStepsFromAi(userId, { 
        title, 
        description: body,
        userInput: body
      });
      const createdTask = taskRes.data;

      // Now fetch the steps for this task
      const stepsRes = await stepApi.getStepsByTaskId(createdTask.id);
      const backendSteps = stepsRes.data;

      // Convert backend steps (StepResponseDto) to frontend Step
      const steps: Partial<Step>[] = backendSteps.map((step: any) => ({
        id: step.id,
        title: step.stepTitle,
        stepTitle: step.stepTitle,
        decomposition: step.stepDescription,
        estimatedTime: step.estimatedTime,
        primaryVerb: step.primaryVerb,
        deliverable: step.deliverable,
        noveltyHook: step.noveltyHook,
        passionAnchor: step.passionAnchor,
        urgencyCue: step.urgencyCue,
        incupTags: step.incupTag ? [step.incupTag.toString()] : [],
        isCompleted: step.status === 2,
        orderIndex: step.stepOrder
      }));

      // Set task with steps
      setTask({
        id: createdTask.id,
        title: createdTask.title,
        description: createdTask.description,
        steps: steps as Step[],
      });
      
      setSteps(steps);
      setStepIdx(0);
      
      // Navigate to roadmap view
      navigate('/coach/roadmap');
    } catch (error) {
      console.error('Error generating roadmap:', error);
      // Fallback to home coach view on error
      navigate('/coach');
    }
  };

  const handleStart = (r: Partial<Step>[]) => {
    setSteps(r);
    setStepIdx(0);
    navigate('/coach/focus');
  };

  // Step complete → skip gateway if hyperfocus was used, otherwise go to survey
  const completeStep = () => {
    if (skipInterruption) {
      setSkipInterruption(false);
      if (stepIdx + 1 >= steps.length) {
        setTask(null);
        setStepIdx(0);
        navigate('/coach');
      } else {
        setStepIdx(prev => prev + 1);
        navigate('/coach/focus');
      }
    } else {
      navigate('/coach/gateway');
    }
  };
  const restDone = () => navigate('/coach/recovery');

  const startSurvey = () => {
    setAnswers([]);
    navigate('/coach/survey');
  };

  const surveyDone = (a: number[]) => {
    setAnswers(a);
    navigate('/coach/rest');
  };

  const afterRecovery = () => {
    if (stepIdx + 1 >= steps.length) {
      setTask(null);
      setStepIdx(0);
      navigate('/coach');
    } else {
      setStepIdx(stepIdx + 1);
      navigate('/coach/focus');
    }
  };
  const endSession = () => {
    setTask(null);
    setStepIdx(0);
    navigate('/coach');
  };

  const handleHyperFocus = () => {
    setSkipInterruption(true);
  };

  // --- Auth Pages Routing ---
  if (!isAuthenticated && ['/login', '/signup', '/setup'].includes(location.pathname)) {
    return (
      <Routes>
        <Route path="/login" element={
          <LoginScreen 
            onLogin={() => { 
              setIsAuthenticated(true); 
              localStorage.setItem('auth_token', 'logged_in');
              navigate('/coach'); 
            }}
            onSignUp={() => navigate('/signup')}
            onGoogleSignIn={() => navigate('/setup')}
          />
        } />
        <Route path="/signup" element={
          <SignupScreen 
            onSignUpSuccess={() => navigate('/setup')} 
            onLoginClick={() => navigate('/login')} 
            onGoogleSignIn={() => navigate('/setup')}
          />
        } />
        <Route path="/setup" element={
          <SetupScreen 
            onSetupComplete={() => { 
              setIsAuthenticated(true); 
              localStorage.setItem('auth_token', 'setup_complete');
              navigate('/coach'); 
            }}
          />
        } />
      </Routes>
    );
  }

  // Enforce authentication
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // --- Main Authenticated App Routing ---
  return (
    <Shell tab={tab} onTab={() => {}} focusMode={focusMode} darkMode={darkMode} onToggleDark={() => setDarkMode(d => !d)}>
      <Routes>
        <Route path="/" element={<Navigate to="/coach" replace />} />
        
        {/* Coach Screen Routes */}
        <Route path="/coach" element={<CoachScreen onGo={handleGo} />} />
        <Route path="/coach/generating" element={<GeneratingScreen />} />
        <Route path="/coach/roadmap" element={
          task ? <RoadmapScreen task={task} onStart={handleStart} /> : <Navigate to="/coach" replace />
        } />
        <Route path="/coach/focus" element={
          steps.length > 0 ? (
            <FocusScreen
              stepTitle={steps[stepIdx]?.title || 'Focus'}
              step={steps[stepIdx]}
              onHyperFocus={handleHyperFocus}
              isHyperFocusActive={skipInterruption}
              onHyperFocusDeactivate={() => setSkipInterruption(false)}
              onComplete={completeStep}
              onEnd={endSession}
              onRestart={() => navigate('/coach/focus')}
              onAddTime={() => {}}
            />
          ) : <Navigate to="/coach" replace />
        } />
        <Route path="/coach/gateway" element={<SurveyGateway onStart={startSurvey} />} />
        <Route path="/coach/survey" element={<SurveyScreen onDone={surveyDone} />} />
        <Route path="/coach/rest" element={<RestScreen onDone={restDone} />} />
        <Route path="/coach/recovery" element={
          steps.length > 0 ? (
            <RecoveryScreen
              answers={answers}
              onContinue={afterRecovery}
              isLast={stepIdx + 1 >= steps.length}
            />
          ) : <Navigate to="/coach" replace />
        } />

        {/* Tab Routes */}
        <Route path="/ongoing" element={
          <OngoingTab
            onStartWork={(t, startIdx) => {
              navigate('/coach');
              setTask({ title: t.title, description: t.description });
              setSteps(t.steps || []);
              setStepIdx(Math.max(0, startIdx));
              navigate('/coach/focus');
            }}
          />
        } />

        <Route path="/upcoming" element={
          <UpcomingTab
            onLaunchTask={(t) => {
              handleGo({ title: t.title || '', body: t.description || '' });
            }}
          />
        } />

        <Route path="/finished" element={<FinishedTab />} />

        {/* Global Routes */}
        <Route path="/settings" element={<SettingsScreen />} />
        
        <Route path="*" element={<Navigate to="/coach" replace />} />
      </Routes>
    </Shell>
  );
}
