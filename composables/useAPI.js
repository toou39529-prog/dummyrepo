// composables/useAPI.js
export const useAPI = () => {
  const config = useRuntimeConfig()
  const baseURL = config.public.apiBaseUrl || 'http://127.0.0.1:8000/api'
  
  // Helper for making API calls
  const apiRequest = async (endpoint, options = {}) => {
    try {
      const response = await $fetch(`${baseURL}${endpoint}`, {
        headers: {
          'Content-Type': 'application/json',
        },
        ...options
      })
      return response
    } catch (error) {
      console.error('API Error:', error)
      throw error
    }
  }
  
  // Wallet APIs
  const walletApi = {
    // Create new wallet session for QR
    async createSession() {
      return await apiRequest('/wallet/session/create/', {
        method: 'POST'
      })
    },
    
    // Check session status (called by polling)
    async checkSessionStatus(sessionId) {
      return await apiRequest(`/wallet/session/status/${sessionId}/`)
    },
    
    // Get wallet balance
    async getBalance(address) {
      return await apiRequest(`/wallet/balance/?address=${encodeURIComponent(address)}`)
    },
    
    // Manually authenticate a session (optional - for manual signature input)
    async authenticateSession(sessionId, walletAddress, signature) {
      return await apiRequest(`/wallet/session/authenticate/${sessionId}/`, {
        method: 'POST',
        body: JSON.stringify({
          wallet_address: walletAddress,
          signature: signature
        })
      })
    }
  }
  
  // User APIs
  const userApi = {
    async login(email, password) {
      return await apiRequest('/token/', {
        method: 'POST',
        body: { email, password }
      })
    },
    
    async refreshToken() {
      const refreshToken = localStorage.getItem('refresh_token')
      return await apiRequest('/token/refresh/', {
        method: 'POST',
        body: { refresh: refreshToken }
      })
    }
  }
  
  return {
    walletApi,
    userApi,
    apiRequest
  }
}