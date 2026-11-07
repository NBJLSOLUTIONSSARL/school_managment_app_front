/**
 * Centralized application environment configuration.
 * All access to import.meta.env must be routed through this module.
 */
export const env = {
  API_BASE_URL: (typeof import.meta !== "undefined" && import.meta.env?.VITE_API_BASE_URL !== undefined)
    ? import.meta.env.VITE_API_BASE_URL
    : "",
  AXIOS_BASE_URL: (typeof import.meta !== "undefined" && import.meta.env?.VITE_API_BASE_URL)
    ? import.meta.env.VITE_API_BASE_URL
    : "/api",
  BASE_PATH: import.meta.env?.VITE_BASE_PATH || "/",
  DEV_PORT: Number(import.meta.env?.VITE_DEV_PORT) || 3000,
  BUILD_SOURCEMAP: import.meta.env?.VITE_BUILD_SOURCEMAP === "true",
  MODE: import.meta.env?.MODE || "development",
  IS_PROD: Boolean(import.meta.env?.PROD),
  IS_DEV: Boolean(import.meta.env?.DEV),
}

export const API_BASE_URL = env.API_BASE_URL
export const AXIOS_BASE_URL = env.AXIOS_BASE_URL
export default env
