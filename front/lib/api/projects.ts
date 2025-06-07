import axios from "axios"

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001"

const projectAxios = axios.create({
  baseURL: `${API_BASE_URL}/api/projects`,
  timeout: 10000,
})

// Add auth token to requests
projectAxios.interceptors.request.use((config) => {
  const token = localStorage.getItem("auth_token")
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// Add response interceptor for error handling
projectAxios.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("auth_token")
      window.location.href = "/auth/login"
    }
    return Promise.reject(error)
  },
)

export interface CreateProjectRequest {
  name: string
  repoUrl: string
  buildCommand: string
  outputDir: string
}

export const projectApi = {
  getProjects: async () => {
    const response = await projectAxios.get("/")
    return response
  },

  createProject: async (data: CreateProjectRequest) => {
    const response = await projectAxios.post("/", data)
    return response
  },

  getProject: async (id: string) => {
    const response = await projectAxios.get(`/${id}`)
    return response
  },

  updateProject: async (id: string, data: Partial<CreateProjectRequest>) => {
    const response = await projectAxios.put(`/${id}`, data)
    return response
  },

  deleteProject: async (id: string) => {
    const response = await projectAxios.delete(`/${id}`)
    return response
  },
}
