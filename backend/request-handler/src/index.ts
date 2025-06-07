import express from "express"
import cors from "cors"
import dotenv from "dotenv"
import { authMiddleware } from "./middleware/auth"
import { authController } from "./controllers/authController"
import { projectController } from "./controllers/projectController"
import { deploymentController } from "./controllers/deploymentController"
import { userController } from "./controllers/userController"
import { initDatabase } from "./config/database"
import jwt from "jsonwebtoken"
import { Pool } from "pg"

dotenv.config()

const app = express()
const PORT = process.env.PORT || 3001

// Middleware
app.use(cors())
app.use(express.json())

// Initialize database
initDatabase()

// Database connection
const pool = new Pool({
  connectionString: process.env.DATABASE_URL || "postgresql://localhost:5432/deployflow",
  ssl: process.env.NODE_ENV === "production" ? { rejectUnauthorized: false } : false,
})

// JWT secret
const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key"

// Service URLs
const UPLOAD_SERVICE_URL = process.env.UPLOAD_SERVICE_URL || "http://localhost:3002"
const DEPLOY_SERVICE_URL = process.env.DEPLOY_SERVICE_URL || "http://localhost:3003"

// Middleware for authentication
const authenticateToken = (req: any, res: any, next: any) => {
  const authHeader = req.headers["authorization"]
  const token = authHeader && authHeader.split(" ")[1]

  if (!token) {
    return res.status(401).json({ error: "Access token required" })
  }

  jwt.verify(token, JWT_SECRET, (err: any, user: any) => {
    if (err) {
      return res.status(403).json({ error: "Invalid token" })
    }
    req.user = user
    next()
  })
}

// Database initialization
// const initDatabase = async () => {
//   try {
//     // Create users table
//     await pool.query(`
//       CREATE TABLE IF NOT EXISTS users (
//         id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
//         username VARCHAR(255) UNIQUE NOT NULL,
//         email VARCHAR(255) UNIQUE NOT NULL,
//         password_hash VARCHAR(255) NOT NULL,
//         created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
//         updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
//       )
//     `)

//     // Create projects table
//     await pool.query(`
//       CREATE TABLE IF NOT EXISTS projects (
//         id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
//         name VARCHAR(255) NOT NULL,
//         repo_url VARCHAR(500) NOT NULL,
//         build_command VARCHAR(255) DEFAULT 'npm run build',
//         output_dir VARCHAR(255) DEFAULT 'dist',
//         owner_id UUID REFERENCES users(id) ON DELETE CASCADE,
//         status VARCHAR(50) DEFAULT 'idle',
//         deployment_url VARCHAR(500),
//         last_deployment TIMESTAMP,
//         created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
//         updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
//       )
//     `)

//     // Create deployments table
//     await pool.query(`
//       CREATE TABLE IF NOT EXISTS deployments (
//         id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
//         project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
//         status VARCHAR(50) DEFAULT 'pending',
//         deployment_url VARCHAR(500),
//         logs TEXT,
//         error_message TEXT,
//         started_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
//         completed_at TIMESTAMP
//       )
//     `)

//     console.log("Database initialized successfully")
//   } catch (error) {
//     console.error("Database initialization error:", error)
//   }
// }

// initDatabase()

// Routes
app.use("/api/auth", authController)
app.use("/api/projects", authMiddleware, projectController)
app.use("/api/deployments", deploymentController) // Some endpoints need auth, some don't
app.use("/api/users", authMiddleware, userController)

// Health check
app.get("/health", (req, res) => {
  res.json({ status: "OK", service: "request-handler" })
})

// Auth routes
// app.post("/api/auth/register", async (req, res) => {
//   try {
//     const { username, email, password } = req.body

//     if (!username || !email || !password) {
//       return res.status(400).json({ error: "All fields are required" })
//     }

//     // Check if user already exists
//     const existingUser = await pool.query("SELECT id FROM users WHERE email = $1 OR username = $2", [email, username])

//     if (existingUser.rows.length > 0) {
//       return res.status(400).json({ error: "User already exists" })
//     }

//     // Hash password
//     const saltRounds = 10
//     const passwordHash = await bcrypt.hash(password, saltRounds)

//     // Create user
//     const result = await pool.query(
//       "INSERT INTO users (username, email, password_hash) VALUES ($1, $2, $3) RETURNING id, username, email",
//       [username, email, passwordHash],
//     )

//     const user = result.rows[0]

//     // Generate JWT token
//     const token = jwt.sign({ userId: user.id, username: user.username }, JWT_SECRET, { expiresIn: "7d" })

//     res.status(201).json({
//       user: {
//         id: user.id,
//         username: user.username,
//         email: user.email,
//       },
//       token,
//     })
//   } catch (error) {
//     console.error("Registration error:", error)
//     res.status(500).json({ error: "Registration failed" })
//   }
// })

