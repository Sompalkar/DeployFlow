import postgres from "postgres"

const sql = postgres(process.env.DATABASE_URL || "postgresql://localhost:5432/deployflow", {
  ssl: process.env.NODE_ENV === "production" ? { rejectUnauthorized: false } : false,
})

export { sql }
