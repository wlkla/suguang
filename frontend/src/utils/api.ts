import axios from 'axios'
import type { LoginRequest, RegisterRequest, AuthResponse } from '../types/auth'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001/api'

// 创建axios实例
export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

// 请求拦截器 - 自动添加token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// 响应拦截器 - 处理错误
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token过期，清除本地存储
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

// 认证相关API
export const authApi = {
  // 用户注册
  register: async (data: RegisterRequest): Promise<AuthResponse> => {
    const response = await api.post('/auth/register', data)
    return response.data
  },

  // 用户登录
  login: async (data: LoginRequest): Promise<AuthResponse> => {
    const response = await api.post('/auth/login', data)
    return response.data
  },

  // 获取当前用户信息
  getMe: async () => {
    const response = await api.get('/auth/me')
    return response.data
  },
}

// 记忆记录相关API
export const memoryApi = {
  // 创建记忆记录
  create: async (data: {
    title?: string
    content: string
    mood?: number
    tags?: string
  }) => {
    const response = await api.post('/memory', data)
    return response.data
  },

  // 获取记忆记录列表
  getList: async (params: { page?: number; limit?: number } = {}) => {
    const response = await api.get('/memory', { params })
    return response.data
  },

  // 获取单个记忆记录
  getById: async (id: number) => {
    const response = await api.get(`/memory/${id}`)
    return response.data
  },

  // 搜索记忆记录
  search: async (query: string) => {
    const response = await api.get('/memory/search', { params: { q: query } })
    return response.data
  },

  // 删除记忆记录
  delete: async (id: number) => {
    const response = await api.delete(`/memory/${id}`)
    return response.data
  },
}

// 对话相关API
export const chatApi = {
  // 开始新对话
  start: async (memoryRecordId: number) => {
    const response = await api.post('/chat/start', { memoryRecordId })
    return response.data
  },

  // 发送消息
  sendMessage: async (conversationId: number, message: string) => {
    const response = await api.post(`/chat/${conversationId}/message`, { message })
    return response.data
  },

  // 获取对话列表
  getList: async () => {
    const response = await api.get('/chat')
    return response.data
  },

  // 获取对话详情
  getById: async (id: number) => {
    const response = await api.get(`/chat/${id}`)
    return response.data
  },
}

// 分析相关API
export const analysisApi = {
  // 生成分析
  generate: async (timeRange: string, analysisType: string = 'comprehensive') => {
    const response = await api.post('/analysis/generate', { timeRange, analysisType })
    return response.data
  },

  // 获取分析列表
  getList: async () => {
    const response = await api.get('/analysis')
    return response.data
  },

  // 获取分析详情
  getById: async (id: number) => {
    const response = await api.get(`/analysis/${id}`)
    return response.data
  },
}