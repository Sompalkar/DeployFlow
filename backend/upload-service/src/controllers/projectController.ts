import express from "express"
import type { AuthRequest } from "../middleware/auth"
import Project from "../models/Project"
import mongoose from "mongoose"

const router = express.Router()

// Get user projects
router.get("/", async (req: AuthRequest, res) => {
  try {
    const projects = await Project.find({
      ownerId: new mongoose.Types.ObjectId(req.user!.userId),
    }).sort({ createdAt: -1 })

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
    const project = await Project.findOne({
      _id: id,
      ownerId: new mongoose.Types.ObjectId(req.user!.userId),
    })

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
    const project = await Project.findOne({
      _id: id,
      ownerId: new mongoose.Types.ObjectId(req.user!.userId),
    })

    if (!project) {
      return res.status(404).json({ error: "Project not found" })
    }

    // Find uploads related to this project's deployments
    const uploads = await mongoose.model("UploadHistory").aggregate([
      {
        $lookup: {
          from: "deployments",
          localField: "deploymentId",
          foreignField: "id",
          as: "deployment",
        },
      },
      { $unwind: "$deployment" },
      { $match: { "deployment.projectId": id } },
      { $sort: { createdAt: -1 } },
    ])

    res.json({ data: uploads })
  } catch (error) {
    console.error("Get project uploads error:", error)
    res.status(500).json({ error: "Failed to get project uploads" })
  }
})

export { router as projectController }
