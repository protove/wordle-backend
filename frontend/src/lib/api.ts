const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

// ── Auth ────────────────────────────────────────────────────────────────────

export interface SignupPayload { username: string; email: string; password: string }
export interface AuthResponse {
  accessToken: string;
  tokenType: string;
  userId: string;
  username: string;
  role: string;
  expiresIn?: number;
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${API_URL}${path}`, {
    ...init,
    headers: { 'Content-Type': 'application/json', ...init?.headers },
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error((err as { message?: string }).message ?? res.statusText);
  }
  return res.json() as Promise<T>;
}

export async function apiSignup(payload: SignupPayload): Promise<AuthResponse> {
  const raw = await request<{
    id: string; username: string; email: string;
    accessToken: string; tokenType: string; message: string;
  }>('/api/auth/signup', { method: 'POST', body: JSON.stringify(payload) });
  return {
    accessToken: raw.accessToken,
    tokenType: raw.tokenType,
    userId: raw.id,
    username: raw.username,
    role: 'USER',
  };
}

export async function apiLogin(username: string, password: string): Promise<AuthResponse> {
  return request<AuthResponse>('/api/auth/login', {
    method: 'POST',
    body: JSON.stringify({ username, password }),
  });
}

// ── Stats ───────────────────────────────────────────────────────────────────

export interface StatsResponse {
  gamesPlayed: number;
  gamesWon: number;
  currentStreak: number;
  maxStreak: number;
  guessDistribution: number[];   // [1-guess-wins, 2-guess-wins, ..., 6-guess-wins]
}

export async function apiGetStats(token: string): Promise<StatsResponse> {
  return request<StatsResponse>('/api/stats', {
    headers: { Authorization: `Bearer ${token}` },
  });
}

export async function apiPostGameResult(
  token: string,
  guessCnt: number,
  win: boolean
): Promise<void> {
  await request<void>('/api/stats', {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
    body: JSON.stringify({ guessCnt, win }),
  });
}
