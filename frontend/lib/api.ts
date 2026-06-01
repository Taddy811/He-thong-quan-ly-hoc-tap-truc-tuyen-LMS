const DEFAULT_API_BASE_URL = "https://lms-backend-3wye.onrender.com";
const DEFAULT_API_TIMEOUT_MS = 20000;

const trimTrailingSlash = (value: string) => value.replace(/\/+$/, "");

export const apiUrl = (path: string) => {
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  const configuredBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL?.trim();
  const baseUrl = configuredBaseUrl
    ? trimTrailingSlash(configuredBaseUrl)
    : DEFAULT_API_BASE_URL;

  return `${baseUrl}${normalizedPath}`;
};

export const apiFetch = async (
  path: string,
  options: RequestInit = {},
  timeoutMs = DEFAULT_API_TIMEOUT_MS
) => {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  try {
    return await fetch(apiUrl(path), {
      ...options,
      signal: controller.signal,
    });
  } finally {
    clearTimeout(timeoutId);
  }
};

export const isTimeoutError = (error: unknown) => {
  return (
    typeof error === "object" &&
    error !== null &&
    "name" in error &&
    error.name === "AbortError"
  );
};

export const readApiResponse = async (response: Response): Promise<any> => {
  const contentType = response.headers.get("content-type") || "";

  if (contentType.includes("application/json")) {
    return response.json();
  }

  return {
    message: `May chu tra ve loi ${response.status}. Vui long thu lai sau.`,
  };
};
