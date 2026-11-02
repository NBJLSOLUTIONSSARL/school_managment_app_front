const rawBackendUrl =
  process.env.BACKEND_API_URL?.trim() ||
  process.env.NEXT_PUBLIC_BACKEND_API_URL?.trim() ||
  "http://localhost:8080";

export const backendApiUrl = rawBackendUrl.replace(/\/$/, "");

export function backendUrl(path: string, search?: URLSearchParams) {
  const url = new URL(path, `${backendApiUrl}/`);
  if (search) {
    search.forEach((value, key) => url.searchParams.append(key, value));
  }
  return url;
}
