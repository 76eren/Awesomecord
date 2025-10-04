const BASE_URL = import.meta.env.VITE_API_URL ?? "https://localhost:5041/api/v1/";

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

    if (res.status === 204 || res.status === 205) {
        return undefined as T;
    }

    const contentLength = res.headers.get("content-length");
    if (contentLength === "0") {
        return undefined as T;
    }

    const contentType = res.headers.get("content-type") ?? "";
    if (contentType.includes("application/json")) {
        const text = await res.text();
        if (!text) return undefined as T;
        return JSON.parse(text) as T;
    }

    const fallbackText = await res.text().catch(() => "");
    return (fallbackText ? (fallbackText as unknown as T) : (undefined as T));
}
