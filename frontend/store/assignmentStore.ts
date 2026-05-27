import { create } from 'zustand';
import { api } from '@/lib/api';
import type { Assignment } from '@/lib/types';

interface AssignmentStore {
  assignments: Assignment[];
  loading: boolean;
  error: string | null;
  fetched: boolean;
  fetchAssignments: () => Promise<void>;
  deleteAssignment: (id: string) => Promise<void>;
  upsert: (assignment: Assignment) => void;
}

export const useAssignmentStore = create<AssignmentStore>((set, get) => ({
  assignments: [],
  loading: false,
  error: null,
  fetched: false,

  fetchAssignments: async () => {
    if (get().loading) return;
    set({ loading: true, error: null });
    try {
      const { assignments } = await api.listAssignments();
      set({ assignments, loading: false, fetched: true });
    } catch (err) {
      set({
        error: err instanceof Error ? err.message : 'Failed to load assignments',
        loading: false,
        fetched: true,
      });
    }
  },

  deleteAssignment: async (id: string) => {
    const prev = get().assignments;
    set({ assignments: prev.filter((a) => a._id !== id) });
    try {
      await api.deleteAssignment(id);
    } catch (err) {
      // rollback on failure
      set({
        assignments: prev,
        error: err instanceof Error ? err.message : 'Delete failed',
      });
    }
  },

  upsert: (assignment) => {
    const list = get().assignments;
    const idx = list.findIndex((a) => a._id === assignment._id);
    if (idx === -1) {
      set({ assignments: [assignment, ...list] });
    } else {
      const next = list.slice();
      next[idx] = assignment;
      set({ assignments: next });
    }
  },
}));
