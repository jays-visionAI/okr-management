import { Team, User, ApiResponse } from '../types';
import apiClient from './client';

export interface CreateTeamRequest {
  name: string;
  description?: string;
}

export const teamApi = {
  getTeams: async (): Promise<ApiResponse<Team[]>> => {
    return apiClient.get<ApiResponse<Team[]>>('/teams');
  },

  getTeam: async (id: string): Promise<ApiResponse<Team>> => {
    return apiClient.get<ApiResponse<Team>>(`/teams/${id}`);
  },

  createTeam: async (data: CreateTeamRequest): Promise<ApiResponse<Team>> => {
    return apiClient.post<ApiResponse<Team>>('/teams', data);
  },

  updateTeam: async (id: string, data: Partial<Team>): Promise<ApiResponse<Team>> => {
    return apiClient.patch<ApiResponse<Team>>(`/teams/${id}`, data);
  },

  deleteTeam: async (id: string): Promise<void> => {
    await apiClient.delete(`/teams/${id}`);
  },

  addTeamMember: async (teamId: string, userId: string): Promise<ApiResponse<Team>> => {
    return apiClient.post<ApiResponse<Team>>(`/teams/${teamId}/members`, { userId });
  },

  removeTeamMember: async (teamId: string, userId: string): Promise<void> => {
    await apiClient.delete(`/teams/${teamId}/members/${userId}`);
  },

  getTeamMembers: async (teamId: string): Promise<ApiResponse<User[]>> => {
    return apiClient.get<ApiResponse<User[]>>(`/teams/${teamId}/members`);
  },
};
