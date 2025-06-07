import express from "express"
import jwt from "jsonwebtoken"
import { body, validationResult } from "express-validator"
import User from "../models/User"

const router = express.Router()
const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key"

// Validation middleware
const validateRegister = [
  body("username").trim().isLength({ min: 3 }).withMessage("Username must be at least 3 characters"),
  body("email").isEmail().withMessage("Must be a valid email"),
  body("password").isLength({ min: 6 }).withMessage("Password must be at least 6 characters"),
]

const validateLogin = [
  body("email").isEmail().withMessage("Must be a valid email"),
  body("password").exists().withMessage("Password is required"),
]

// Register
router.post("/register", validateRegister, async (req, res) => {
  try {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() })
    }

    const { username, email, password } = req.body

    // Check if user exists
    const existingUser = await User.findOne({
      $or: [{ email }, { username }],
    })

    if (existingUser) {
      return res.status(400).json({ error: "User already exists" })
    }

    // Create user
    const user = new User({
      username,
      email,
      password,
    })

    await user.save()

    // Generate token
    const token = jwt.sign({ userId: user._id, username: user.username }, JWT_SECRET, { expiresIn: "7d" })

    res.status(201).json({
      user: {
        id: user._id,
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
router.post("/login", validateLogin, async (req, res) => {
  try {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() })
    }

    const { email, password } = req.body

    // Find user
    const user = await User.findOne({ email })

    if (!user) {
      return res.status(401).json({ error: "Invalid credentials" })
    }

    // Verify password
    const isValidPassword = await user.comparePassword(password)
    if (!isValidPassword) {
      return res.status(401).json({ error: "Invalid credentials" })
    }

    // Generate token
    const token = jwt.sign({ userId: user._id, username: user.username }, JWT_SECRET, { expiresIn: "7d" })

    res.json({
      user: {
        id: user._id,
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
    const user = await User.findById(decoded.userId).select("-password")

    if (!user) {
      return res.status(404).json({ error: "User not found" })
    }

    res.json({
      id: user._id,
      username: user.username,
      email: user.email,
      createdAt: user.createdAt,
    })
  } catch (error) {
    console.error("Profile error:", error)
    res.status(500).json({ error: "Failed to get profile" })
  }
})

export { router as authController }
