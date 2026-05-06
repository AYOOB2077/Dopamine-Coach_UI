/**
 * Backend API Response Types
 * These represent the snake_case responses from the .NET backend
 * They map to the camelCase interfaces in other files
 */

// --- Authentication Types ---
export interface AuthResponseDto {
  success: boolean;
  message: string;
  token?: string;
  user?: UserInfoDto;
}

export interface UserInfoDto {
  id: string;
  email: string;
  userName?: string;
}

export interface LoginRequestDto {
  email: string;
  password: string;
}

export interface SignupRequestDto {
  email: string;
  password: string;
  passwordConfirm: string;
  fullName?: string;
}

// --- Task Types ---
export interface TaskItemResponseDto {
  id: string;
  userId: string;
  title: string;
  description: string;
  status: number; // TaskStatus enum: 0=Pending, 1=InProgress, 2=Complete
  totalStepsCompleted: number;
  totalSteps: number;
  taskLevel: number; // TaskLevel enum: 0=Low, 1=Medium, 2=High
  totalTimeForSteps: number;
  createdAt: string;
}

export interface CreateTaskItemDto {
  title: string;
  description: string;
  priority?: string;
}

// --- Step Types ---
export interface StepResponseDto {
  id: string;
  taskId: string;
  stepOrder: number;
  stepTitle: string;
  stepDescription: string;
  deliverable?: string;
  estimatedTime: number;
  primaryVerb?: string;
  noveltyHook?: string;
  passionAnchor?: string;
  urgencyCue?: string;
  incupTag?: number; // IncupTag enum: 1=Interest, 2=Novelty, 3=Challenge, 4=Urgency, 5=Passion
  status: number; // TaskStatus enum
  createdAt: string;
  startedAt?: string;
  completedAt?: string;
}

export interface CreateStepDto {
  taskId: string;
  stepOrder: number;
  stepTitle: string;
  stepDescription: string;
  estimatedTime: number;
}

// --- StepFeel/Survey Types ---
export interface StepFeelResponseDto {
  id: string;
  stepId: string;
  scoreEnthusiasm: number;
  scoreFatigue: number;
  scoreAnxiety: number;
  scoreDistraction: number;
  loggedAt: string;
  strategicAdvices?: StrategicAdviceDto[];
}

export interface CreateStepFeelDto {
  stepId: string;
  scoreEnthusiasm: number;
  scoreFatigue: number;
  scoreAnxiety: number;
  scoreDistraction: number;
}

export interface StrategicAdviceDto {
  id: string;
  stepFeelsId: string;
  diagnosis: string;
  howToConsumeTasks: string;
  externalBehavior: string;
  mode: string;
  reminder: string;
  createdAt: string;
}

// --- Enums ---
export enum TaskStatus {
  Pending = 0,
  InProgress = 1,
  Complete = 2,
}

export enum IncupTag {
  Interest = 1,
  Novelty = 2,
  Challenge = 3,
  Urgency = 4,
  Passion = 5,
}

export enum TaskLevel {
  Low = 0,
  Medium = 1,
  High = 2,
}

// --- Legacy Types (for backward compatibility) ---
export interface BackendSessionMetadata {
  intent_priority: 'High' | 'Medium' | 'Low';
  estimated_total_session_time: number;
  total_tasks: number;
}

export interface BackendTask {
  task_id: string;
  step_title: string;
  decomposition: string;
  estimated_time: number;
  primary_verb: string;
  deliverable: string;
  novelty_hook: string;
  passion_anchor: string;
  urgency_cue: string;
  incup_tags: string[];
}

export interface BackendRoadmapResponse {
  session_metadata: BackendSessionMetadata;
  tasks: BackendTask[];
}
