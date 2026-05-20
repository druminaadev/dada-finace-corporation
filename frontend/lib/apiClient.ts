import API_BASE_URL from './api'

interface RequestOptions extends RequestInit {
  token?: string
  skipRefresh?: boolean
}

class ApiClient {
  private baseURL: string
  private refreshTokenPromise: Promise<string> | null = null

  constructor(baseURL: string) {
    this.baseURL = baseURL
  }

  private buildURL(endpoint: string): string {
    if (/^https?:\/\//.test(endpoint)) {
      return endpoint
    }

    return `${this.baseURL}${endpoint}`
  }

  private getHeaders(token?: string): HeadersInit {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    }
    
    if (token) {
      headers['Authorization'] = `Bearer ${token}`
    }
    
    return headers
  }

  private async refreshAccessToken(): Promise<string> {
    if (this.refreshTokenPromise) {
      return this.refreshTokenPromise
    }

    this.refreshTokenPromise = (async () => {
      try {
        const stored = localStorage.getItem('nexzen-auth')
        if (!stored) throw new Error('No auth data')
        
        const { state } = JSON.parse(stored)
        const refreshToken = state?.refreshToken
        
        if (!refreshToken) throw new Error('No refresh token')

        const response = await fetch(this.buildURL('/api/auth/refresh'), {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ refreshToken }),
        })

        if (!response.ok) throw new Error('Refresh failed')

        const data = await response.json()
        const newAccessToken = data.data.accessToken
        const newRefreshToken = data.data.refreshToken

        // Update stored tokens
        const updated = JSON.parse(stored)
        updated.state.token = newAccessToken
        updated.state.refreshToken = newRefreshToken
        localStorage.setItem('nexzen-auth', JSON.stringify(updated))

        return newAccessToken
      } finally {
        this.refreshTokenPromise = null
      }
    })()

    return this.refreshTokenPromise
  }

  async request<T>(endpoint: string, options: RequestOptions = {}): Promise<T> {
    const { token, skipRefresh, ...fetchOptions } = options
    
    const config: RequestInit = {
      ...fetchOptions,
      headers: {
        ...this.getHeaders(token),
        ...fetchOptions.headers,
      },
    }

    try {
      const response = await fetch(this.buildURL(endpoint), config)
      
      if (response.status === 401 && !skipRefresh && !endpoint.includes('/auth/')) {
        try {
          const newToken = await this.refreshAccessToken()
          return this.request<T>(endpoint, { ...options, token: newToken, skipRefresh: true })
        } catch (refreshError) {
          if (typeof window !== 'undefined') {
            localStorage.removeItem('nexzen-auth')
            if (!window.location.pathname.includes('/login')) {
              window.location.href = '/login'
            }
          }
          throw new Error('Session expired. Please login again.')
        }
      }
      
      if (!response.ok) {
        const error = await response.json().catch(() => ({ message: 'Request failed' }))
        throw new Error(error.message || `HTTP ${response.status}`)
      }
      
      return await response.json()
    } catch (error) {
      console.error('API Request Error:', error)
      throw error
    }
  }

  async get<T>(endpoint: string, token?: string): Promise<T> {
    return this.request<T>(endpoint, { method: 'GET', token })
  }

  async post<T>(endpoint: string, data: unknown, token?: string): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: JSON.stringify(data),
      token,
    })
  }

  async put<T>(endpoint: string, data: unknown, token?: string): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'PUT',
      body: JSON.stringify(data),
      token,
    })
  }

  async delete<T>(endpoint: string, token?: string): Promise<T> {
    return this.request<T>(endpoint, { method: 'DELETE', token })
  }

  async uploadFile<T>(endpoint: string, file: File, token?: string): Promise<T> {
    const formData = new FormData()
    formData.append('file', file)

    const headers: HeadersInit = {}
    if (token) {
      headers['Authorization'] = `Bearer ${token}`
    }

    const response = await fetch(this.buildURL(endpoint), {
      method: 'POST',
      headers,
      body: formData,
    })

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Upload failed' }))
      throw new Error(error.message || `HTTP ${response.status}`)
    }

    return await response.json()
  }
}

export const apiClient = new ApiClient(API_BASE_URL)
