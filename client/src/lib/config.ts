/**
 * Application configuration loaded from environment variables
 * Only need to update NEXT_PUBLIC_API_BASE_URL in .env files
 */

export const config = {
  api: {
    baseUrl: process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5002/api',
    debug: process.env.NEXT_PUBLIC_API_DEBUG === 'true',
    timeout: 10000, // 10 seconds
  },
  app: {
    name: 'Exam Preparation Timeline Planner',
    environment: process.env.NODE_ENV || 'development',
    isDevelopment: process.env.NODE_ENV === 'development',
    isProduction: process.env.NODE_ENV === 'production',
  },
} as const;

export default config;
