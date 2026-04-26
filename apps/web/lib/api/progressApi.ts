const API_BASE_URL = "http://localhost:5000/api";

export type LabProgress = {
  id: string;
  labSlug: string;
  score: number;
  completedAt: string;
};

export async function getProgress(): Promise<LabProgress[]> {
  const response = await fetch(`${API_BASE_URL}/progress`);

  if (!response.ok) {
    throw new Error("Failed to load progress");
  }

  return response.json();
}

export async function saveProgress(labSlug: string, score: number) {
  const response = await fetch(`${API_BASE_URL}/progress`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
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
  });

  if (!response.ok) {
    throw new Error("Failed to delete progress");
  }

  return response.json();
}

export async function clearProgress() {
  const response = await fetch(`${API_BASE_URL}/progress`, {
    method: "DELETE",
  });

  if (!response.ok) {
    throw new Error("Failed to clear progress");
  }

  return response.json();
}