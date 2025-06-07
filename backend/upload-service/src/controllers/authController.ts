import express from "express"
import bcrypt from "bcryptjs"
import jwt from "jsonwebtoken"
import { sql } from "../config/database"

const router = express.Router()
const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key"

// Register
router.post("/register", async (req, res) => {
  try {
    const { username, email, password } = req.body

    if (!username || !email || !password) {
      return res.status(400).json({ error: "All fields are required" })
    }

    // Check if user exists
    const existingUser = await sql`
      SELECT id FROM users WHERE email = ${email} OR username = ${username}
    `

    if (existingUser.length > 0) {
      return res.status(400).json({ error: "User already exists" })
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 10)

    // Create user
    const [user] = await sql`
      INSERT INTO users (username, email, password_hash)
      VALUES (${username}, ${email}, ${passwordHash})
      RETURNING id, username, email
    `

    // Generate token
    const token = jwt.sign({ userId: user.id, username: user.username }, JWT_SECRET, { expiresIn: "7d" })

    res.status(201).json({
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
      },
      token,
    })
  } catch (error) {
    console.error("Registration error:", error)
    res.status(500).json({ error: "Registration failed" })
  }
})

// Login
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body

    if (!email || !password) {
      return res.status(400).json({ error: "Email and password are required" })
    }

    // Find user
    const [user] = await sql`
      SELECT id, username, email, password_hash FROM users WHERE email = ${email}
    `

    if (!user) {
      return res.status(401).json({ error: "Invalid credentials" })
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.password_hash)
    if (!isValidPassword) {
      return res.status(401).json({ error: "Invalid credentials" })
    }

    // Generate token
    const token = jwt.sign({ userId: user.id, username: user.username }, JWT_SECRET, { expiresIn: "7d" })

    res.json({
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
      },
      token,
    })
  } catch (error) {
    console.error("Login error:", error)
    res.status(500).json({ error: "Login failed" })
  }
})

// Get profile
router.get("/profile", async (req, res) => {
  try {
    const authHeader = req.headers["authorization"]
    const token = authHeader && authHeader.split(" ")[1]

    if (!token) {
      return res.status(401).json({ error: "Access token required" })
    }

    const decoded = jwt.verify(token, JWT_SECRET) as any
    const [user] = await sql`
      SELECT id, username, email, created_at FROM users WHERE id = ${decoded.userId}
    `

    if (!user) {
      return res.status(404).json({ error: "User not found" })
    }

    res.json(user)
  } catch (error) {
    console.error("Profile error:", error)
    res.status(500).json({ error: "Failed to get profile" })
  }
})

export { router as authController }
