import axios from "axios"

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001"

const authAxios = axios.create({
  baseURL: `${API_BASE_URL}/api/auth`,
  timeout: 10000,
})

export interface LoginRequest {
  email: string
  password: string
}

export interface RegisterRequest {
  username: string
  email: string
  password: string
}

export interface AuthResponse {
  user: {
    id: string
    username: string
    email: string
  }
  token: string
}

export const authApi = {
  login: async (data: LoginRequest): Promise<AuthResponse> => {
    const response = await authAxios.post("/login", data)
    return response.data
  },

  register: async (data: RegisterRequest): Promise<AuthResponse> => {
    const response = await authAxios.post("/register", data)
    return response.data
  },

  logout: async (): Promise<void> => {
    const token = localStorage.getItem("auth_token")
    if (token) {
      await authAxios.post(
        "/logout",
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      )
    }
    localStorage.removeItem("auth_token")
  },

  getProfile: async (token: string) => {
    const response = await authAxios.get("/profile", {
      headers: { Authorization: `Bearer ${token}` },
    })
    return response.data
  },
}
