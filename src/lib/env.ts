/**
 * Fail-fast Environment Variable Validation
 */
const getEnvVar = (key: string): string => {
  const value = import.meta.env[key];
  if (!value) {
    throw new Error(`Environment variable ${key} is missing! Application cannot start.`);
  }
  return value;
};

export const env = {
  API_URL: getEnvVar('VITE_API_URL'),
  NODE_ENV: import.meta.env.MODE,
} as const;
