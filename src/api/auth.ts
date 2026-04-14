import { User, ApiResponse } from '../types';
import apiClient from './client';

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  user: User;
  token: string;
}

export const authApi = {
  login: async (data: LoginRequest): Promise<ApiResponse<LoginResponse>> => {
    return apiClient.post<ApiResponse<LoginResponse>>('/auth/login', data);
  },

  logout: async (): Promise<void> => {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user');
  },

  getCurrentUser: async (): Promise<ApiResponse<User>> => {
    return apiClient.get<ApiResponse<User>>('/auth/me');
  },

  updateProfile: async (data: Partial<User>): Promise<ApiResponse<User>> => {
    return apiClient.patch<ApiResponse<User>>('/auth/profile', data);
  },

  changePassword: async (oldPassword: string, newPassword: string): Promise<ApiResponse<void>> => {
    return apiClient.post<ApiResponse<void>>('/auth/change-password', {
      oldPassword,
      newPassword,
    });
  },
};
