import { neon } from '@neondatabase/serverless';

const sql = neon(process.env.DATABASE_URL!);

export async function testDatabaseConnection() {
  try {
    const result = await sql`SELECT NOW() as current_time`;
    return { success: true, data: result[0] };
  } catch (error) {
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    };
  }
}
