import simpleGit from "simple-git"
import { exec } from "child_process"
import { promisify } from "util"
import path from "path"
import fs from "fs"
import axios from "axios"
import { queueService } from "./queueService"
import { deploymentService } from "./deploymentService"

const execAsync = promisify(exec)
const git = simpleGit()

class DeploymentWorker {
  private isRunning = false

  async start(): Promise<void> {
    if (this.isRunning) return

    this.isRunning = true
    console.log("Deployment worker started")

    this.processQueue()
  }

  private async processQueue(): Promise<void> {
    while (this.isRunning) {
      try {
        const deploymentData = await queueService.getFromQueue()
        if (deploymentData) {
          await this.processDeployment(deploymentData)
        }
      } catch (error) {
        console.error("Queue processing error:", error)
        await new Promise((resolve) => setTimeout(resolve, 5000))
      }
    }
  }

  private async processDeployment(deploymentData: any): Promise<void> {
    const { id, repoUrl, buildCommand, projectId } = deploymentData

    try {
      await deploymentService.updateDeploymentStatus(id, "cloning", "Cloning repository...")
      const projectDir = await this.cloneRepository(repoUrl, id)

      await deploymentService.updateDeploymentStatus(id, "building", "Installing dependencies and building...")
      const buildDir = await this.buildProject(projectDir, buildCommand)

      await deploymentService.updateDeploymentStatus(id, "uploading", "Uploading build files...")
      const deploymentUrl = await this.uploadBuild(buildDir, id)

      await deploymentService.updateDeploymentStatus(id, "deployed", "Deployment completed successfully!")

      // Clean up temporary files
      fs.rmSync(projectDir, { recursive: true, force: true })

      // Notify request handler service
      const requestHandlerUrl = process.env.REQUEST_HANDLER_URL || "http://localhost:3001"
      await axios.post(`${requestHandlerUrl}/api/deployments/${id}/complete`, {
        status: "deployed",
        deploymentUrl,
      })
    } catch (error) {
      console.error(`Deployment ${id} failed:`, error)
      await deploymentService.updateDeploymentStatus(
        id,
        "failed",
        "Deployment failed",
        error instanceof Error ? error.message : "Unknown error",
      )

      // Notify request handler service of failure
      const requestHandlerUrl = process.env.REQUEST_HANDLER_URL || "http://localhost:3001"
      await axios.post(`${requestHandlerUrl}/api/deployments/${id}/complete`, {
        status: "failed",
        error: error instanceof Error ? error.message : "Unknown error",
      })
    }
  }

  private async cloneRepository(repoUrl: string, deploymentId: string): Promise<string> {
    const cloneDir = path.join(__dirname, "../../temp", deploymentId)

    if (fs.existsSync(cloneDir)) {
      fs.rmSync(cloneDir, { recursive: true, force: true })
    }

    fs.mkdirSync(cloneDir, { recursive: true })
    await git.clone(repoUrl, cloneDir)
    return cloneDir
  }

  private async buildProject(projectDir: string, buildCommand = "npm run build"): Promise<string> {
    // Install dependencies
    await execAsync("npm install", { cwd: projectDir })

    // Run build command
    await execAsync(buildCommand, { cwd: projectDir })

    // Return build output directory
    const possibleDirs = ["dist", "build", "out"]
    for (const dir of possibleDirs) {
      const buildDir = path.join(projectDir, dir)
      if (fs.existsSync(buildDir)) {
        return buildDir
      }
    }

    throw new Error("Build output directory not found")
  }

  private async uploadBuild(buildDir: string, deploymentId: string): Promise<string> {
    const uploadServiceUrl = process.env.UPLOAD_SERVICE_URL || "http://localhost:3002"

    try {
      const response = await axios.post(`${uploadServiceUrl}/api/upload/directory`, {
        directoryPath: buildDir,
        deploymentId,
      })

      return response.data.baseUrl
    } catch (error) {
      throw new Error(`Upload failed: ${error}`)
    }
  }

  stop(): void {
    this.isRunning = false
    console.log("Deployment worker stopped")
  }
}

export const deploymentWorker = new DeploymentWorker()
