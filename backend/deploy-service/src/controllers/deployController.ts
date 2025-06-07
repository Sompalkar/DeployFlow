import express from "express"
import type { AuthRequest } from "../middleware/auth"
import { deploymentService } from "../services/deploymentService"

const router = express.Router()

// Create deployment
router.post("/", async (req: AuthRequest, res) => {
  try {
    const { repoUrl, buildCommand = "npm run build", projectId } = req.body

    if (!repoUrl) {
      return res.status(400).json({ error: "Repository URL is required" })
    }

    const deploymentId = await deploymentService.createDeployment({
      repoUrl,
      buildCommand,
      projectId,
      userId: req.user!.userId,
    })

    res.json({
      success: true,
      deploymentId,
      status: "pending",
    })
  } catch (error) {
    console.error("Deploy endpoint error:", error)
    res.status(500).json({ error: "Deployment creation failed" })
  }
})

// Get deployment status
router.get("/status/:id", async (req: AuthRequest, res) => {
  try {
    const { id } = req.params
    const deployment = await deploymentService.getDeploymentStatus(id)

    if (!deployment) {
      return res.status(404).json({ error: "Deployment not found" })
    }

    res.json(deployment)
  } catch (error) {
    console.error("Status endpoint error:", error)
    res.status(500).json({ error: "Failed to get deployment status" })
  }
})

// Get deployment logs
router.get("/logs/:id", async (req: AuthRequest, res) => {
  try {
    const { id } = req.params
    const logs = await deploymentService.getDeploymentLogs(id)

    if (!logs) {
      return res.status(404).json({ error: "Deployment not found" })
    }

    res.json(logs)
  } catch (error) {
    console.error("Logs endpoint error:", error)
    res.status(500).json({ error: "Failed to get deployment logs" })
  }
})

// Cancel deployment
router.post("/cancel/:id", async (req: AuthRequest, res) => {
  try {
    const { id } = req.params
    const success = await deploymentService.cancelDeployment(id)

    if (!success) {
      return res.status(404).json({ error: "Deployment not found or cannot be cancelled" })
    }

    res.json({
      success: true,
      message: "Deployment cancelled",
    })
  } catch (error) {
    console.error("Cancel endpoint error:", error)
    res.status(500).json({ error: "Failed to cancel deployment" })
  }
})

export { router as deployController }
