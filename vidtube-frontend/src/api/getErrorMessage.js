// Your backend has no JSON error handler yet, so Express answers errors with an
// HTML page like "<pre>Error: Title and description are required<br>...".
// This pulls a readable message out of either shape.
export default function getErrorMessage(err, fallback = "Something went wrong") {
  const data = err.response?.data;
  if (data?.message) return data.message;
  if (typeof data === "string") {
    const match = data.match(/Error: ([^<]+)/);
    if (match) return match[1].trim();
  }
  return fallback;
}
