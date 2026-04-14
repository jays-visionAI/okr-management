// User Entity
export interface User {
  id: string;
  email: string;
  name: string;
  department: string;
  role: 'admin' | 'manager' | 'member';
  avatar?: string;
  teamId?: string;
  createdAt: string;
  updatedAt: string;
}

// Team Entity
export interface Team {
  id: string;
  name: string;
  description?: string;
  leaderId: string;
  memberIds: string[];
  createdAt: string;
  updatedAt: string;
}

// Objective Entity
export interface Objective {
  id: string;
  title: string;
  description?: string;
  type: 'personal' | 'team';
  year: number;
  quarter: 1 | 2 | 3 | 4;
  status: 'draft' | 'active' | 'completed' | 'cancelled';
  ownerId: string;
  teamId?: string;
  parentObjectiveId?: string;
  progress: number;
  startDate: string;
  endDate: string;
  createdAt: string;
  updatedAt: string;
  keyResults?: KeyResult[];
}

// KeyResult Entity
export interface KeyResult {
  id: string;
  objectiveId: string;
  title: string;
  type: 'numeric' | 'percentage' | 'boolean' | 'currency';
  targetValue: number;
  currentValue: number;
  unit?: string;
  status: 'on_track' | 'at_risk' | 'behind' | 'completed';
  ownerId: string;
  startDate: string;
  endDate: string;
  createdAt: string;
  updatedAt: string;
  progressUpdates?: ProgressUpdate[];
}

// ProgressUpdate Entity
export interface ProgressUpdate {
  id: string;
  keyResultId: string;
  userId: string;
  value: number;
  note?: string;
  createdAt: string;
}

// Comment Entity
export interface Comment {
  id: string;
  objectiveId: string;
  keyResultId?: string;
  userId: string;
  content: string;
  mentions: string[];
  createdAt: string;
  updatedAt: string;
  user?: User;
}

// Notification Entity
export interface Notification {
  id: string;
  userId: string;
  type: 'progress_update' | 'comment' | 'mention' | 'assignment' | 'deadline';
  title: string;
  message: string;
  isRead: boolean;
  relatedId?: string;
  createdAt: string;
}

// API Response Types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: unknown[];
  };
  meta?: {
    page?: number;
    pageSize?: number;
    total?: number;
    totalPages?: number;
  };
}

// Dashboard Types
export interface DashboardStats {
  totalObjectives: number;
  completedObjectives: number;
  activeObjectives: number;
  overallProgress: number;
  teamProgress: number;
  personalProgress: number;
  quarterlyTrend: { quarter: string; progress: number }[];
  topPerformers: { name: string; progress: number }[];
}

// Filter Types
export interface OkrFilter {
  type?: 'personal' | 'team';
  status?: Objective['status'];
  quarter?: number;
  year?: number;
  teamId?: string;
  ownerId?: string;
}
