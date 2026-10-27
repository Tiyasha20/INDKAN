const API_URL = import.meta.env.VITE_API_URL || "http://localhost:4000/api";

export async function sendEnquiry(payload) {
  const response = await fetch(`${API_URL}/enquiries`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  const result = await response.json().catch(() => ({}));
  if (!response.ok)
    throw new Error(
      result.message || "We could not send your enquiry. Please try again.",
    );
  return result;
}
