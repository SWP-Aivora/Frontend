/**
 * Fail-fast Environment Variable Validation
 */
const getEnvVar = (key: string, fallback?: string): string => {
  const value = import.meta.env[key];
  const isDev = import.meta.env.DEV;

  if (!value) {
    if (isDev && fallback) {
      console.warn(`Environment variable ${key} is missing, using fallback: ${fallback}`);
      return fallback;
    }
    throw new Error(`Environment variable ${key} is missing! Application cannot start.`);
  }
  return value;
};

export const env = {
  API_URL: getEnvVar('VITE_API_URL', 'http://localhost:5176/api/v1'),
  NODE_ENV: import.meta.env.MODE,
} as const;
