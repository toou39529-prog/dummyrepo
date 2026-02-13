// utils/paytaca.js

/**
 * Paytaca Wallet Integration
 * This module provides functions to interact with Paytaca Wallet
 */

// Check if Paytaca wallet is available
export const isPaytacaAvailable = () => {
  return typeof window !== 'undefined' && window.paytaca !== undefined
}

/**
 * Connect to Paytaca Wallet
 * @returns {Promise<Object>} Wallet object with address and network
 */
export const connectWallet = async () => {
  try {
    if (!isPaytacaAvailable()) {
      throw new Error('Paytaca Wallet not detected. Please install the Paytaca app.')
    }

    // Request connection to wallet
    const accounts = await window.paytaca.requestAccounts()
    
    if (!accounts || accounts.length === 0) {
      throw new Error('No accounts found. Please unlock your wallet.')
    }

    const address = accounts[0]
    const network = await getNetwork()

    return {
      address,
      network,
      isConnected: true
    }
  } catch (error) {
    console.error('Paytaca wallet connection failed:', error)
    throw error
  }
}

/**
 * Get current network
 * @returns {Promise<string>} Network name (mainnet, testnet, etc.)
 */
export const getNetwork = async () => {
  try {
    if (!isPaytacaAvailable()) {
      return 'unknown'
    }

    const network = await window.paytaca.getNetwork()
    return network || 'mainnet'
  } catch (error) {
    console.error('Failed to get network:', error)
    return 'unknown'
  }
}

/**
 * Get BCH balance for an address
 * @param {string} address - Bitcoin Cash address
 * @returns {Promise<string>} Balance in BCH
 */
export const getBalance = async (address) => {
  try {
    // In real implementation, you'd call Paytaca API or blockchain API
    // For now, return a mock balance
    const mockBalance = '1.254' // Replace with actual API call
    
    // Example using Bitcoin.com Explorer API:
    // const response = await fetch(`https://explorer.api.bitcoin.com/bch/v1/addr/${address}/balance`)
    // const satoshis = await response.json()
    // const balance = satoshis / 100000000 // Convert to BCH
    // return balance.toString()
    
    return mockBalance
  } catch (error) {
    console.error('Failed to get balance:', error)
    return '0.000'
  }
}

/**
 * Send BCH transaction
 * @param {string} to - Recipient address
 * @param {number} amount - Amount in BCH
 * @param {Object} options - Transaction options
 * @returns {Promise<string>} Transaction ID
 */
export const sendTransaction = async (to, amount, options = {}) => {
  try {
    if (!isPaytacaAvailable()) {
      throw new Error('Paytaca Wallet not available')
    }

    const satoshis = Math.floor(amount * 100000000) // Convert BCH to satoshis
    
    const txParams = {
      to,
      value: satoshis.toString(),
      ...options
    }

    const txId = await window.paytaca.sendTransaction(txParams)
    return txId
  } catch (error) {
    console.error('Transaction failed:', error)
    throw error
  }
}

/**
 * Sign a message
 * @param {string} message - Message to sign
 * @param {string} address - Address to sign with
 * @returns {Promise<string>} Signature
 */
export const signMessage = async (message, address) => {
  try {
    if (!isPaytacaAvailable()) {
      throw new Error('Paytaca Wallet not available')
    }

    const signature = await window.paytaca.signMessage(message, address)
    return signature
  } catch (error) {
    console.error('Message signing failed:', error)
    throw error
  }
}

/**
 * Get transaction history
 * @param {string} address - Bitcoin Cash address
 * @returns {Promise<Array>} Transaction history
 */
export const getTransactions = async (address) => {
  try {
    // Mock transaction data - replace with real API
    const mockTransactions = [
      {
        txid: 'abc123...',
        amount: 0.5,
        type: 'received',
        timestamp: Date.now() - 86400000,
        confirmations: 12
      },
      {
        txid: 'def456...',
        amount: 0.1,
        type: 'sent',
        timestamp: Date.now() - 172800000,
        confirmations: 24
      }
    ]
    
    // Example using Bitcoin.com Explorer API:
    // const response = await fetch(`https://explorer.api.bitcoin.com/bch/v1/txs/?address=${address}`)
    // const data = await response.json()
    // return data.txs
    
    return mockTransactions
  } catch (error) {
    console.error('Failed to get transactions:', error)
    return []
  }
}

/**
 * Disconnect wallet
 */
export const disconnectWallet = () => {
  // Paytaca doesn't have a disconnect method usually
  // We just clear local state
  if (typeof window !== 'undefined') {
    // Clear any stored wallet data
    localStorage.removeItem('paytaca_connected')
    localStorage.removeItem('paytaca_address')
  }
  
  return true
}

/**
 * Listen for wallet events
 * @param {string} event - Event name
 * @param {Function} callback - Callback function
 */
export const onWalletEvent = (event, callback) => {
  if (typeof window !== 'undefined' && window.paytaca) {
    window.paytaca.on(event, callback)
  }
}

/**
 * Get wallet capabilities
 * @returns {Promise<Object>} Wallet capabilities
 */
export const getWalletCapabilities = async () => {
  try {
    if (!isPaytacaAvailable()) {
      return { supports: [], network: 'unknown' }
    }

    const capabilities = await window.paytaca.getCapabilities()
    return capabilities || { supports: ['bch', 'tokens'], network: 'mainnet' }
  } catch (error) {
    console.error('Failed to get capabilities:', error)
    return { supports: [], network: 'unknown' }
  }
}

// Export as default object
export default {
  isPaytacaAvailable,
  connectWallet,
  getNetwork,
  getBalance,
  sendTransaction,
  signMessage,
  getTransactions,
  disconnectWallet,
  onWalletEvent,
  getWalletCapabilities
}