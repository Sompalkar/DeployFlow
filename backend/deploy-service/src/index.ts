import express from "express"
import cors from "cors"
import dotenv from "dotenv"
import { authMiddleware } from "./middleware/auth"
import { deployController } from "./controllers/deployController"
import { authController } from "./controllers/authController"
import { queueController } from "./controllers/queueController"
import { deploymentWorker } from "./services/deploymentWorker"

dotenv.config()

const app = express()
const PORT = process.env.PORT || 3003

// Middleware
app.use(cors())
app.use(express.json())

// Routes
app.use("/api/auth", authController)
app.use("/api/deploy", authMiddleware, deployController)
app.use("/api/queue", authMiddleware, queueController)

// Health check
app.get("/health", (req, res) => {
  res.json({ status: "OK", service: "deploy-service" })
})

// Start deployment worker
deploymentWorker.start()

app.listen(PORT, () => {
  console.log(`Deploy service running on port ${PORT}`)
})

export default app
