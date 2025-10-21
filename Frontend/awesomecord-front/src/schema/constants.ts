export const API_URL = import.meta.env.DEV
    ? 'https://localhost:5041'
    : import.meta.env.VITE_PUBLIC_API_URL ?? 'https://localhost:5041'

export const API_BASE_URL = `${API_URL}/api/v1/`