// app.post("/api/auth/login", async (req, res) => {
//   try {
//     const { email, password } = req.body

//     if (!email || !password) {
//       return res.status(400).json({ error: "Email and password are required" })
//     }

//     // Find user
//     const result = await pool.query("SELECT id, username, email, password_hash FROM users WHERE email = $1", [email])

//     if (result.rows.length === 0) {
//       return res.status(401).json({ error: "Invalid credentials" })
//     }

//     const user = result.rows[0]

//     // Verify password
//     const isValidPassword = await bcrypt.compare(password, user.password_hash)
//     if (!isValidPassword) {
//       return res.status(401).json({ error: "Invalid credentials" })
//     }

//     // Generate JWT token
//     const token = jwt.sign({ userId: user.id, username: user.username }, JWT_SECRET, { expiresIn: "7d" })

//     res.json({
//       user: {
//         id: user.id,
//         username: user.username,
//         email: user.email,
//       },
//       token,
//     })
//   } catch (error) {
//     console.error("Login error:", error)
//     res.status(500).json({ error: "Login failed" })
//   }
// })

// app.get("/api/auth/profile", authenticateToken, async (req, res) => {
//   try {
//     const result = await pool.query("SELECT id, username, email, created_at FROM users WHERE id = $1", [
//       req.user.userId,
//     ])

//     if (result.rows.length === 0) {
//       return res.status(404).json({ error: "User not found" })
//     }

//     res.json(result.rows[0])
//   } catch (error) {
//     console.error("Profile error:", error)
//     res.status(500).json({ error: "Failed to get profile" })
//   }
// })

// // Project routes
// app.get("/api/projects", authenticateToken, async (req, res) => {
//   try {
//     const result = await pool.query("SELECT * FROM projects WHERE owner_id = $1 ORDER BY created_at DESC", [
//       req.user.userId,
//     ])

//     res.json({ data: result.rows })
//   } catch (error) {
//     console.error("Get projects error:", error)
//     res.status(500).json({ error: "Failed to get projects" })
//   }
// })

// app.post("/api/projects", authenticateToken, async (req, res) => {
//   try {
//     const { name, repoUrl, buildCommand = "npm run build", outputDir = "dist" } = req.body

//     if (!name || !repoUrl) {
//       return res.status(400).json({ error: "Name and repository URL are required" })
//     }

//     const result = await pool.query(
//       "INSERT INTO projects (name, repo_url, build_command, output_dir, owner_id) VALUES ($1, $2, $3, $4, $5) RETURNING *",
//       [name, repoUrl, buildCommand, outputDir, req.user.userId],
//     )

//     res.status(201).json({ data: result.rows[0] })
//   } catch (error) {
//     console.error("Create project error:", error)
//     res.status(500).json({ error: "Failed to create project" })
//   }
// })

// app.get("/api/projects/:id", authenticateToken, async (req, res) => {
//   try {
//     const { id } = req.params
//     const result = await pool.query("SELECT * FROM projects WHERE id = $1 AND owner_id = $2", [id, req.user.userId])

//     if (result.rows.length === 0) {
//       return res.status(404).json({ error: "Project not found" })
//     }

//     res.json({ data: result.rows[0] })
//   } catch (error) {
//     console.error("Get project error:", error)
//     res.status(500).json({ error: "Failed to get project" })
//   }
// })

// app.put("/api/projects/:id", authenticateToken, async (req, res) => {
//   try {
//     const { id } = req.params
//     const { name, repoUrl, buildCommand, outputDir } = req.body

//     const result = await pool.query(
//       "UPDATE projects SET name = $1, repo_url = $2, build_command = $3, output_dir = $4, updated_at = CURRENT_TIMESTAMP WHERE id = $5 AND owner_id = $6 RETURNING *",
//       [name, repoUrl, buildCommand, outputDir, id, req.user.userId],
//     )

//     if (result.rows.length === 0) {
//       return res.status(404).json({ error: "Project not found" })
//     }

//     res.json({ data: result.rows[0] })
//   } catch (error) {
//     console.error("Update project error:", error)
//     res.status(500).json({ error: "Failed to update project" })
//   }
// })

// app.delete("/api/projects/:id", authenticateToken, async (req, res) => {
//   try {
//     const { id } = req.params
//     const result = await pool.query("DELETE FROM projects WHERE id = $1 AND owner_id = $2 RETURNING id", [
//       id,
//       req.user.userId,
//     ])

//     if (result.rows.length === 0) {
//       return res.status(404).json({ error: "Project not found" })
//     }

//     res.json({ success: true })
//   } catch (error) {
//     console.error("Delete project error:", error)
//     res.status(500).json({ error: "Failed to delete project" })
//   }
// })

