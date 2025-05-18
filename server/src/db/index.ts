// db/index.ts

import { neon } from "@neondatabase/serverless"
import { drizzle } from "drizzle-orm/neon-http"

export const getDb = (url: string) => {
  const sql = neon(url)
  return drizzle({ client: sql })
}
