import { v4 as uuidv4 } from "uuid"
import { queueService } from "./queueService"
import { sql } from "../config/database"

interface DeploymentData {
  repoUrl: string
  buildCommand: string
  projectId?: string
  userId: string
}

interface DeploymentStatus {
  id: string
  status: "pending" | "cloning" | "building" | "uploading" | "deployed" | "failed"
  logs: string[]
  startTime: Date
  endTime?: Date
  error?: string
  deploymentUrl?: string
}

class DeploymentService {
  private deploymentStatuses = new Map<string, DeploymentStatus>()

  async createDeployment(data: DeploymentData): Promise<string> {
    const deploymentId = uuidv4().substring(0, 8)

    // Initialize deployment status
    const deployment: DeploymentStatus = {
      id: deploymentId,
      status: "pending",
      logs: [],
      startTime: new Date(),
    }

    this.deploymentStatuses.set(deploymentId, deployment)

    // Add to database
    await sql`
      INSERT INTO deployments (id, project_id, status, logs)
      VALUES (${deploymentId}, ${data.projectId}, 'pending', 'Deployment queued')
    `

    // Add to queue
    await queueService.addToQueue({
      id: deploymentId,
      ...data,
    })

    await this.updateDeploymentStatus(deploymentId, "pending", "Deployment queued")

    return deploymentId
  }

  async updateDeploymentStatus(
    id: string,
    status: DeploymentStatus["status"],
    log?: string,
    error?: string,
  ): Promise<void> {
    const deployment = this.deploymentStatuses.get(id)
    if (deployment) {
      deployment.status = status
      if (log) deployment.logs.push(`[${new Date().toISOString()}] ${log}`)
      if (error) deployment.error = error
      if (status === "deployed" || status === "failed") {
        deployment.endTime = new Date()
      }

      // Update database
      await sql`
        UPDATE deployments 
        SET status = ${status}, logs = ${deployment.logs.join("\n")}, error_message = ${error}
        WHERE id = ${id}
      `
    }
  }

  async getDeploymentStatus(id: string): Promise<DeploymentStatus | null> {
    let deployment = this.deploymentStatuses.get(id)

    if (!deployment) {
      // Try to get from database
      const [stored] = await sql`
        SELECT * FROM deployments WHERE id = ${id}
      `

      if (stored) {
        deployment = {
          id: stored.id,
          status: stored.status,
          logs: stored.logs ? stored.logs.split("\n") : [],
          startTime: stored.started_at,
          endTime: stored.completed_at,
          error: stored.error_message,
          deploymentUrl: stored.deployment_url,
        }
        this.deploymentStatuses.set(id, deployment)
      }
    }

    return deployment || null
  }

  async getDeploymentLogs(id: string): Promise<any> {
    const deployment = await this.getDeploymentStatus(id)

    if (!deployment) {
      return null
    }

    return {
      deploymentId: id,
      logs: deployment.logs,
      status: deployment.status,
    }
  }

  async cancelDeployment(id: string): Promise<boolean> {
    const deployment = this.deploymentStatuses.get(id)

    if (!deployment) {
      return false
    }

    if (deployment.status === "deployed" || deployment.status === "failed") {
      return false
    }

    await this.updateDeploymentStatus(id, "failed", "Deployment cancelled by user")
    return true
  }
}

export const deploymentService = new DeploymentService()
