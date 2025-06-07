import axios from "axios"

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001"

const deploymentAxios = axios.create({
  baseURL: `${API_BASE_URL}/api/deployments`,
  timeout: 30000, // Longer timeout for deployments
})

// Add auth token to requests
deploymentAxios.interceptors.request.use((config) => {
  const token = localStorage.getItem("auth_token")
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// Add response interceptor for error handling
deploymentAxios.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("auth_token")
      window.location.href = "/auth/login"
    }
    return Promise.reject(error)
  },
)

export const deploymentApi = {
  createDeployment: async (projectId: string) => {
    const response = await deploymentAxios.post("/", { projectId })
    return response
  },

  getDeployments: async (projectId?: string) => {
    const response = await deploymentAxios.get("/", {
      params: projectId ? { projectId } : {},
    })
    return response
  },

  getDeployment: async (id: string) => {
    const response = await deploymentAxios.get(`/${id}`)
    return response
  },

  getDeploymentLogs: async (id: string) => {
    const response = await deploymentAxios.get(`/${id}/logs`)
    return response
  },

  getDeploymentStatus: async (id: string) => {
    const response = await deploymentAxios.get(`/${id}/status`)
    return response
  },
}
