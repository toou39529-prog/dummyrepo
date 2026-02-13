// composables/useWallet.js
// PAYTACA-COMPATIBLE VERSION

import { ref, watch, nextTick } from 'vue'
import QRCodeUtil from 'qrcode'
import { useAPI } from '~/composables/useAPI'
import SignClient from '@walletconnect/sign-client'

export default defineNuxtPlugin(async () => {
  const signClient = await SignClient.init({
    projectId: '577d1c9b4c4d33ec97bb7f4b4accc2e7',
    metadata: {
      name: 'BlobKvhsin',
      description: 'P2P Lending Platform',
      url: 'https://blobkvhsin.com',
      icons: ['https://blobkvhsin.com/logo.png']
    }
  })
  
  return {
    provide: { signClient }
  }
})

export function useWallet() {
  const { walletApi } = useAPI()

  // ============== STATE ==============
  const isConnected = ref(false)
  const isConnecting = ref(false)
  const showConnectModal = ref(false)
  const showDropdown = ref(false)
  const showQRCode = ref(false)

  const qrCanvas = ref(null)
  const qrData = ref('')
  const qrExpiry = ref('05:00')
  const qrTimerRef = ref(null)
  const currentSessionId = ref('')

  const userAddress = ref('')
  const userBalance = ref('0.000')

  let balanceInterval = null
  let pollingInterval = null

  // ============== HELPERS ==============
  const shortenAddress = (address) => {
    if (!address) return ''
    const clean = address.replace('bitcoincash:', '')
    return `${clean.substring(0, 6)}...${clean.substring(clean.length - 4)}`
  }

  const formatBalance = (balance) => {
    const num = parseFloat(balance)
    return isNaN(num) ? '0.000' : num.toFixed(3)
  }

  const startQRTimer = () => {
    if (qrTimerRef.value) clearInterval(qrTimerRef.value)
    let timeLeft = 300 // 5 min
    qrTimerRef.value = setInterval(() => {
      if (timeLeft <= 0) {
        clearInterval(qrTimerRef.value)
        qrTimerRef.value = null
        qrExpiry.value = 'Expired'
        stopSessionPolling()
        return
      }
      const m = Math.floor(timeLeft / 60)
      const s = timeLeft % 60
      qrExpiry.value = `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`
      timeLeft--
    }, 1000)
  }

  const generateQRCode = async (uri) => {
    try {
      showQRCode.value = true
      await nextTick()
      if (!qrCanvas.value) throw new Error('QR canvas not found')
      
      console.log('Generating QR for:', uri)
      
      // Generate QR code with high error correction for better scanning
      await QRCodeUtil.toCanvas(qrCanvas.value, uri, {
        width: 320,  // Larger size for better scanning
        margin: 3,
        color: { 
          dark: '#000000', 
          light: '#FFFFFF' 
        },
        errorCorrectionLevel: 'H'  // High error correction
      })
      
      qrData.value = uri
      startQRTimer()
      
      console.log('QR Code generated successfully')
    } catch (err) {
      console.error('QR generation failed', err)
      qrData.value = ''
      alert('Failed to generate QR code: ' + err.message)
      throw err
    }
  }

  const handleQRBack = () => {
    showQRCode.value = false
    stopSessionPolling()
    if (qrTimerRef.value) clearInterval(qrTimerRef.value)
    qrTimerRef.value = null
    qrExpiry.value = '05:00'
    qrData.value = ''
    currentSessionId.value = ''
  }

  // ============== SESSION POLLING ==============
  const startSessionPolling = (sessionId) => {
    if (pollingInterval) clearInterval(pollingInterval)
    
    currentSessionId.value = sessionId
    
    console.log('Starting session polling for:', sessionId)
    
    // Poll every 2 seconds
    pollingInterval = setInterval(async () => {
      try {
        const status = await walletApi.checkSessionStatus(sessionId)
        
        console.log('Session status:', status.status)
        
        if (status.status === 'authenticated' && status.wallet_address) {
          // Success! Wallet connected
          console.log('Wallet authenticated!')
          stopSessionPolling()
          await handleWalletConnection(status.wallet_address)
        } else if (status.status === 'expired' || status.status === 'failed') {
          // Session failed
          stopSessionPolling()
          alert('Connection failed or expired. Please try again.')
          handleQRBack()
        }
      } catch (err) {
        console.error('Polling error:', err)
      }
    }, 2000)
  }

  const stopSessionPolling = () => {
    if (pollingInterval) {
      clearInterval(pollingInterval)
      pollingInterval = null
      console.log('Stopped session polling')
    }
  }

  // ============== BALANCE ==============
  const fetchBalance = async (address) => {
    try {
      const response = await walletApi.getBalance(address)
      return response?.balance || '0.000'
    } catch (err) {
      console.error('Failed to fetch balance', err)
      return '0.000'
    }
  }

  const startBalanceRefresh = () => {
    if (balanceInterval) clearInterval(balanceInterval)
    balanceInterval = setInterval(async () => {
      if (isConnected.value && userAddress.value) {
        const balance = await fetchBalance(userAddress.value)
        userBalance.value = balance
        localStorage.setItem('lend_wallet_balance', balance)
      }
    }, 30000)
  }

  const stopBalanceRefresh = () => {
    if (balanceInterval) {
      clearInterval(balanceInterval)
      balanceInterval = null
    }
  }

  // ============== WALLET CONNECTION ==============
  const startQRConnection = async () => {
    isConnecting.value = true
    try {
      console.log('Creating Paytaca connection session...')
      
      // Request backend to create a wallet session
      const session = await walletApi.createSession()
      
      if (!session?.session_id || !session?.auth_url) {
        throw new Error('Invalid session from backend')
      }

      console.log('Session created:', session.session_id)
      console.log('Auth URL format:', session.auth_url.substring(0, 50) + '...')

      localStorage.setItem('lend_pending_session', session.session_id)

      // Generate QR code with the Paytaca-compatible URL
      await generateQRCode(session.auth_url)

      // Start polling session status
      startSessionPolling(session.session_id)
      
    } catch (err) {
      console.error('Connection failed', err)
      alert('Failed to initiate wallet connection: ' + err.message)
    } finally {
      isConnecting.value = false
    }
  }

  // ============== HANDLE CONNECTION ==============
  const handleWalletConnection = async (address) => {
    console.log('Processing wallet connection for:', address)
    
    qrData.value = ''
    showQRCode.value = false

    isConnected.value = true
    userAddress.value = address
    showConnectModal.value = false
    isConnecting.value = false

    // Fetch initial balance
    console.log('Fetching balance...')
    const balance = await fetchBalance(address)
    userBalance.value = balance

    // Save to localStorage
    localStorage.setItem('lend_wallet_connected', 'true')
    localStorage.setItem('lend_wallet_address', address)
    localStorage.setItem('lend_wallet_balance', balance)
    localStorage.removeItem('lend_pending_session')

    console.log('Wallet connection complete!')

    startBalanceRefresh()
  }

  const disconnectWallet = async () => {
    isConnected.value = false
    userAddress.value = ''
    userBalance.value = '0.000'
    showDropdown.value = false
    showQRCode.value = false

    localStorage.removeItem('lend_wallet_connected')
    localStorage.removeItem('lend_wallet_address')
    localStorage.removeItem('lend_wallet_balance')
    localStorage.removeItem('lend_pending_session')

    stopBalanceRefresh()
    stopSessionPolling()
    if (qrTimerRef.value) clearInterval(qrTimerRef.value)
  }

  // ============== UI HELPERS ==============
  const toggleAccountDropdown = () => (showDropdown.value = !showDropdown.value)

  const copyAddress = async () => {
    try {
      await navigator.clipboard.writeText(userAddress.value)
      alert('Address copied!')
      showDropdown.value = false
    } catch {
      alert('Failed to copy address.')
    }
  }

  const viewOnExplorer = () => {
    if (!userAddress.value) return
    const clean = userAddress.value.replace('bitcoincash:', '')
    window.open(`https://explorer.bitcoin.com/bch/address/${clean}`, '_blank')
    showDropdown.value = false
  }

  const handleClickOutside = (event) => {
    const el = document.querySelector('.wallet-connected')
    if (el && !el.contains(event.target)) showDropdown.value = false
  }

  // ============== INITIALIZATION ==============
  const initializeWallet = () => {
    const connected = localStorage.getItem('lend_wallet_connected')
    const address = localStorage.getItem('lend_wallet_address')
    const balance = localStorage.getItem('lend_wallet_balance')

    if (connected && address) {
      isConnected.value = true
      userAddress.value = address
      userBalance.value = balance || '0.000'
      startBalanceRefresh()
      
      // Refresh balance on reconnect
      fetchBalance(address).then(bal => {
        userBalance.value = bal
        localStorage.setItem('lend_wallet_balance', bal)
      })
    }

    document.addEventListener('click', handleClickOutside)

    return () => {
      document.removeEventListener('click', handleClickOutside)
      stopBalanceRefresh()
      stopSessionPolling()
      if (qrTimerRef.value) clearInterval(qrTimerRef.value)
    }
  }

  watch(isConnected, (val) => {
    if (val) startBalanceRefresh()
    else stopBalanceRefresh()
  })

  // ============== RETURN ==============
  return {
    isConnected,
    isConnecting,
    showConnectModal,
    showDropdown,
    showQRCode,
    qrCanvas,
    qrData,
    qrExpiry,
    userAddress,
    userBalance,
    startQRConnection,
    disconnectWallet,
    toggleAccountDropdown,
    copyAddress,
    viewOnExplorer,
    handleQRBack,
    shortenAddress,
    formatBalance,
    initializeWallet
  }
}