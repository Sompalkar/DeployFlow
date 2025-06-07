import express from "express"
import multer from "multer"
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3"
import { v4 as uuidv4 } from "uuid"
import path from "path"
import fs from "fs"
import type { AuthRequest } from "../middleware/auth"
import { sql } from "../config/database"

const router = express.Router()

// AWS S3 Configuration
const s3Client = new S3Client({
  region: process.env.AWS_REGION || "us-east-1",
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || "",
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || "",
  },
})

// Multer configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, "../../uploads")
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true })
    }
    cb(null, uploadDir)
  },
  filename: (req, file, cb) => {
    const uniqueName = `${uuidv4()}-${file.originalname}`
    cb(null, uniqueName)
  },
})

const upload = multer({
  storage,
  limits: {
    fileSize: 100 * 1024 * 1024, // 100MB limit
  },
})

// Helper functions
const getAllFiles = (dirPath: string, arrayOfFiles: string[] = []): string[] => {
  const files = fs.readdirSync(dirPath)

  files.forEach((file) => {
    const fullPath = path.join(dirPath, file)
    if (fs.statSync(fullPath).isDirectory()) {
      arrayOfFiles = getAllFiles(fullPath, arrayOfFiles)
    } else {
      arrayOfFiles.push(fullPath)
    }
  })

  return arrayOfFiles
}

const uploadToS3 = async (filePath: string, key: string): Promise<string> => {
  const fileContent = fs.readFileSync(filePath)
  const contentType = getContentType(path.extname(filePath))

  const command = new PutObjectCommand({
    Bucket: process.env.S3_BUCKET_NAME || "deployflow-uploads",
    Key: key,
    Body: fileContent,
    ContentType: contentType,
    ACL: "public-read",
  })

  await s3Client.send(command)
  return `https://${process.env.S3_BUCKET_NAME}.s3.amazonaws.com/${key}`
}

const getContentType = (ext: string): string => {
  const contentTypes: { [key: string]: string } = {
    ".html": "text/html",
    ".css": "text/css",
    ".js": "application/javascript",
    ".json": "application/json",
    ".png": "image/png",
    ".jpg": "image/jpeg",
    ".jpeg": "image/jpeg",
    ".gif": "image/gif",
    ".svg": "image/svg+xml",
    ".ico": "image/x-icon",
    ".woff": "font/woff",
    ".woff2": "font/woff2",
    ".ttf": "font/ttf",
    ".eot": "application/vnd.ms-fontobject",
  }
  return contentTypes[ext] || "application/octet-stream"
}

// Routes

// Upload single file
router.post("/file", upload.single("file"), async (req: AuthRequest, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded" })
    }

    const deploymentId = req.body.deploymentId || uuidv4()
    const s3Key = `deployments/${deploymentId}/${req.file.filename}`

    const s3Url = await uploadToS3(req.file.path, s3Key)

    // Log upload history
    await sql`
      INSERT INTO upload_history (user_id, deployment_id, file_name, file_url, file_size)
      VALUES (${req.user!.userId}, ${deploymentId}, ${req.file.originalname}, ${s3Url}, ${req.file.size})
    `

    // Clean up local file
    fs.unlinkSync(req.file.path)

    res.json({
      success: true,
      deploymentId,
      fileUrl: s3Url,
      fileName: req.file.originalname,
    })
  } catch (error) {
    console.error("Upload error:", error)
    res.status(500).json({ error: "Upload failed" })
  }
})

// Upload multiple files
router.post("/build", upload.array("files"), async (req: AuthRequest, res) => {
  try {
    if (!req.files || !Array.isArray(req.files) || req.files.length === 0) {
      return res.status(400).json({ error: "No files uploaded" })
    }

    const deploymentId = req.body.deploymentId || uuidv4()
    const uploadedFiles: string[] = []

    for (const file of req.files) {
      const s3Key = `deployments/${deploymentId}/${file.originalname}`
      const s3Url = await uploadToS3(file.path, s3Key)
      uploadedFiles.push(s3Url)

      // Log upload history
      await sql`
        INSERT INTO upload_history (user_id, deployment_id, file_name, file_url, file_size)
        VALUES (${req.user!.userId}, ${deploymentId}, ${file.originalname}, ${s3Url}, ${file.size})
      `

      // Clean up local file
      fs.unlinkSync(file.path)
    }

    res.json({
      success: true,
      deploymentId,
      uploadedFiles,
      count: uploadedFiles.length,
    })
  } catch (error) {
    console.error("Bulk upload error:", error)
    res.status(500).json({ error: "Bulk upload failed" })
  }
})

// Upload directory
router.post("/directory", async (req: AuthRequest, res) => {
  try {
    const { directoryPath, deploymentId } = req.body

    if (!directoryPath || !fs.existsSync(directoryPath)) {
      return res.status(400).json({ error: "Invalid directory path" })
    }

    const id = deploymentId || uuidv4()
    const allFiles = getAllFiles(directoryPath)
    const uploadedFiles: string[] = []

    for (const filePath of allFiles) {
      const relativePath = path.relative(directoryPath, filePath)
      const s3Key = `deployments/${id}/${relativePath}`
      const s3Url = await uploadToS3(filePath, s3Key)
      uploadedFiles.push(s3Url)

      // Log upload history
      const stats = fs.statSync(filePath)
      await sql`
        INSERT INTO upload_history (user_id, deployment_id, file_name, file_url, file_size)
        VALUES (${req.user!.userId}, ${id}, ${relativePath}, ${s3Url}, ${stats.size})
      `
    }

    res.json({
      success: true,
      deploymentId: id,
      uploadedFiles,
      count: uploadedFiles.length,
      baseUrl: `https://${process.env.S3_BUCKET_NAME}.s3.amazonaws.com/deployments/${id}/`,
    })
  } catch (error) {
    console.error("Directory upload error:", error)
    res.status(500).json({ error: "Directory upload failed" })
  }
})

// Get upload status
router.get("/status/:deploymentId", async (req: AuthRequest, res) => {
  try {
    const { deploymentId } = req.params

    const uploads = await sql`
      SELECT * FROM upload_history 
      WHERE deployment_id = ${deploymentId} AND user_id = ${req.user!.userId}
      ORDER BY created_at DESC
    `

    res.json({
      deploymentId,
      status: uploads.length > 0 ? "completed" : "not_found",
      uploads,
      totalFiles: uploads.length,
      totalSize: uploads.reduce((sum: number, upload: any) => sum + upload.file_size, 0),
    })
  } catch (error) {
    console.error("Status check error:", error)
    res.status(500).json({ error: "Status check failed" })
  }
})

export { router as uploadController }
