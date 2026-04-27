import { getAuthHeaders } from "@/lib/auth/authStorage";

const API_BASE_URL = "http://localhost:5000/api";

export async function getAllLabs() {
  const response = await fetch(`${API_BASE_URL}/labs`);

  if (!response.ok) {
    throw new Error("Failed to load labs");
  }

  return response.json();
}

export async function getLabBySlug(slug: string) {
  const response = await fetch(`${API_BASE_URL}/labs/${slug}`);

  if (!response.ok) {
    throw new Error("Failed to load lab");
  }

  return response.json();
}

export async function startLabSession(slug: string) {
  const response = await fetch(`${API_BASE_URL}/labs/${slug}/start`, {
    method: "POST",
    headers: {
      ...getAuthHeaders(),
    },
  });

  if (!response.ok) {
    throw new Error("Failed to start lab session");
  }

  return response.json();
}