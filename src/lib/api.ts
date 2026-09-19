const API_BASE_URL = (
  import.meta.env.VITE_API_BASE_URL ?? "http://localhost:5038"
).replace(/\/$/, "");

const ACCESS_TOKEN_KEY = "trilha.access-token";
const USER_ID_KEY = "trilha.user-id";

export type AppRole = "admin" | "leader" | "volunteer";

export type Profile = {
  id: number;
  full_name: string;
  email: string | null;
  area: string | null;
  phone: string | null;
};

export type RoleRow = {
  id?: number;
  user_id?: number;
  role: AppRole;
  area: string | null;
};

export type AuthUser = Pick<Profile, "id" | "email">;

export type AuthSession = {
  accessToken: string;
  expiresAt?: string | null;
};

export type UserContext = {
  user: AuthUser;
  profile: Profile;
  roles: RoleRow[];
};

export type ApiUser = {
  id: number;
  name: string;
  email: string;
  createdAt: string;
};

export type Attendance = {
  id: number;
  user_id?: number;
  served_on: string;
  step: number | null;
  note?: string | null;
};

export type TeamProfile = Pick<
  Profile,
  "id" | "full_name" | "email" | "area"
>;

export type TrilhaTime = {
  id: number;
  nome: string;
};

export type TrilhaPassos = { 
  id: number; 
  nome: string;
}

type TrilhaTimeResponse =
  | TrilhaTime
  | { idTime: number; nome: string };

export class ApiError extends Error {
  constructor(
    message: string,
    public readonly status: number,
    public readonly details?: unknown
  ) {
    super(message);
    this.name = "ApiError";
  }
}

export function getAccessToken(): string | null {
  return localStorage.getItem(ACCESS_TOKEN_KEY);
}

export function setAccessToken(token: string): void {
  localStorage.setItem(ACCESS_TOKEN_KEY, token);
}

export function getStoredUserId(): number | null {
  const id = localStorage.getItem(USER_ID_KEY);

  if (!id) {
    return null;
  }

  const userId = Number(id);

  if (!Number.isInteger(userId)) {
    return null;
  }

  return userId;
}

export function setStoredUserId(id: number): void {
  localStorage.setItem(USER_ID_KEY, String(id));
}

export function clearAccessToken(): void {
  localStorage.removeItem(ACCESS_TOKEN_KEY);
  localStorage.removeItem(USER_ID_KEY);
}

async function request<T>(path: string, init: RequestInit = {}): Promise<T> {
  const headers = new Headers(init.headers);
  const token = getAccessToken();
  if (token) headers.set("Authorization", `Bearer ${token}`);
  if (init.body && !headers.has("Content-Type")) headers.set("Content-Type", "application/json");

  const response = await fetch(`${API_BASE_URL}${path}`, { ...init, headers });
  if (response.status === 204) return undefined as T;

  const contentType = response.headers.get("content-type") ?? "";
  const body: unknown = contentType.includes("application/json")
    ? await response.json()
    : await response.text();

  if (!response.ok) {
    const message =
      typeof body === "object" && body !== null && "message" in body && typeof body.message === "string"
        ? body.message
        : typeof body === "string" && body
          ? body
          : "Não foi possível concluir a operação.";
    throw new ApiError(message, response.status, body);
  }
  return body as T;
}

export type AuthResponse = {
  accessToken: string;
  expiresAtUtc: string;
  user: ApiUser;
};

export const api = {
  auth: {
    async signIn(email: string, password: string): Promise<AuthResponse> {
      const response = await request<AuthResponse>("/api/auth/login", {
        method: "POST",
        body: JSON.stringify({ email, password }),
      });
      setAccessToken(response.accessToken);
      setStoredUserId(response.user.id);
      return response;
    },
    async signUp(payload: { fullName: string; email: string; password: string }): Promise<ApiUser> {
      return request<ApiUser>("/users", {
        method: "POST",
        body: JSON.stringify({ name: payload.fullName, email: payload.email, password: payload.password }),
      });
    },
    async signInWithGoogle(idToken: string): Promise<AuthResponse> {
      const response = await request<AuthResponse>("/api/auth/google", {
        method: "POST",
        body: JSON.stringify({ idToken }),
      });
      setAccessToken(response.accessToken);
      setStoredUserId(response.user.id);
      return response;
    },
    async getMe(): Promise<ApiUser> {
      const userId = getStoredUserId();
      if (!userId) throw new ApiError("Usuário não autenticado.", 401);
      return request<ApiUser>(`/users/${userId}`);
    },
    signOut() {
      clearAccessToken();
    },
  },
  attendances: {
    mine: (month: string) => request<Attendance[]>(`/attendances/mine?month=${encodeURIComponent(month)}`),
    create: (payload: { served_on: string; note: string | null }) =>
      request<Attendance>("/attendances", { method: "POST", body: JSON.stringify(payload) }),
    remove: (id: string) => request<void>(`/attendances/${id}`, { method: "DELETE" }),
  },
  team: {
    members: () => request<TeamProfile[]>("/times/members"),
    attendances: (month: string) => request<Attendance[]>(`/times/attendances?month=${encodeURIComponent(month)}`),
    roles: () => request<RoleRow[]>("/times/roles"),
    saveRole: (payload: { user_id: string; role: AppRole; area: string | null }) =>
      request<RoleRow>("/times/roles", { method: "PUT", body: JSON.stringify(payload) }),
    removeRole: (id: number) => request<void>(`/times/roles/${id}`, { method: "DELETE" }),
  },
  trilha: {
    async getTimes(): Promise<TrilhaTime[]> {
      const times = await request<TrilhaTimeResponse[]>("/trilha/times");
      return times.map((time) => ({
        id: "id" in time ? time.id : time.idTime,
        nome: time.nome,
      }));
    },
    async getPassos(): Promise<TrilhaPassos[]> {
      const passos = await request<TrilhaPassos[]>("/trilha/passos");
      return passos.map((passo) => ({
        id: passo.id,
        nome: passo.nome,
      }));
    },
    checkin: (idTime: number, idUsuario: number, idPasso: number) =>
      request<string>("/trilha/checkin", { method: "POST", body: JSON.stringify({ idTime, idUsuario, idPasso }) }),

    jaFezCheckin: (idUsuario: number) => request<boolean>(`/trilha/jaFezCheckin?idUsuario=${idUsuario}`),
  },
};
