import * as dotenv from 'dotenv';
import * as path from 'path';

// Load .env from the backend root folder
dotenv.config({ path: path.resolve(__dirname, '../.env') });

if (!process.env.DATABASE_URL) {
  process.env.DATABASE_URL = 'postgresql://localhost:5432/dummy-db';
}
if (!process.env.JWT_SECRET) {
  process.env.JWT_SECRET = 'test-secret-key-for-unit-tests-only';
}
if (!process.env.JWT_REFRESH_SECRET) {
  process.env.JWT_REFRESH_SECRET = 'test-refresh-secret-key-for-unit-tests-only';
}
if (!process.env.MERCADOPAGO_ACCESS_TOKEN) {
  process.env.MERCADOPAGO_ACCESS_TOKEN = 'test-mercadopago-access-token';
}
if (!process.env.GEMINI_API_KEY) {
  process.env.GEMINI_API_KEY = 'mock-gemini-key';
}
