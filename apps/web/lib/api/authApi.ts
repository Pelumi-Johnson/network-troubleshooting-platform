import { getAuthHeaders, type AuthUser } from "@/lib/auth/authStorage";

const API_BASE_URL = "http://localhost:5000/api";

export type AuthResponse = {
  user: AuthUser;
  token: string;
};

export async function registerUser(
  email: string,
  password: string,
  name: string
): Promise<AuthResponse> {
  const response = await fetch(`${API_BASE_URL}/auth/register`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ email, password, name }),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Failed to register");
  }

  return data;
}

export async function loginUser(
  email: string,
  password: string
): Promise<AuthResponse> {
  const response = await fetch(`${API_BASE_URL}/auth/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ email, password }),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Failed to login");
  }

  return data;
}

export async function getCurrentUser(): Promise<AuthUser | null> {
  const response = await fetch(`${API_BASE_URL}/auth/me`, {
    headers: new Headers(getAuthHeaders()),
  });

  if (!response.ok) {
    return null;
  }

  const data = await response.json();

  return data.user;
}