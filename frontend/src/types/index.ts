// Re-export all types from feature-specific files
export * from "./components.types";
export * from "./pricing.types";
export * from "./editor.types";

// User types
export type User = {
  email: string
  displayName?: string
  id?: string
}

export type Video = {
  id: string
  title: string
  description?: string
  duration?: string
  created?: string
  status: "completed" | "processing"
  thumbnail?: string
  tags?: string[]
}

export type GeneratedVideo = {
  id: string
  title: string
}

// Form types
export type LoginInput = {
  email: string
  password: string
}

export type SignupInput = {
  email: string
  password: string
  confirmPassword: string
}

// Auth state
export type AuthState = {
  user: User | null
  isLoading: boolean
  error: string | null
}
