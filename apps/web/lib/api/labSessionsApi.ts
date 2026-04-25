const API_BASE_URL = "http://localhost:5000/api";

export async function getLabSession(sessionId: string) {
  const response = await fetch(`${API_BASE_URL}/lab-sessions/${sessionId}`);

  if (!response.ok) {
    throw new Error("Failed to fetch lab session");
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
  });

  const result = await response.json();

  return result;
}