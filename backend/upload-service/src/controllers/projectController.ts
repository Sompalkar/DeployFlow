import express from "express"
import type { AuthRequest } from "../middleware/auth"
import { sql } from "../config/database"

const router = express.Router()

// Get user projects
router.get("/", async (req: AuthRequest, res) => {
  try {
    const projects = await sql`
      SELECT * FROM projects WHERE owner_id = ${req.user!.userId} ORDER BY created_at DESC
    `

    res.json({ data: projects })
  } catch (error) {
    console.error("Get projects error:", error)
    res.status(500).json({ error: "Failed to get projects" })
  }
})

// Get project by ID
router.get("/:id", async (req: AuthRequest, res) => {
  try {
    const { id } = req.params
    const [project] = await sql`
      SELECT * FROM projects WHERE id = ${id} AND owner_id = ${req.user!.userId}
    `

    if (!project) {
      return res.status(404).json({ error: "Project not found" })
    }

    res.json({ data: project })
  } catch (error) {
    console.error("Get project error:", error)
    res.status(500).json({ error: "Failed to get project" })
  }
})

// Get project uploads
router.get("/:id/uploads", async (req: AuthRequest, res) => {
  try {
    const { id } = req.params

    // Verify project ownership
    const [project] = await sql`
      SELECT id FROM projects WHERE id = ${id} AND owner_id = ${req.user!.userId}
    `

    if (!project) {
      return res.status(404).json({ error: "Project not found" })
    }

    const uploads = await sql`
      SELECT uh.*, d.status as deployment_status
      FROM upload_history uh
      LEFT JOIN deployments d ON uh.deployment_id = d.id
      WHERE d.project_id = ${id}
      ORDER BY uh.created_at DESC
    `

    res.json({ data: uploads })
  } catch (error) {
    console.error("Get project uploads error:", error)
    res.status(500).json({ error: "Failed to get project uploads" })
  }
})

export { router as projectController }
