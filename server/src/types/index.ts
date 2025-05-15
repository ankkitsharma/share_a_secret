import { getDb } from "../db";

export type Env = {
  DATABASE_URL: string;
  db: ReturnType<typeof getDb>;
};
