import express from "express"
import type { AuthRequest } from "../middleware/auth"
import UploadHistory from "../models/UploadHistory"
import mongoose from "mongoose"

const router = express.Router()

// Get upload history
router.get("/", async (req: AuthRequest, res) => {
  try {
    const { page = 1, limit = 20, deploymentId } = req.query
    const pageNum = Number(page)
    const limitNum = Number(limit)
    const skip = (pageNum - 1) * limitNum

    const query: any = {
      userId: new mongoose.Types.ObjectId(req.user!.userId),
    }

    if (deploymentId) {
      query.deploymentId = deploymentId
    }

    const history = await UploadHistory.find(query).sort({ createdAt: -1 }).skip(skip).limit(limitNum).populate({
      path: "userId",
      select: "username email",
    })

    const count = await UploadHistory.countDocuments(query)

    res.json({
      data: history,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total: count,
        pages: Math.ceil(count / limitNum),
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
    const userId = new mongoose.Types.ObjectId(req.user!.userId)

    const stats = await UploadHistory.aggregate([
      { $match: { userId } },
      {
        $group: {
          _id: null,
          totalUploads: { $sum: 1 },
          totalSize: { $sum: "$fileSize" },
          totalDeployments: { $addToSet: "$deploymentId" },
        },
      },
    ])

    // Get recent activity (last 30 days)
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

    const recentUploads = await UploadHistory.aggregate([
      {
        $match: {
          userId,
          createdAt: { $gte: thirtyDaysAgo },
        },
      },
      {
        $group: {
          _id: {
            $dateToString: { format: "%Y-%m-%d", date: "$createdAt" },
          },
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: -1 } },
    ])

    const statsData =
      stats.length > 0
        ? {
            totalUploads: stats[0].totalUploads,
            totalSize: stats[0].totalSize,
            totalDeployments: stats[0].totalDeployments.length,
          }
        : {
            totalUploads: 0,
            totalSize: 0,
            totalDeployments: 0,
          }

    res.json({
      stats: statsData,
      recentActivity: recentUploads.map((item) => ({
        date: item._id,
        count: item.count,
      })),
    })
  } catch (error) {
    console.error("Get stats error:", error)
    res.status(500).json({ error: "Failed to get upload statistics" })
  }
})

export { router as historyController }
