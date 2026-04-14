import { create } from 'zustand';
import { Objective, KeyResult, OkrFilter } from '../types';
import { okrApi, CreateObjectiveRequest } from '../api/okr';

interface OkrState {
  objectives: Objective[];
  currentObjective: Objective | null;
  isLoading: boolean;
  error: string | null;
  filter: OkrFilter;

  // Actions
  fetchObjectives: (filter?: OkrFilter) => Promise<void>;
  fetchObjective: (id: string) => Promise<void>;
  createObjective: (data: CreateObjectiveRequest) => Promise<Objective | null>;
  updateObjective: (id: string, data: Partial<Objective>) => Promise<void>;
  deleteObjective: (id: string) => Promise<void>;
  updateKeyResultProgress: (keyResultId: string, value: number, note?: string) => Promise<void>;
  setFilter: (filter: Partial<OkrFilter>) => void;
  clearError: () => void;
}

export const useOkrStore = create<OkrState>((set, get) => ({
  objectives: [],
  currentObjective: null,
  isLoading: false,
  error: null,
  filter: {},

  fetchObjectives: async (filter?: OkrFilter) => {
    set({ isLoading: true, error: null });
    try {
      const response = await okrApi.getObjectives(filter);
      if (response.success) {
        set({ objectives: response.data || [], isLoading: false });
      } else {
        set({ error: response.error?.message || 'Failed to fetch objectives', isLoading: false });
      }
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'An error occurred',
        isLoading: false,
      });
    }
  },

  fetchObjective: async (id: string) => {
    set({ isLoading: true, error: null });
    try {
      const response = await okrApi.getObjective(id);
      if (response.success) {
        set({ currentObjective: response.data || null, isLoading: false });
      } else {
        set({ error: response.error?.message || 'Failed to fetch objective', isLoading: false });
      }
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'An error occurred',
        isLoading: false,
      });
    }
  },

  createObjective: async (data: CreateObjectiveRequest) => {
    set({ isLoading: true, error: null });
    try {
      const response = await okrApi.createObjective(data);
      if (response.success && response.data) {
        set((state) => ({
          objectives: [...state.objectives, response.data!],
          isLoading: false,
        }));
        return response.data;
      } else {
        set({ error: response.error?.message || 'Failed to create objective', isLoading: false });
        return null;
      }
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'An error occurred',
        isLoading: false,
      });
      return null;
    }
  },

  updateObjective: async (id: string, data: Partial<Objective>) => {
    set({ isLoading: true, error: null });
    try {
      const response = await okrApi.updateObjective(id, data);
      if (response.success) {
        set((state) => ({
          objectives: state.objectives.map((o) => (o.id === id ? response.data! : o)),
          currentObjective: state.currentObjective?.id === id ? response.data! : state.currentObjective,
          isLoading: false,
        }));
      } else {
        set({ error: response.error?.message || 'Failed to update objective', isLoading: false });
      }
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'An error occurred',
        isLoading: false,
      });
    }
  },

  deleteObjective: async (id: string) => {
    set({ isLoading: true, error: null });
    try {
      await okrApi.deleteObjective(id);
      set((state) => ({
        objectives: state.objectives.filter((o) => o.id !== id),
        currentObjective: state.currentObjective?.id === id ? null : state.currentObjective,
        isLoading: false,
      }));
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'An error occurred',
        isLoading: false,
      });
    }
  },

  updateKeyResultProgress: async (keyResultId: string, value: number, note?: string) => {
    set({ isLoading: true, error: null });
    try {
      const response = await okrApi.updateProgress(keyResultId, { value, note });
      if (response.success) {
        // Refresh current objective to get updated data
        const { currentObjective } = get();
        if (currentObjective) {
          await get().fetchObjective(currentObjective.id);
        }
      } else {
        set({ error: response.error?.message || 'Failed to update progress', isLoading: false });
      }
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'An error occurred',
        isLoading: false,
      });
    }
  },

  setFilter: (filter: Partial<OkrFilter>) => {
    set((state) => ({ filter: { ...state.filter, ...filter } }));
  },

  clearError: () => {
    set({ error: null });
  },
}));
