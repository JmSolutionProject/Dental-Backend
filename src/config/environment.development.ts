import { config as loadEnv } from 'dotenv';

loadEnv({ path: '.env.local' });
loadEnv();

export const environment = {
  url: process.env.DATABASE_URL ?? '',
};
