/**
 * Task Interface
 * Represents a task with multiple steps
 */

import { Step } from './step';
import { SessionMetadata } from './session';

export interface Task {
  id: string;              // Maps to Guid Id
  title: string;           // Maps to string Title
  description: string;     // Maps to string Description
  isoDate: string;         // Maps to DateTime IsoDate (Date only "YYYY-MM-DD")
  timeLabel: string;       // Maps to string TimeLabel
  dateLabel?: string;      // Optional display string
  isCompleted: boolean;    // Maps to bool IsCompleted
  totalSteps?: number;
  totalStepsCompleted?: number;
  createdAt?: string;
  steps: Step[];           // Navigation property: ICollection<Step> Steps
  defaultOpen?: boolean;   // UI only state flag, could map to a UserPreference
  sessionMetadata?: SessionMetadata;  // Session metadata with priority and timing info
}
