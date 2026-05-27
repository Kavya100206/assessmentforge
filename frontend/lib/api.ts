import type { Assignment } from './types';

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8000';

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${API_URL}${path}`, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      ...init?.headers,
    },
  });
  if (!res.ok) {
    let msg = res.statusText;
    try {
      const body = (await res.json()) as { error?: string };
      if (body?.error) msg = body.error;
    } catch {
      // ignore
    }
    throw new Error(`${res.status}: ${msg}`);
  }
  return (await res.json()) as T;
}

export const api = {
  listAssignments: () =>
    request<{ assignments: Assignment[] }>('/api/assignments'),
  getAssignment: (id: string) =>
    request<{ assignment: Assignment }>(`/api/assignments/${id}`),
  deleteAssignment: (id: string) =>
    request<{ ok: boolean }>(`/api/assignments/${id}`, { method: 'DELETE' }),
  regenerateAssignment: (id: string) =>
    request<{ assignment: Assignment }>(
      `/api/assignments/${id}/regenerate`,
      { method: 'POST' }
    ),
  createAssignment: async (formData: FormData) => {
    const res = await fetch(`${API_URL}/api/assignments`, {
      method: 'POST',
      body: formData,
    });
    if (!res.ok) {
      let msg = res.statusText;
      try {
        const body = (await res.json()) as { error?: string };
        if (body?.error) msg = body.error;
      } catch {
        // ignore
      }
      throw new Error(`${res.status}: ${msg}`);
    }
    return (await res.json()) as { assignment: Assignment };
  },
};

export { API_URL };
