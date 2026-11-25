import type {
  ExpenseCreate,
  ExpenseRead,
  MemberCreate,
  MemberRead,
  NudgeRequest,
  NudgeResponse,
  TripCreate,
  TripDetailResponse,
  TripRead,
} from "@/types/api";

const API_BASE = (
  process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000"
).replace(/\/$/, "");

export class ApiError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${API_BASE}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(init?.headers ?? {}),
    },
    cache: "no-store",
  });

  if (!response.ok) {
    let detail = `Request failed (${response.status})`;
    try {
      const body = (await response.json()) as { detail?: string };
      if (body?.detail) {
        detail = body.detail;
      }
    } catch {
      // Fall back to status-based message
    }
    throw new ApiError(detail, response.status);
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return (await response.json()) as T;
}

export const api = {
  listTrips: () => request<TripRead[]>("/api/trips"),

  createTrip: (payload: TripCreate) =>
    request<TripRead>("/api/trips", {
      method: "POST",
      body: JSON.stringify(payload),
    }),

  getTripDetail: (tripId: number) =>
    request<TripDetailResponse>(`/api/trips/${tripId}`),

  addMember: (tripId: number, payload: MemberCreate) =>
    request<MemberRead>(`/api/trips/${tripId}/members`, {
      method: "POST",
      body: JSON.stringify(payload),
    }),

  addExpense: (tripId: number, payload: ExpenseCreate) =>
    request<ExpenseRead>(`/api/trips/${tripId}/expenses`, {
      method: "POST",
      body: JSON.stringify(payload),
    }),

  deleteExpense: (tripId: number, expenseId: number) =>
    request<void>(`/api/trips/${tripId}/expenses/${expenseId}`, {
      method: "DELETE",
    }),

  createNudge: (tripId: number, payload: NudgeRequest) =>
    request<NudgeResponse>(`/api/trips/${tripId}/nudge`, {
      method: "POST",
      body: JSON.stringify(payload),
    }),
};
