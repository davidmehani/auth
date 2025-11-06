const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

export async function fetchMessage(): Promise<string> {
  const res = await fetch(`${API_BASE_URL}/hello`, {
    credentials: "include",
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Request failed (${res.status}): ${text}`);
  }

  const data: { message: string } = await res.json();
  return data.message;
}