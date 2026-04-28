import { getAuthHeaders } from "@/lib/auth/authStorage";
import { API_BASE_URL } from "@/lib/api/config";

export type LabProgress = {
  id: string;
  labSlug: string;
  score: number;
  completedAt: string;
};

export type LabAttempt = {
  id: string;
  labSlug: string;
  score: number;
  completedAt: string;
};

export async function getProgress(): Promise<LabProgress[]> {
  const response = await fetch(`${API_BASE_URL}/progress`, {
    headers: {
      ...getAuthHeaders(),
    },
  });

  if (!response.ok) {
    throw new Error("Failed to load progress");
  }

  return response.json();
}

export async function getAttempts(): Promise<LabAttempt[]> {
  const response = await fetch(`${API_BASE_URL}/progress/attempts`, {
    headers: {
      ...getAuthHeaders(),
    },
  });

  if (!response.ok) {
    throw new Error("Failed to load attempts");
  }

  return response.json();
}

export async function saveProgress(labSlug: string, score: number) {
  const response = await fetch(`${API_BASE_URL}/progress`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...getAuthHeaders(),
    },
    body: JSON.stringify({ labSlug, score }),
  });

  if (!response.ok) {
    throw new Error("Failed to save progress");
  }

  return response.json();
}

export async function deleteProgress(labSlug: string) {
  const response = await fetch(`${API_BASE_URL}/progress/${labSlug}`, {
    method: "DELETE",
    headers: {
      ...getAuthHeaders(),
    },
  });

  if (!response.ok) {
    throw new Error("Failed to delete progress");
  }

  return response.json();
}

export async function clearProgress() {
  const response = await fetch(`${API_BASE_URL}/progress`, {
    method: "DELETE",
    headers: {
      ...getAuthHeaders(),
    },
  });

  if (!response.ok) {
    throw new Error("Failed to clear progress");
  }

  return response.json();
}

export async function clearAttempts() {
  const response = await fetch(`${API_BASE_URL}/progress/attempts`, {
    method: "DELETE",
    headers: {
      ...getAuthHeaders(),
    },
  });

  if (!response.ok) {
    throw new Error("Failed to clear attempts");
  }

  return response.json();
}