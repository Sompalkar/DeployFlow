import express from "express"
import type { AuthRequest } from "../middleware/auth"
import { sql } from "../config/database"

const router = express.Router()

// Get upload history
router.get("/", async (req: AuthRequest, res) => {
  try {
    const { page = 1, limit = 20, deploymentId } = req.query

    let query = sql`
      SELECT uh.*, p.name as project_name, d.status as deployment_status
      FROM upload_history uh
      LEFT JOIN deployments d ON uh.deployment_id = d.id
      LEFT JOIN projects p ON d.project_id = p.id
      WHERE uh.user_id = ${req.user!.userId}
    `

    if (deploymentId) {
      query = sql`
        SELECT uh.*, p.name as project_name, d.status as deployment_status
        FROM upload_history uh
        LEFT JOIN deployments d ON uh.deployment_id = d.id
        LEFT JOIN projects p ON d.project_id = p.id
        WHERE uh.user_id = ${req.user!.userId} AND uh.deployment_id = ${deploymentId as string}
      `
    }

    const offset = (Number(page) - 1) * Number(limit)
    const history = await sql`
      ${query}
      ORDER BY uh.created_at DESC
      LIMIT ${Number(limit)} OFFSET ${offset}
    `

    const [{ count }] = await sql`
      SELECT COUNT(*) as count FROM upload_history WHERE user_id = ${req.user!.userId}
    `

    res.json({
      data: history,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total: Number(count),
        pages: Math.ceil(Number(count) / Number(limit)),
      },
    })
  } catch (error) {
    console.error("Get history error:", error)
    res.status(500).json({ error: "Failed to get upload history" })
  }
})

// Get upload statistics
router.get("/stats", async (req: AuthRequest, res) => {
  try {
    const [stats] = await sql`
      SELECT 
        COUNT(*) as total_uploads,
        SUM(file_size) as total_size,
        COUNT(DISTINCT deployment_id) as total_deployments
      FROM upload_history 
      WHERE user_id = ${req.user!.userId}
    `

    const recentUploads = await sql`
      SELECT DATE(created_at) as date, COUNT(*) as count
      FROM upload_history 
      WHERE user_id = ${req.user!.userId} 
        AND created_at >= NOW() - INTERVAL '30 days'
      GROUP BY DATE(created_at)
      ORDER BY date DESC
    `

    res.json({
      stats: {
        totalUploads: Number(stats.total_uploads),
        totalSize: Number(stats.total_size),
        totalDeployments: Number(stats.total_deployments),
      },
      recentActivity: recentUploads,
    })
  } catch (error) {
    console.error("Get stats error:", error)
    res.status(500).json({ error: "Failed to get upload statistics" })
  }
})

export { router as historyController }
