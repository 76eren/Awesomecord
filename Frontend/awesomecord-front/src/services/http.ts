const BASE_URL = import.meta.env.VITE_API_URL ?? "http://localhost:5041/api/v1/";

type Options = RequestInit & { json?: unknown };

export async function apiFetch<T>(path: string, options: Options = {}): Promise<T> {
    const { json, headers, ...rest } = options;

    const res = await fetch(`${BASE_URL}${path}`, {
        credentials: "include",
        headers: {
            ...(json !== undefined ? { "Content-Type": "application/json" } : {}),
            ...headers,
        },
        ...(json !== undefined ? { body: JSON.stringify(json), method: options.method ?? "POST" } : {}),
        ...rest,
    });

    if (!res.ok) {
        const text = await res.text().catch(() => "");
        throw new Error(text || `HTTP ${res.status}`);
    }

    return (await res.json()) as T;
}