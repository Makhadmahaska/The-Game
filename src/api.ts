import type { User, Game, Session, UserStats } from "./types";


const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:4004';

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const response = await fetch(`${API_URL}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message ?? 'Something went wrong');
  }

  return data;
}

export const api = {
  createUser: (payload: {
    email: string;
    firstName: string;
    lastName: string;
    profilePictureUrl?: string;
  }) => request<User>('/users', { method: 'POST', body: JSON.stringify(payload) }),

  getUsers: () => request<User[]>('/users'),

  searchUsers: (query: string) => request<User[]>(`/users/search?q=${encodeURIComponent(query)}`),

  getGames: () => request<Game[]>('/games'),

  startSession: (payload: { userId: string; gameId: string }) =>
    request<Session>('/sessions/start', { method: 'POST', body: JSON.stringify(payload) }),

  stopSession: (payload: { sessionId: string }) =>
    request<Session>('/sessions/stop', { method: 'POST', body: JSON.stringify(payload) }),

  getUserStats: (userId: string, gameId?: string) =>
    request<UserStats>(`/stats/user/${userId}${gameId ? `?gameId=${gameId}` : ''}`),

  getGlobalStats: () =>
    request<{
      totalTimePerGame: Array<{ gameId: string; gameName: string; total: number; minutes: number }>;
    }>('/stats/global'),

  getLeaderboard: (gameId: string) =>
    request<Array<{ userId: string; name: string; totalSeconds: number; minutes: number }>>(
      `/stats/leaderboard?gameId=${gameId}`
    ),

  getWeeklyByGame: (gameId: string) =>
    request<Array<Record<string, number | string>>>(`/stats/weekly-by-game?gameId=${gameId}`)
};
