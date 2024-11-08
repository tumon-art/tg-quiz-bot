import { drizzle } from 'drizzle-orm/postgres-js'
import postgres from 'postgres'
import { books } from './migrations/schema';


const client = postgres(String(process.env.DATABASE_URL))
export const db = drizzle({ client });
