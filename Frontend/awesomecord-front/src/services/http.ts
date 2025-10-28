import {API_BASE_URL} from "../schema/constants.ts";
import {toast} from "react-toastify";

export type Options = RequestInit & {
    json?: unknown;
    suppressErrorToast?: boolean;
    customErrorMessage?: string;
};

class ApiError extends Error {
    status: number;
    raw?: string;

    constructor(message: string, status: number, raw?: string) {
        super(message);
        this.name = "ApiError";
        this.status = status;
        this.raw = raw;
    }
}

function isEmptyBody(status: number, headers: Headers): boolean {
    if (status === 204 || status === 205) return true;
    const len = headers.get("content-length");
    return len === "0";
}

function parseProblemJson(raw: string, status: number): string | null {
    // { title, status, detail }
    try {
        const obj = JSON.parse(raw);
        const hasShape =
            typeof obj?.title === "string" &&
            typeof obj?.status === "number" &&
            typeof obj?.detail === "string";

        if (hasShape) {
            const title = obj.title.trim() || `HTTP ${status}`;
            const detail = obj.detail.trim();
            return detail ? `${title}: ${detail}` : title;
        }
    } catch {
        // Not JSON; ignore
    }
    return null;
}

function pickMethod(methodFromOptions: RequestInit["method"], hasJson: boolean): string {
    if (methodFromOptions) return methodFromOptions;
    return hasJson ? "POST" : "GET";
}

export async function apiFetch<T>(path: string, options: Options = {}): Promise<T> {
    const {json, headers, suppressErrorToast, customErrorMessage, ...rest} = options;

    const mergedHeaders = new Headers(headers ?? {});
    const hasJson = json !== undefined;

    if (hasJson && !mergedHeaders.has("Content-Type")) {
        mergedHeaders.set("Content-Type", "application/json");
    }

    try {
        const res = await fetch(`${API_BASE_URL}${path}`, {
            credentials: "include",
            method: pickMethod(options.method, hasJson),
            headers: mergedHeaders,
            body: hasJson ? JSON.stringify(json) : undefined,
            ...rest,
        });

        const shouldReadBody = !isEmptyBody(res.status, res.headers);
        const rawText = shouldReadBody ? await res.text().catch(() => "") : "";

        if (!res.ok) {
            const message =
                customErrorMessage ||
                parseProblemJson(rawText, res.status) ||
                (res.status === 0
                    ? "Network error. Please check your connection."
                    : rawText?.trim()
                        ? rawText.trim()
                        : `HTTP ${res.status}`);

            if (!suppressErrorToast) toast.error(message);
            throw new ApiError(message, res.status, rawText);
        }

        if (!shouldReadBody || rawText.trim().length === 0) {
            return undefined as T;
        }

        const contentType = res.headers.get("content-type") ?? "";

        if (contentType.includes("application/json")) {
            return JSON.parse(rawText) as T;
        }

        // Fallback: return raw text when not JSON.
        return (rawText as unknown) as T;
    } catch (e: unknown) {
        const err = e instanceof Error ? e : new Error(String(e));
        const message = customErrorMessage || err.message || "Network error. Please try again.";

        if (!suppressErrorToast) toast.error(message);
        throw e instanceof Error ? e : new Error(message);
    }
}
