import {API_BASE_URL} from "../schema/constants.ts";
import {toast} from "react-toastify";

// Extend options to allow suppressing global error toasts or overriding the message
export type Options = RequestInit & {
    json?: unknown;
    suppressErrorToast?: boolean;
    customErrorMessage?: string;
};

function extractErrorMessage(status: number, contentType: string | null, bodyText: string | null): string {
    if (contentType && contentType.includes("application/json") && bodyText) {
        try {
            const obj = JSON.parse(bodyText);
            const msg = obj?.message || obj?.error || obj?.title || obj?.detail;
            if (typeof msg === "string" && msg.trim().length > 0) return msg;
            if (obj?.errors && typeof obj.errors === "object") {
                const first = Object.values(obj.errors).flat().find(x => typeof x === "string") as string | undefined;
                if (first) return first;
            }
        } catch {
        }
    }

    if (bodyText && bodyText.trim().length > 0) return bodyText.trim();

    if (status === 0) return "Network error. Please check your connection.";
    if (status === 400) return "Bad request.";
    if (status === 401) return "Unauthorized. Please sign in.";
    if (status === 403) return "You don't have permission to do this.";
    if (status === 404) return "Not found.";
    if (status >= 500) return "An unexpected server error occurred. Please try again later.";
    return `HTTP ${status}`;
}

export async function apiFetch<T>(path: string, options: Options = {}): Promise<T> {
    const {json, headers, suppressErrorToast, customErrorMessage, ...rest} = options;

    try {
        const res = await fetch(`${API_BASE_URL}${path}`, {
            credentials: "include",
            headers: {
                ...(json !== undefined ? {"Content-Type": "application/json"} : {}),
                ...headers,
            },
            ...(json !== undefined ? {body: JSON.stringify(json), method: options.method ?? "POST"} : {}),
            ...rest,
        });

        if (!res.ok) {
            const contentType = res.headers.get("content-type");
            const text = await res.text().catch(() => "");
            const message = customErrorMessage || extractErrorMessage(res.status, contentType, text);
            if (!suppressErrorToast) toast.error(message);
            throw new Error(message);
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
    } catch (err: any) {
        const message = customErrorMessage || (err?.message?.toString?.() || "Network error. Please try again.");
        if (!suppressErrorToast) toast.error(message);
        throw err instanceof Error ? err : new Error(message);
    }
}
