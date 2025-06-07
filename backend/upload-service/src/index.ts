import express from "express"
import cors from "cors"
import dotenv from "dotenv"
import helmet from "helmet"
import compression from "compression"
import morgan from "morgan"
import { connectDB } from "./config/database"
import { authMiddleware } from "./middleware/auth"
import { uploadController } from "./controllers/uploadController"
import { authController } from "./controllers/authController"
import { projectController } from "./controllers/projectController"
import { historyController } from "./controllers/historyController"

dotenv.config()

// Connect to MongoDB
connectDB()

const app = express()
const PORT = process.env.PORT || 3002

// Middleware
app.use(cors())
app.use(express.json())
app.use(helmet())
app.use(compression())
app.use(morgan("dev"))

// Routes
app.use("/api/auth", authController)
app.use("/api/upload", authMiddleware, uploadController)
app.use("/api/projects", authMiddleware, projectController)
app.use("/api/history", authMiddleware, historyController)

// Health check
app.get("/health", (req, res) => {
  res.json({ status: "OK", service: "upload-service" })
})

app.listen(PORT, () => {
  console.log(`Upload service running on port ${PORT}`)
})

export default app
