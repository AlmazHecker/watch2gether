type Params = Record<string, string | number | Date | undefined>;

type FetchOptions<TBody = unknown> = {
  method?: "GET" | "POST" | "PUT" | "DELETE" | "PATCH";
  body?: TBody;
  headers?: HeadersInit;
  params?: Params;
};

const BASE_URL = process.env.NEXT_PUBLIC_URL || "";

const buildUrl = (url: string, params?: Params) => {
  const urlObj = new URL(url, BASE_URL);

  const searchParams = new URLSearchParams(urlObj.search);

  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (value instanceof Date) {
        searchParams.set(key, value.toISOString());
      } else {
        searchParams.set(key, String(value));
      }
    });
  }

  urlObj.search = searchParams.toString();
  return urlObj.toString();
};

const getBody = <T>(body: T) => {
  if (body instanceof FormData) return body;
  if (body) return JSON.stringify(body);

  return undefined;
};

export default async function fetcher<TResponse = unknown, TBody = unknown>(
  endpoint: string | string[],
  options: FetchOptions<TBody> = {},
): Promise<TResponse> {
  const { method = "GET", body, headers, params } = options;

  const pathname = Array.isArray(endpoint) ? endpoint.join("") : endpoint;

  const userTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
  const finalParams = { ...params, timezone: userTimezone };

  const url = buildUrl(BASE_URL + pathname, finalParams);

  try {
    const response = await fetch(url, {
      method,
      headers: {
        "Content-Type": "application/json",
        ...headers,
      },
      body: getBody(body),
    });

    const data: TResponse = await response.json();

    if (!response.ok) throw data;

    return data;
  } catch (error) {
    throw error instanceof Object
      ? error
      : new Error(`Failed to fetch: ${endpoint}`);
  }
}
