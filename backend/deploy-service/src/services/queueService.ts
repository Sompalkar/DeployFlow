import { createClient } from "redis"

const redisClient = createClient({
  url: process.env.REDIS_URL || "redis://localhost:6379",
})

redisClient.connect().catch(console.error)

class QueueService {
  async addToQueue(deploymentData: any): Promise<void> {
    await redisClient.lPush("deployment-queue", JSON.stringify(deploymentData))
  }

  async getFromQueue(): Promise<any | null> {
    const result = await redisClient.brPop("deployment-queue", 5)
    return result ? JSON.parse(result.element) : null
  }

  async getQueueStatus(): Promise<any> {
    const queueLength = await redisClient.lLen("deployment-queue")

    return {
      queueLength,
      isHealthy: true,
    }
  }

  async getUserDeployments(userId: string): Promise<any[]> {
    // This would typically query the database for user's recent deployments
    // For now, return empty array
    return []
  }
}

export const queueService = new QueueService()
