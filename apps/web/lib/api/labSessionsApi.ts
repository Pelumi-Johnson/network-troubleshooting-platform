import { getAuthHeaders } from "@/lib/auth/authStorage";

const API_BASE_URL = "http://localhost:5000/api";

export type ActiveLabSession = {
  sessionId: string;
  labId: string;
  labSlug: string;
  status: string;
  score: number;
  hintsUsed: number;
  startedAt: string;
};

export async function getLabSession(sessionId: string) {
  const response = await fetch(`${API_BASE_URL}/lab-sessions/${sessionId}`, {
    headers: {
      ...getAuthHeaders(),
    },
  });

  if (!response.ok) {
    throw new Error("Failed to load lab session");
  }

  return response.json();
}

export async function getActiveLabSessions(): Promise<ActiveLabSession[]> {
  const response = await fetch(`${API_BASE_URL}/lab-sessions/active`, {
    headers: {
      ...getAuthHeaders(),
    },
  });

  if (!response.ok) {
    throw new Error("Failed to load active lab sessions");
  }

  return response.json();
}

export async function clearActiveLabSession(labSlug: string) {
  const response = await fetch(`${API_BASE_URL}/lab-sessions/active/${labSlug}`, {
    method: "DELETE",
    headers: {
      ...getAuthHeaders(),
    },
  });

  if (!response.ok) {
    throw new Error("Failed to clear active lab session");
  }

  return response.json();
}

export async function executeCommand(
  sessionId: string,
  deviceId: string,
  command: string
) {
  const response = await fetch(`${API_BASE_URL}/lab-sessions/${sessionId}/command`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...getAuthHeaders(),
    },
    body: JSON.stringify({ deviceId, command }),
  });

  if (!response.ok) {
    throw new Error("Failed to execute command");
  }

  return response.json();
}

export async function requestHint(sessionId: string) {
  const response = await fetch(`${API_BASE_URL}/lab-sessions/${sessionId}/hint`, {
    method: "POST",
    headers: {
      ...getAuthHeaders(),
    },
  });

  return response.json();
}