import { Objective, KeyResult, ProgressUpdate, Comment, OkrFilter, ApiResponse } from '../types';
import apiClient from './client';

export interface CreateObjectiveRequest {
  title: string;
  description?: string;
  type: 'personal' | 'team';
  year: number;
  quarter: 1 | 2 | 3 | 4;
  startDate: string;
  endDate: string;
  teamId?: string;
  parentObjectiveId?: string;
  keyResults: Array<{
    title: string;
    type: 'numeric' | 'percentage' | 'boolean' | 'currency';
    targetValue: number;
    currentValue?: number;
    unit?: string;
    status?: 'on_track' | 'at_risk' | 'behind' | 'completed';
    ownerId: string;
    startDate: string;
    endDate: string;
  }>;
}

export interface UpdateProgressRequest {
  value: number;
  note?: string;
}

export const okrApi = {
  // Objectives
  getObjectives: async (filter?: OkrFilter): Promise<ApiResponse<Objective[]>> => {
    return apiClient.get<ApiResponse<Objective[]>>('/objectives', filter as Record<string, string>);
  },

  getObjective: async (id: string): Promise<ApiResponse<Objective>> => {
    return apiClient.get<ApiResponse<Objective>>(`/objectives/${id}`);
  },

  createObjective: async (data: CreateObjectiveRequest): Promise<ApiResponse<Objective>> => {
    return apiClient.post<ApiResponse<Objective>>('/objectives', data);
  },

  updateObjective: async (id: string, data: Partial<Objective>): Promise<ApiResponse<Objective>> => {
    return apiClient.patch<ApiResponse<Objective>>(`/objectives/${id}`, data);
  },

  deleteObjective: async (id: string): Promise<void> => {
    await apiClient.delete(`/objectives/${id}`);
  },

  // Key Results
  getKeyResults: async (objectiveId: string): Promise<ApiResponse<KeyResult[]>> => {
    return apiClient.get<ApiResponse<KeyResult[]>>(`/objectives/${objectiveId}/key-results`);
  },

  createKeyResult: async (objectiveId: string, data: Omit<KeyResult, 'id' | 'objectiveId' | 'createdAt' | 'updatedAt' | 'progressUpdates'>): Promise<ApiResponse<KeyResult>> => {
    return apiClient.post<ApiResponse<KeyResult>>(`/objectives/${objectiveId}/key-results`, data);
  },

  updateKeyResult: async (id: string, data: Partial<KeyResult>): Promise<ApiResponse<KeyResult>> => {
    return apiClient.patch<ApiResponse<KeyResult>>(`/key-results/${id}`, data);
  },

  deleteKeyResult: async (id: string): Promise<void> => {
    await apiClient.delete(`/key-results/${id}`);
  },

  // Progress Updates
  updateProgress: async (keyResultId: string, data: UpdateProgressRequest): Promise<ApiResponse<ProgressUpdate>> => {
    return apiClient.post<ApiResponse<ProgressUpdate>>(`/key-results/${keyResultId}/progress`, data);
  },

  getProgressHistory: async (keyResultId: string): Promise<ApiResponse<ProgressUpdate[]>> => {
    return apiClient.get<ApiResponse<ProgressUpdate[]>>(`/key-results/${keyResultId}/progress`);
  },

  // Comments
  getComments: async (objectiveId: string): Promise<ApiResponse<Comment[]>> => {
    return apiClient.get<ApiResponse<Comment[]>>(`/objectives/${objectiveId}/comments`);
  },

  createComment: async (objectiveId: string, data: { content: string; keyResultId?: string; mentions?: string[] }): Promise<ApiResponse<Comment>> => {
    return apiClient.post<ApiResponse<Comment>>(`/objectives/${objectiveId}/comments`, data);
  },

  deleteComment: async (id: string): Promise<void> => {
    await apiClient.delete(`/comments/${id}`);
  },
};
