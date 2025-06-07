import { atom } from "recoil"

export interface User {
  id: string
  username: string
  email: string
}

export interface AuthState {
  isAuthenticated: boolean
  user: User | null
  token: string | null
}

export interface Project {
  id: string
  name: string
  repoUrl: string
  status: "idle" | "building" | "deployed" | "failed"
  deploymentUrl?: string
  lastDeployment?: string
  buildCommand: string
  outputDir: string
}

export interface Deployment {
  id: string
  projectId: string
  status: "pending" | "building" | "deployed" | "failed"
  timestamp: string
  logs: string
  url?: string
}

export const authState = atom<AuthState>({
  key: "authState",
  default: {
    isAuthenticated: false,
    user: null,
    token: null,
  },
})

export const projectsState = atom<Project[]>({
  key: "projectsState",
  default: [],
})

export const deploymentsState = atom<Deployment[]>({
  key: "deploymentsState",
  default: [],
})
