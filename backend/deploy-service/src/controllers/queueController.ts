import express from "express"
import type { AuthRequest } from "../middleware/auth"
import { queueService } from "../services/queueService"

const router = express.Router()

// Get queue status
router.get("/status", async (req: AuthRequest, res) => {
  try {
    const status = await queueService.getQueueStatus()
    res.json(status)
  } catch (error) {
    console.error("Queue status error:", error)
    res.status(500).json({ error: "Failed to get queue status" })
  }
})

// Get user's deployments in queue
router.get("/user", async (req: AuthRequest, res) => {
  try {
    const deployments = await queueService.getUserDeployments(req.user!.userId)
    res.json({ data: deployments })
  } catch (error) {
    console.error("User queue error:", error)
    res.status(500).json({ error: "Failed to get user deployments" })
  }
})

export { router as queueController }