// // Deployment routes
// app.post("/api/deployments", authenticateToken, async (req, res) => {
//   try {
//     const { projectId } = req.body

//     if (!projectId) {
//       return res.status(400).json({ error: "Project ID is required" })
//     }

//     // Get project details
//     const projectResult = await pool.query("SELECT * FROM projects WHERE id = $1 AND owner_id = $2", [
//       projectId,
//       req.user.userId,
//     ])

//     if (projectResult.rows.length === 0) {
//       return res.status(404).json({ error: "Project not found" })
//     }

//     const project = projectResult.rows[0]

//     // Create deployment record
//     const deploymentResult = await pool.query(
//       "INSERT INTO deployments (project_id, status) VALUES ($1, $2) RETURNING *",
//       [projectId, "pending"],
//     )

//     const deployment = deploymentResult.rows[0]

//     // Update project status
//     await pool.query("UPDATE projects SET status = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2", [
//       "building",
//       projectId,
//     ])

//     // Trigger deployment via deploy service
//     try {
//       const deployResponse = await axios.post(`${DEPLOY_SERVICE_URL}/deploy`, {
//         repoUrl: project.repo_url,
//         buildCommand: project.build_command,
//         projectId: project.id,
//       })

//       // Update deployment with deploy service ID
//       await pool.query("UPDATE deployments SET logs = $1 WHERE id = $2", [
//         `Deployment started with ID: ${deployResponse.data.deploymentId}`,
//         deployment.id,
//       ])

//       res.status(201).json({
//         data: {
//           ...deployment,
//           deployServiceId: deployResponse.data.deploymentId,
//         },
//       })
//     } catch (deployError) {
//       // Update deployment status to failed
//       await pool.query(
//         "UPDATE deployments SET status = $1, error_message = $2, completed_at = CURRENT_TIMESTAMP WHERE id = $3",
//         ["failed", "Failed to start deployment", deployment.id],
//       )

//       await pool.query("UPDATE projects SET status = $1 WHERE id = $2", ["failed", projectId])

//       throw deployError
//     }
//   } catch (error) {
//     console.error("Create deployment error:", error)
//     res.status(500).json({ error: "Failed to create deployment" })
//   }
// })

// app.get("/api/deployments", authenticateToken, async (req, res) => {
//   try {
//     const { projectId } = req.query

//     let query = `
//       SELECT d.*, p.name as project_name
//       FROM deployments d
//       JOIN projects p ON d.project_id = p.id
//       WHERE p.owner_id = $1
//     `
//     const params = [req.user.userId]

//     if (projectId) {
//       query += " AND d.project_id = $2"
//       params.push(projectId as string)
//     }

//     query += " ORDER BY d.started_at DESC"

//     const result = await pool.query(query, params)
//     res.json({ data: result.rows })
//   } catch (error) {
//     console.error("Get deployments error:", error)
//     res.status(500).json({ error: "Failed to get deployments" })
//   }
// })

// app.get("/api/deployments/:id", authenticateToken, async (req, res) => {
//   try {
//     const { id } = req.params
//     const result = await pool.query(
//       `SELECT d.*, p.name as project_name
//        FROM deployments d
//        JOIN projects p ON d.project_id = p.id
//        WHERE d.id = $1 AND p.owner_id = $2`,
//       [id, req.user.userId],
//     )

//     if (result.rows.length === 0) {
//       return res.status(404).json({ error: "Deployment not found" })
//     }

//     res.json({ data: result.rows[0] })
//   } catch (error) {
//     console.error("Get deployment error:", error)
//     res.status(500).json({ error: "Failed to get deployment" })
//   }
// })

// // Webhook endpoint for deploy service to update deployment status
// app.post("/api/deployments/:id/complete", async (req, res) => {
//   try {
//     const { id } = req.params
//     const { status, deploymentUrl, error } = req.body

//     // Update deployment
//     await pool.query(
//       "UPDATE deployments SET status = $1, deployment_url = $2, error_message = $3, completed_at = CURRENT_TIMESTAMP WHERE id = $4",
//       [status, deploymentUrl, error, id],
//     )

//     // Update project
//     const deploymentResult = await pool.query("SELECT project_id FROM deployments WHERE id = $1", [id])

//     if (deploymentResult.rows.length > 0) {
//       const projectId = deploymentResult.rows[0].project_id
//       await pool.query(
//         "UPDATE projects SET status = $1, deployment_url = $2, last_deployment = CURRENT_TIMESTAMP WHERE id = $3",
//         [status, deploymentUrl, projectId],
//       )
//     }

//     res.json({ success: true })
//   } catch (error) {
//     console.error("Complete deployment error:", error)
//     res.status(500).json({ error: "Failed to complete deployment" })
//   }
// })

app.listen(PORT, () => {
  console.log(`Request handler service running on port ${PORT}`)
})

export default app
