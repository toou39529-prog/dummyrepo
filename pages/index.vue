<template>
  <div class="homepage">
    <!-- Navigation Header -->
    <header class="navbar">
      <div class="container">
        <div class="nav-content">
          <!-- Logo -->
          <div class="logo">
            <span class="logo-text">Lend</span>
            <span class="logo-dot">.</span>
          </div>

          <!-- Wallet Section -->
          <div class="nav-wallet">
            <!-- When NOT connected -->
            <div v-if="!isConnected" class="wallet-disconnected">
              <button 
                @click="showConnectModal = true"
                class="wallet-icon-btn"
                title="Connect Paytaca Wallet"
              >
                <svg class="wallet-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path d="M21 12V7H5a2 2 0 0 1 0-4h14v4" stroke-width="2"/>
                  <path d="M3 5v14a2 2 0 0 0 2 2h16v-5" stroke-width="2"/>
                  <path d="M18 12a2 2 0 0 0 0 4h4v-4Z" stroke-width="2"/>
                </svg>
              </button>
              <span class="wallet-tooltip">Connect Wallet</span>
            </div>

            <!-- When CONNECTED -->
            <div v-else class="wallet-connected">
              <div class="account-info" @click="toggleAccountDropdown">
                <div class="account-avatar">
                  {{ userAddress.substring(0, 2).toUpperCase() }}
                </div>
                
                <div class="account-details">
                  <div class="account-balance">{{ formatBalance(userBalance) }} BCH</div>
                  <div class="account-address">{{ shortenAddress(userAddress) }}</div>
                </div>
                
                <svg class="dropdown-arrow" :class="{ 'rotated': showDropdown }" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <polyline points="6 9 12 15 18 9" stroke-width="2"/>
                </svg>
              </div>

              <!-- Dropdown Menu -->
              <div v-if="showDropdown" class="account-dropdown">
                <div class="dropdown-section">
                  <div class="dropdown-label">Connected with</div>
                  <div class="dropdown-value">Paytaca Wallet</div>
                </div>
                
                <div class="dropdown-section">
                  <div class="dropdown-label">Address</div>
                  <div class="dropdown-address">{{ userAddress }}</div>
                </div>
                
                <div class="dropdown-divider"></div>
                
                <button @click="copyAddress" class="dropdown-btn">
                  <svg class="dropdown-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <rect x="9" y="9" width="13" height="13" rx="2" stroke-width="2"/>
                    <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" stroke-width="2"/>
                  </svg>
                  Copy Address
                </button>
                
                <button @click="viewOnExplorer" class="dropdown-btn">
                  <svg class="dropdown-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <circle cx="12" cy="12" r="10" stroke-width="2"/>
                    <line x1="2" y1="12" x2="22" y2="12" stroke-width="2"/>
                    <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" stroke-width="2"/>
                  </svg>
                  View on Explorer
                </button>
                
                <div class="dropdown-divider"></div>
                
                <button @click="disconnectWallet" class="dropdown-btn disconnect">
                  <svg class="dropdown-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" stroke-width="2"/>
                    <polyline points="16 17 21 12 16 7" stroke-width="2"/>
                    <line x1="21" y1="12" x2="9" y2="12" stroke-width="2"/>
                  </svg>
                  Disconnect Wallet
                </button>
              </div>
            </div>
          </div>

          <!-- Desktop Menu -->
          <nav class="nav-menu">
            <a href="#" class="nav-link active">Home</a>
            <a href="#features" class="nav-link">Features</a>
            <a href="#how-it-works" class="nav-link">How It Works</a>
            <a href="#" class="nav-link">About</a>
          </nav>

          <!-- Mobile menu button -->
          <button class="mobile-menu-btn">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <line x1="3" y1="12" x2="21" y2="12" stroke-width="2"/>
              <line x1="3" y1="6" x2="21" y2="6" stroke-width="2"/>
              <line x1="3" y1="18" x2="21" y2="18" stroke-width="2"/>
            </svg>
          </button>
        </div>
      </div>
    </header>

    <!-- Connect Wallet Modal -->
    <div v-if="showConnectModal" class="modal-overlay" @click="showConnectModal = false">
      <div class="modal-content" @click.stop>
        <!-- STEP 1: Wallet Selection -->
        <div v-if="!showQRCode" class="wallet-selection-view">
          <div class="modal-header">
            <h3 class="modal-title">Connect Wallet</h3>
            <button @click="showConnectModal = false" class="modal-close">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <line x1="18" y1="6" x2="6" y2="18" stroke-width="2"/>
                <line x1="6" y1="6" x2="18" y2="18" stroke-width="2"/>
              </svg>
            </button>
          </div>
          
          <div class="modal-body">
            <p class="modal-description">
              Connect your Paytaca wallet to use Lend
            </p>
            
            <button @click="startQRConnection" class="wallet-option" :disabled="isConnecting">
              <div class="wallet-option-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path d="M21 12V7H5a2 2 0 0 1 0-4h14v4" stroke-width="2"/>
                  <path d="M3 5v14a2 2 0 0 0 2 2h16v-5" stroke-width="2"/>
                  <path d="M18 12a2 2 0 0 0 0 4h4v-4Z" stroke-width="2"/>
                </svg>
              </div>
              <div class="wallet-option-info">
                <div class="wallet-option-name">Paytaca Wallet</div>
                <div class="wallet-option-description">Bitcoin Cash & SmartBCH</div>
              </div>
              <div v-if="isConnecting" class="wallet-option-loading">
                <div class="spinner"></div>
              </div>
              <svg v-else class="wallet-option-arrow" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <line x1="5" y1="12" x2="19" y2="12" stroke-width="2"/>
                <polyline points="12 5 19 12 12 19" stroke-width="2"/>
              </svg>
            </button>
            
            <button v-if="paytacaAvailable" @click="connectBrowserExtension" class="wallet-option extension">
              <div class="wallet-option-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" stroke-width="2"/>
                </svg>
              </div>
              <div class="wallet-option-info">
                <div class="wallet-option-name">Browser Extension</div>
                <div class="wallet-option-description">Connect via Paytaca Extension</div>
              </div>
            </button>
          </div>
        </div>
        
        <!-- STEP 2: QR Code View -->
        <div v-else class="qr-view">
          <div class="modal-header">
            <button @click="handleQRBack" class="back-btn">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" width="16" height="16">
                <line x1="19" y1="12" x2="5" y2="12" stroke-width="2"/>
                <polyline points="12 19 5 12 12 5" stroke-width="2"/>
              </svg>
              Back
            </button>
            <h3 class="modal-title">Scan QR Code</h3>
            <button @click="showConnectModal = false" class="modal-close">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <line x1="18" y1="6" x2="6" y2="18" stroke-width="2"/>
                <line x1="6" y1="6" x2="18" y2="18" stroke-width="2"/>
              </svg>
            </button>
          </div>
          
          <div class="modal-body">
            <div class="qr-container-improved">
              <div class="qr-frame">
                <canvas ref="qrCanvas" v-show="qrData" class="qr-canvas-improved"></canvas>
                
                <div v-if="!qrData" class="qr-loading-improved">
                  <div class="spinner-large"></div>
                  <p>Generating QR code...</p>
                </div>
              </div>
              
              <div v-if="qrExpiry && qrData" class="qr-timer-badge">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" class="timer-icon">
                  <circle cx="12" cy="12" r="10" stroke-width="2"/>
                  <polyline points="12 6 12 12 16 14" stroke-width="2"/>
                </svg>
                {{ qrExpiry }}
              </div>
            </div>
            
            <div v-if="qrData" class="qr-instructions-improved">
              <h4 class="instructions-title">How to connect:</h4>
              
              <div class="instruction-step">
                <div class="step-number-badge">1</div>
                <div class="step-text">
                  <strong>Open Paytaca app</strong>
                  <span>Launch the Paytaca wallet on your phone</span>
                </div>
              </div>
              
              <div class="instruction-step">
                <div class="step-number-badge">2</div>
                <div class="step-text">
                  <strong>Tap "Scan"</strong>
                  <span>Find the scan button in the app</span>
                </div>
              </div>
              
              <div class="instruction-step">
                <div class="step-number-badge">3</div>
                <div class="step-text">
                  <strong>Scan this QR code</strong>
                  <span>Point your camera at the code above</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Hero Section -->
    <section class="hero">
      <div class="container">
        <div class="hero-content">
          <div class="hero-badge">
            <svg class="badge-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <polyline points="20 6 9 17 4 12" stroke-width="2.5"/>
            </svg>
            100% Secure & Trustless
          </div>

          <h1 class="hero-title">
            Your Partner in<br>
            Smarter <span class="title-highlight">Financial</span><br>
            Decisions
          </h1>
          
          <p class="hero-description">
            Secure peer-to-peer lending powered by Bitcoin Cash smart contracts. 
            Borrow stablecoins with BCH collateral or earn interest by lending 
            — all in one secure platform.
          </p>

          <div class="hero-buttons">
            <button class="btn-primary">
              Get Started Now
              <svg class="btn-arrow" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <line x1="5" y1="12" x2="19" y2="12" stroke-width="2"/>
                <polyline points="12 5 19 12 12 19" stroke-width="2"/>
              </svg>
            </button>
            <button class="btn-secondary">
              <svg class="play-icon" viewBox="0 0 24 24" fill="currentColor">
                <circle cx="12" cy="12" r="10" opacity="0.2"/>
                <polygon points="10 8 16 12 10 16 10 8" fill="currentColor"/>
              </svg>
              Watch Demo
            </button>
          </div>

          <div class="stats-bar">
            <div class="stat-item">
              <div class="stat-value">$2.5M+</div>
              <div class="stat-label">Total Locked</div>
            </div>
            <div class="stat-divider"></div>
            <div class="stat-item">
              <div class="stat-value">1,200+</div>
              <div class="stat-label">Active Loans</div>
            </div>
            <div class="stat-divider"></div>
            <div class="stat-item">
              <div class="stat-value">8.5%</div>
              <div class="stat-label">Avg. APY</div>
            </div>
          </div>
        </div>
      </div>

      <div class="hero-bg">
        <div class="gradient-blob blob-1"></div>
        <div class="gradient-blob blob-2"></div>
      </div>
    </section>

    <!-- Features Section -->
    <section id="features" class="features">
      <div class="container">
        <div class="section-header">
          <div class="section-badge">Features</div>
          <h2 class="section-title">
            Why Choose Lend<span class="title-dot">.</span>
          </h2>
          <p class="section-description">
            Achieve financial clarity and take control of your future with tools 
            designed to simplify and personalize your money management.
          </p>
        </div>

        <div class="features-grid">
          <div class="feature-card">
            <div class="feature-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" stroke-width="2"/>
              </svg>
            </div>
            <h3 class="feature-title">Trustless & Secure</h3>
            <p class="feature-description">
              Smart contracts hold collateral. No middlemen, no trust needed. 
              Your funds are protected by blockchain technology.
            </p>
          </div>

          <div class="feature-card">
            <div class="feature-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <circle cx="12" cy="12" r="10" stroke-width="2"/>
                <polyline points="12 6 12 12 16 14" stroke-width="2"/>
              </svg>
            </div>
            <h3 class="feature-title">Instant Matching</h3>
            <p class="feature-description">
              Get matched with lenders in seconds. Set your terms and 
              start borrowing or lending immediately.
            </p>
          </div>

          <div class="feature-card">
            <div class="feature-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <line x1="12" y1="1" x2="12" y2="23" stroke-width="2"/>
                <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" stroke-width="2"/>
              </svg>
            </div>
            <h3 class="feature-title">Competitive Rates</h3>
            <p class="feature-description">
              Market-driven interest rates. Lenders compete for your business, 
              ensuring you get the best deals.
            </p>
          </div>

          <div class="feature-card">
            <div class="feature-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <rect x="3" y="11" width="18" height="11" rx="2" stroke-width="2"/>
                <path d="M7 11V7a5 5 0 0 1 10 0v4" stroke-width="2"/>
              </svg>
            </div>
            <h3 class="feature-title">Over-Collateralized</h3>
            <p class="feature-description">
              Lenders are protected with 120-200% collateral ratios. 
              Auto-liquidation keeps everyone safe.
            </p>
          </div>
        </div>
      </div>
    </section>

    <!-- How It Works Section -->
    <section id="how-it-works" class="how-it-works">
      <div class="container">
        <div class="section-header">
          <div class="section-badge">Process</div>
          <h2 class="section-title">How It Works</h2>
          <p class="section-description">
            Get started in just 3 simple steps. No complicated setup required.
          </p>
        </div>

        <div class="steps-grid">
          <div class="step-card">
            <div class="step-number">01</div>
            <div class="step-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path d="M21 12V7H5a2 2 0 0 1 0-4h14v4" stroke-width="2"/>
                <path d="M3 5v14a2 2 0 0 0 2 2h16v-5" stroke-width="2"/>
                <path d="M18 12a2 2 0 0 0 0 4h4v-4Z" stroke-width="2"/>
              </svg>
            </div>
            <h3 class="step-title">Connect Wallet</h3>
            <p class="step-description">
              Scan QR code with Paytaca wallet. No passwords, no hassle. 
              Your wallet, your control.
            </p>
          </div>

          <div class="step-card">
            <div class="step-number">02</div>
            <div class="step-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <rect x="2" y="7" width="20" height="14" rx="2" stroke-width="2"/>
                <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" stroke-width="2"/>
              </svg>
            </div>
            <h3 class="step-title">Set Your Terms</h3>
            <p class="step-description">
              Choose to borrow or lend. Set your own rates and durations. 
              Get matched instantly with the best offers.
            </p>
          </div>

          <div class="step-card">
            <div class="step-number">03</div>
            <div class="step-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" stroke-width="2"/>
              </svg>
            </div>
            <h3 class="step-title">Earn or Borrow</h3>
            <p class="step-description">
              Smart contracts handle everything automatically. 
              Earn interest or unlock collateral with confidence.
            </p>
          </div>
        </div>
      </div>
    </section>

    <!-- CTA Section -->
    <section class="cta">
      <div class="container">
        <div class="cta-card">
          <div class="cta-content">
            <h2 class="cta-title">
              Ready to Take Control<br>
              of Your Finances?
            </h2>
            <p class="cta-description">
              Join thousands of users who are already earning and borrowing 
              with confidence. Start your journey today.
            </p>
            <button class="btn-cta">
              Get Started Now
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <line x1="5" y1="12" x2="19" y2="12" stroke-width="2"/>
                <polyline points="12 5 19 12 12 19" stroke-width="2"/>
              </svg>
            </button>
          </div>
          <div class="cta-visual">
            <div class="cta-stat">
              <div class="cta-stat-value">$2.5M+</div>
              <div class="cta-stat-label">Total Value Locked</div>
            </div>
            <div class="cta-stat">
              <div class="cta-stat-value">1,200+</div>
              <div class="cta-stat-label">Happy Users</div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Footer -->
    <footer class="footer">
      <div class="container">
        <div class="footer-content">
          <div class="footer-brand">
            <div class="logo">
              <span class="logo-text">Lend</span>
              <span class="logo-dot">.</span>
            </div>
            <p class="footer-description">
              Secure P2P lending powered by Bitcoin Cash smart contracts.
            </p>
          </div>

          <div class="footer-links">
            <div class="footer-column">
              <h4 class="footer-heading">Product</h4>
              <a href="#" class="footer-link">Features</a>
              <a href="#" class="footer-link">How It Works</a>
              <a href="#" class="footer-link">Security</a>
              <a href="#" class="footer-link">Pricing</a>
            </div>

            <div class="footer-column">
              <h4 class="footer-heading">Company</h4>
              <a href="#" class="footer-link">About</a>
              <a href="#" class="footer-link">Blog</a>
              <a href="#" class="footer-link">Careers</a>
              <a href="#" class="footer-link">Contact</a>
            </div>

            <div class="footer-column">
              <h4 class="footer-heading">Legal</h4>
              <a href="#" class="footer-link">Privacy</a>
              <a href="#" class="footer-link">Terms</a>
              <a href="#" class="footer-link">Cookies</a>
              <a href="#" class="footer-link">Licenses</a>
            </div>
          </div>
        </div>

        <div class="footer-bottom">
          <p>&copy; 2024 Lend. All rights reserved.</p>
          <div class="footer-social">
            <a href="#" class="social-link">Twitter</a>
            <a href="#" class="social-link">Discord</a>
            <a href="#" class="social-link">GitHub</a>
          </div>
        </div>
      </div>
    </footer>
  </div>
</template>

<script setup>
import { onMounted, onUnmounted } from 'vue'
import { useWallet } from '~/composables/useWallet-simple'
import { useAPI } from '@/composables/useAPI'

const {
  isConnected,
  isConnecting,
  showConnectModal,
  showDropdown,
  showQRCode,
  paytacaAvailable,
  qrCanvas,
  qrData,
  qrExpiry,
  userAddress,
  userBalance,
  startQRConnection,
  connectBrowserExtension,
  disconnectWallet,
  toggleAccountDropdown,
  copyAddress,
  viewOnExplorer,
  handleQRBack,
  shortenAddress,
  formatBalance,
  initializeWallet
} = useWallet()

let cleanup
onMounted(() => {
  cleanup = initializeWallet()
})

onUnmounted(() => {
  if (cleanup) cleanup()
})
</script>

<style scoped>
/* ===================================
   FONTS & VARIABLES
   =================================== */

@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap');

:root {
  --primary: #6366f1;
  --primary-dark: #4f46e5;
  --text-dark: #0f172a;
  --text-gray: #64748b;
  --text-light: #94a3b8;
  --bg-white: #ffffff;
  --bg-gray: #f8fafc;
  --border: #e2e8f0;
  --shadow: rgba(0, 0, 0, 0.08);
}

* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

.homepage {
  background: var(--bg-white);
  color: var(--text-dark);
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
  overflow-x: hidden;
}

.container {
  max-width: 1280px;
  margin: 0 auto;
  padding: 0 24px;
}

/* ===================================
   NAVIGATION
   =================================== */

.navbar {
  position: sticky;
  top: 0;
  background: rgba(255, 255, 255, 0.8);
  backdrop-filter: blur(12px);
  border-bottom: 1px solid var(--border);
  z-index: 100;
  padding: 20px 0;
}

.nav-content {
   display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
}

.logo {
  font-size: 28px;
  font-weight: 900;
  display: flex;
  align-items: center;
  letter-spacing: -0.02em;
  order: 1; /* First item */
}

.logo-text {
  color: var(--text-dark);
}

.logo-dot {
  color: var(--primary);
}

.nav-menu {
  display: flex;
  gap: 40px;
  align-items: center;
  order: 2; /* Second item */
  margin-left: 650px;
}

.nav-link {
  color: var(--text-gray);
  text-decoration: none;
  font-size: 15px;
  font-weight: 500;
  transition: color 0.2s;
  position: relative;
}

.nav-link:hover,
.nav-link.active {
  color: var(--text-dark);
}

.nav-link.active::after {
  content: '';
  position: absolute;
  bottom: -8px;
  left: 0;
  right: 0;
  height: 2px;
  background: var(--primary);
  border-radius: 2px;
}
/* Wallet Icon Button */
.wallet-icon-btn {
  background: #000000;
  color: white;
  border: none;
  border-radius: 10px;
  width: 48px;
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s;
  padding: 0;
}

.wallet-icon-btn:hover {
  background: #333333;
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.wallet-icon {
  width: 24px;
  height: 24px;
  stroke: white;
  stroke-linecap: round;
  stroke-linejoin: round;

   
}
.mobile-menu-btn {
  display: none;
  background: none;
  border: none;
  cursor: pointer;
  padding: 8px;
}

.mobile-menu-btn svg {
  width: 24px;
  height: 24px;
  stroke: var(--text-dark);
  stroke-linecap: round;
}

/* ===================================
   HERO SECTION
   =================================== */

.hero {
  position: relative;
  padding: 120px 0 100px;
  overflow: hidden;
  background: linear-gradient(180deg, #faf5ff 0%, #ffffff 50%);
}

.hero-content {
  max-width: 720px;
  position: relative;
  z-index: 2;
}

.hero-badge {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 10px 18px;
  background: white;
  border: 1px solid var(--border);
  border-radius: 100px;
  font-size: 14px;
  font-weight: 600;
  color: var(--text-dark);
  margin-bottom: 32px;
  box-shadow: 0 2px 8px var(--shadow);
}

.badge-icon {
  width: 16px;
  height: 16px;
  stroke: var(--primary);
  stroke-linecap: round;
  stroke-linejoin: round;
}

.hero-title {
  font-size: clamp(48px, 7vw, 84px);
  font-weight: 900;
  line-height: 1.05;
  margin-bottom: 28px;
  letter-spacing: -0.03em;
  color: var(--text-dark);
}

.title-highlight {
  background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.title-dot {
  color: var(--primary);
}

.hero-description {
  font-size: 19px;
  line-height: 1.7;
  color: var(--text-gray);
  margin-bottom: 40px;
  max-width: 600px;
}

.hero-buttons {
  display: flex;
  gap: 16px;
  margin-bottom: 64px;
  flex-wrap: wrap;
}

.btn-primary {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  padding: 18px 36px;
  background: var(--text-dark);
  color: dar;
  border: none;
  border-radius: 12px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  box-shadow: 0 4px 14px rgba(15, 23, 42, 0.3);
}

.btn-primary:hover {
  background: #1e293b;
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(15, 23, 42, 0.4);
}

.btn-arrow {
  width: 18px;
  height: 18px;
  stroke-linecap: round;
  stroke-linejoin: round;
}

.btn-secondary {
  display: inline-flex;
  align-items: center;
  gap: 12px;
  padding: 18px 36px;
  background: white;
  color: var(--text-dark);
  border: 1.5px solid var(--border);
  border-radius: 12px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-secondary:hover {
  border-color: var(--text-dark);
  background: var(--bg-gray);
}

.play-icon {
  width: 20px;
  height: 20px;
}

.stats-bar {
  display: flex;
  align-items: center;
  gap: 48px;
  flex-wrap: wrap;
}

.stat-item {
  text-align: left;
}

.stat-value {
  font-size: 32px;
  font-weight: 800;
  color: var(--text-dark);
  margin-bottom: 4px;
  letter-spacing: -0.02em;
}

.stat-label {
  font-size: 14px;
  color: var(--text-light);
  font-weight: 500;
}

.stat-divider {
  width: 1px;
  height: 32px;
  background: var(--border);
}

/* Hero Background Gradient */
.hero-bg {
  position: absolute;
  top: 0;
  right: 0;
  width: 60%;
  height: 100%;
  z-index: 0;
  pointer-events: none;
}

.gradient-blob {
  position: absolute;
  border-radius: 50%;
  filter: blur(100px);
  opacity: 0.6;
}

.blob-1 {
  width: 600px;
  height: 600px;
  background: linear-gradient(135deg, #c7d2fe 0%, #ddd6fe 100%);
  top: -200px;
  right: -200px;
}

.blob-2 {
  width: 400px;
  height: 400px;
  background: linear-gradient(135deg, #fae8ff 0%, #f5d0fe 100%);
  bottom: -100px;
  right: 100px;
}

/* ===================================
   FEATURES SECTION
   =================================== */

.features {
  padding: 120px 0;
  background: white;
}

.section-header {
  max-width: 720px;
  margin: 0 auto 72px;
  text-align: center;
}

.section-badge {
  display: inline-block;
  padding: 8px 16px;
  background: var(--bg-gray);
  border-radius: 100px;
  font-size: 13px;
  font-weight: 600;
  color: var(--text-gray);
  text-transform: uppercase;
  letter-spacing: 0.05em;
  margin-bottom: 20px;
}

.section-title {
  font-size: clamp(36px, 5vw, 56px);
  font-weight: 900;
  line-height: 1.1;
  margin-bottom: 20px;
  letter-spacing: -0.02em;
  color: var(--text-dark);
}

.section-description {
  font-size: 18px;
  line-height: 1.7;
  color: var(--text-gray);
}

.features-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 32px;
}

.feature-card {
  background: white;
  border: 1.5px solid var(--border);
  border-radius: 20px;
  padding: 36px;
  transition: all 0.3s;
}

.feature-card:hover {
  border-color: var(--primary);
  transform: translateY(-4px);
  box-shadow: 0 12px 32px rgba(99, 102, 241, 0.12);
}

.feature-icon {
  width: 56px;
  height: 56px;
  background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
  border-radius: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 24px;
}

.feature-icon svg {
  width: 28px;
  height: 28px;
  stroke: white;
  stroke-linecap: round;
  stroke-linejoin: round;
}

.feature-title {
  font-size: 20px;
  font-weight: 700;
  margin-bottom: 12px;
  color: var(--text-dark);
}

.feature-description {
  font-size: 15px;
  line-height: 1.7;
  color: var(--text-gray);
}

/* ===================================
   HOW IT WORKS
   =================================== */

.how-it-works {
  padding: 120px 0;
  background: var(--bg-gray);
}

.steps-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 32px;
  margin-top: 64px;
}

.step-card {
  background: white;
  border: 1.5px solid var(--border);
  border-radius: 20px;
  padding: 40px;
  position: relative;
  transition: all 0.3s;
}

.step-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 12px 32px var(--shadow);
}

.step-number {
  position: absolute;
  top: 32px;
  right: 32px;
  font-size: 80px;
  font-weight: 900;
  color: var(--bg-gray);
  line-height: 1;
  letter-spacing: -0.04em;
}

.step-icon {
  width: 64px;
  height: 64px;
  background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
  border-radius: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 28px;
}

.step-icon svg {
  width: 32px;
  height: 32px;
  stroke: white;
  stroke-linecap: round;
  stroke-linejoin: round;
}

.step-title {
  font-size: 24px;
  font-weight: 700;
  margin-bottom: 12px;
  color: var(--text-dark);
}

.step-description {
  font-size: 16px;
  line-height: 1.7;
  color: var(--text-gray);
}

/* ===================================
   CTA SECTION
   =================================== */

.cta {
  padding: 120px 0;
  background: white;
}

.cta-card {
  background: linear-gradient(135deg, #1e293b 0%, #0f172a 100%);
  border-radius: 32px;
  padding: 80px;
  display: grid;
  grid-template-columns: 1.5fr 1fr;
  gap: 60px;
  align-items: center;
  position: relative;
  overflow: hidden;
}

.cta-card::before {
  content: '';
  position: absolute;
  top: -50%;
  right: -20%;
  width: 600px;
  height: 600px;
  background: radial-gradient(circle, rgba(99, 102, 241, 0.3) 0%, transparent 70%);
  border-radius: 50%;
  pointer-events: none;
}

.cta-content {
  position: relative;
  z-index: 2;
}

.cta-title {
  font-size: clamp(32px, 5vw, 48px);
  font-weight: 900;
  line-height: 1.1;
  margin-bottom: 20px;
  color: white;
  letter-spacing: -0.02em;
}

.cta-description {
  font-size: 18px;
  line-height: 1.7;
  color: rgba(255, 255, 255, 0.7);
  margin-bottom: 32px;
  max-width: 480px;
}

.btn-cta {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  padding: 18px 36px;
  background: white;
  color: var(--text-dark);
  border: none;
  border-radius: 12px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-cta:hover {
  background: var(--bg-gray);
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(255, 255, 255, 0.3);
}

.btn-cta svg {
  width: 18px;
  height: 18px;
  stroke-linecap: round;
  stroke-linejoin: round;
}

.cta-visual {
  display: flex;
  flex-direction: column;
  gap: 24px;
  position: relative;
  z-index: 2;
}

.cta-stat {
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 20px;
  padding: 32px;
}

.cta-stat-value {
  font-size: 48px;
  font-weight: 900;
  color: white;
  margin-bottom: 8px;
  letter-spacing: -0.02em;
}

.cta-stat-label {
  font-size: 15px;
  color: rgba(255, 255, 255, 0.7);
  font-weight: 500;
}

/* ===================================
   FOOTER
   =================================== */

.footer {
  background: var(--text-dark);
  color: white;
  padding: 80px 0 32px;
}

.footer-content {
  display: grid;
  grid-template-columns: 1.5fr repeat(3, 1fr);
  gap: 60px;
  margin-bottom: 60px;
}

.footer-brand .logo {
  margin-bottom: 16px;
}

.footer-brand .logo-text {
  color: white;
}

.footer-description {
  font-size: 15px;
  color: rgba(255, 255, 255, 0.6);
  line-height: 1.7;
  max-width: 300px;
}

.footer-heading {
  font-size: 14px;
  font-weight: 700;
  margin-bottom: 20px;
  color: white;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.footer-column {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.footer-link {
  color: rgba(255, 255, 255, 0.6);
  text-decoration: none;
  font-size: 15px;
  transition: color 0.2s;
}

.footer-link:hover {
  color: white;
}

.footer-bottom {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 32px;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  font-size: 14px;
  color: rgba(255, 255, 255, 0.5);
  flex-wrap: wrap;
  gap: 16px;
}

.footer-social {
  display: flex;
  gap: 24px;
}

.social-link {
  color: rgba(255, 255, 255, 0.6);
  text-decoration: none;
  font-size: 14px;
  font-weight: 500;
  transition: color 0.2s;
}

.social-link:hover {
  color: white;
}

/* ===================================
   RESPONSIVE
   =================================== */

@media (max-width: 1024px) {
  .nav-menu {
    display: flex;
  gap: 40px;
  align-items: center;
  justify-content: center;
  flex: 2;
  }
  
  .mobile-menu-btn {
    display: block;
  }
  
  .hero-bg {
    width: 80%;
  }
  
  .cta-card {
    grid-template-columns: 1fr;
    padding: 60px 40px;
  }
  
  .footer-content {
    grid-template-columns: 1fr 1fr;
  }
}

@media (max-width: 768px) {
  .navbar {
    padding: 16px 0;
  }
  
  .logo {
    font-size: 24px;
  }
  
  .btn-wallet {
    padding: 10px 20px;
    font-size: 14px;
  }
  
  .hero {
    padding: 80px 0 60px;
  }
  
  .hero-title {
    font-size: 40px;
  }
  
  .hero-description {
    font-size: 17px;
  }
  
  .hero-buttons {
    flex-direction: column;
    width: 100%;
  }
  
  .btn-primary,
  .btn-secondary {
    width: 100%;
    justify-content: center;
  }
  
  .stats-bar {
    flex-direction: column;
    align-items: flex-start;
    gap: 24px;
  }
  
  .stat-divider {
    display: none;
  }
  
  .hero-bg {
    display: none;
  }
  
  .features,
  .how-it-works,
  .cta {
    padding: 80px 0;
  }
  
  .section-title {
    font-size: 36px;
  }
  
  .features-grid,
  .steps-grid {
    grid-template-columns: 1fr;
  }
  
  .cta-card {
    padding: 48px 32px;
  }
  
  .cta-title {
    font-size: 32px;
  }
  
  .footer-content {
    grid-template-columns: 1fr;
    gap: 40px;
  }
  
  .footer {
    padding: 60px 0 24px;
  }
  
  .footer-bottom {
    flex-direction: column;
    text-align: center;
  }
}

@media (max-width: 480px) {
  .nav-menu {
    display: none;
  }   
  .container {
    padding: 0 20px;
  }
  
  .hero-badge {
    font-size: 13px;
    padding: 8px 14px;
  }
  
  .step-number {
    font-size: 60px;
    top: 24px;
    right: 24px;
  }
  
  .step-card {
    padding: 32px 24px;
  }
  
  .cta-stat {
    padding: 24px;
  }
  
  .cta-stat-value {
    font-size: 36px;
  }
}
  /* ===================================
   WALLET STYLES
   =================================== */

 
 /* ===================================
   WALLET STYLES
   =================================== */

.nav-wallet {
  position: relative;
  order: 3; /* Third item - last position */
  margin-left: auto;
}

/* Disconnected State */
.wallet-disconnected {
  position: relative;
  display: inline-block;
}

.wallet-icon-btn {
  background: #000000;
  color: white;
  border: none;
  border-radius: 10px;
  width: 48px;
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s;
  padding: 0;
}

.wallet-icon-btn:hover {
  background: #333333;
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.wallet-icon {
  width: 24px;
  height: 24px;
  stroke: white;
  stroke-linecap: round;
  stroke-linejoin: round;
}

.wallet-tooltip {
  position: absolute;
  bottom: -30px;
  left: 50%;
  transform: translateX(-50%);
  background: #000000;
  color: white;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 12px;
  white-space: nowrap;
  opacity: 0;
  visibility: hidden;
  transition: all 0.2s;
  z-index: 1000;
}

.wallet-disconnected:hover .wallet-tooltip {
  opacity: 1;
  visibility: visible;
}

/* Connected State */
.wallet-connected {
  position: relative;
}

.account-info {
  display: flex;
  align-items: center;
  gap: 12px;
  background: #000000;
  color: white;
  border: none;
  border-radius: 10px;
  padding: 8px 16px;
  cursor: pointer;
  transition: all 0.2s;
  min-width: 180px;
}

.account-info:hover {
  background: #333333;
}

.account-avatar {
  width: 36px;
  height: 36px;
  background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  font-size: 14px;
  flex-shrink: 0;
}

.account-details {
  flex: 1;
  min-width: 0;
}

.account-balance {
  font-size: 14px;
  font-weight: 600;
  margin-bottom: 2px;
}

.account-address {
  font-size: 12px;
  opacity: 0.8;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.dropdown-arrow {
  width: 16px;
  height: 16px;
  stroke: white;
  stroke-linecap: round;
  stroke-linejoin: round;
  transition: transform 0.2s;
}

.dropdown-arrow.rotated {
  transform: rotate(180deg);
}

/* Account Dropdown */
.account-dropdown {
  position: absolute;
  top: calc(100% + 8px);
  right: 0;
  background: white;
  border: 1px solid var(--border);
  border-radius: 12px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.1);
  min-width: 280px;
  z-index: 1000;
  overflow: hidden;
}

.dropdown-section {
  padding: 16px;
  border-bottom: 1px solid var(--border);
}

.dropdown-section:last-child {
  border-bottom: none;
}

.dropdown-label {
  font-size: 12px;
  color: var(--text-light);
  margin-bottom: 4px;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.dropdown-value {
  font-size: 14px;
  font-weight: 600;
  color: var(--text-dark);
}

.dropdown-address {
  font-size: 13px;
  font-family: monospace;
  color: var(--text-dark);
  word-break: break-all;
  margin-top: 4px;
}

.dropdown-divider {
  height: 1px;
  background: var(--border);
  margin: 8px 0;
}

.dropdown-btn {
  display: flex;
  align-items: center;
  gap: 12px;
  width: 100%;
  padding: 12px 16px;
  background: none;
  border: none;
  text-align: left;
  cursor: pointer;
  font-size: 14px;
  color: var(--text-dark);
  transition: background 0.2s;
}

.dropdown-btn:hover {
  background: var(--bg-gray);
}

.dropdown-btn.disconnect {
  color: #ef4444;
}

.dropdown-btn.disconnect:hover {
  background: #fef2f2;
}

.dropdown-icon {
  width: 16px;
  height: 16px;
  stroke: currentColor;
  stroke-linecap: round;
  stroke-linejoin: round;
  flex-shrink: 0;
}

/* Modal Styles */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
  padding: 20px;
}

.modal-content {
  background: white;
  border-radius: 20px;
  max-width: 440px;
  width: 100%;
  max-height: 90vh;
  overflow-y: auto;
  animation: modalSlideIn 0.3s ease;
}

@keyframes modalSlideIn {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 24px;
  border-bottom: 1px solid var(--border);
}

.modal-title {
  font-size: 20px;
  font-weight: 700;
  color: var(--text-dark);
  margin: 0;
}

.modal-close {
  background: none;
  border: none;
  cursor: pointer;
  padding: 8px;
  border-radius: 8px;
  transition: background 0.2s;
}

.modal-close:hover {
  background: var(--bg-gray);
}

.modal-close svg {
  width: 20px;
  height: 20px;
  stroke: var(--text-gray);
}

.modal-body {
  padding: 24px;
}

.modal-description {
  color: var(--text-gray);
  margin-bottom: 24px;
  text-align: center;
  font-size: 15px;
}

/* Wallet Option */
.wallet-option {
  display: flex;
  align-items: center;
  gap: 16px;
  width: 100%;
  padding: 20px;
  background: white;
  border: 2px solid var(--border);
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.2s;
  margin-bottom: 12px;
}

.wallet-option:hover:not(:disabled) {
  border-color: var(--primary);
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(99, 102, 241, 0.1);
}

.wallet-option:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.wallet-option-icon {
  width: 48px;
  height: 48px;
  background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.wallet-option-icon svg {
  width: 24px;
  height: 24px;
  stroke: white;
}

.wallet-option-info {
  flex: 1;
  text-align: left;
}

.wallet-option-name {
  font-weight: 600;
  color: var(--text-dark);
  margin-bottom: 4px;
}

.wallet-option-description {
  font-size: 13px;
  color: var(--text-light);
}

.wallet-option-arrow {
  width: 20px;
  height: 20px;
  stroke: var(--text-gray);
  stroke-linecap: round;
  stroke-linejoin: round;
  flex-shrink: 0;
}

.wallet-option-loading {
  display: flex;
  align-items: center;
  justify-content: center;
}

.spinner {
  width: 20px;
  height: 20px;
  border: 2px solid var(--border);
  border-top-color: var(--primary);
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

/* QR Code Section */
.qr-canvas {
  width: 256px;
  height: 256px;
  margin: 0 auto 20px;
  border: 1px solid var(--border);
  border-radius: 12px;
  padding: 10px;
  background: white;
}

.qr-loading {
  padding: 40px;
  text-align: center;
  color: var(--text-gray);
}

.qr-loading .spinner {
  width: 40px;
  height: 40px;
  border: 3px solid var(--border);
  border-top-color: var(--primary);
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 0 auto 16px;
}

.qr-instructions {
  background: var(--bg-gray);
  border-radius: 8px;
  padding: 16px;
  margin: 16px 0;
  text-align: left;
}

.qr-instructions p {
  margin: 8px 0;
  font-size: 14px;
  color: var(--text-gray);
}

.qr-instructions p:before {
  content: '• ';
  color: var(--primary);
  font-weight: bold;
}

.qr-expiry {
  font-family: monospace;
  color: var(--text-gray);
  font-size: 14px;
  margin-top: 12px;
}

/* ===================================
   RESPONSIVE WALLET ADJUSTMENTS
   =================================== */

@media (max-width: 768px) {
  .account-info {
    min-width: auto;
    padding: 6px 12px;
  }
  
  .account-avatar {
    width: 32px;
    height: 32px;
    font-size: 12px;
  }
  
  .account-balance {
    font-size: 13px;
  }
  
  .account-address {
    font-size: 11px;
  }
  
  .account-dropdown {
    right: -20px;
    min-width: 260px;
  }
  
  .modal-content {
    margin: 20px;
  }
}

@media (max-width: 480px) {
  .nav-wallet {
    margin-right: 10px;
  }
  
  .wallet-icon-btn {
    width: 40px;
    height: 40px;
  }
  
  .wallet-icon {
    width: 20px;
    height: 20px;
  }
}
/* ===================================
   QR MODAL IMPROVEMENTS - ADD THESE TO YOUR EXISTING STYLES
   =================================== */

/* QR Container Improvements */
.qr-container {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: 32px;
}

.qr-frame {
  position: relative;
  background: white;
  border-radius: 20px;
  padding: 24px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.08);
  border: 2px solid #f1f5f9;
  display: flex;
  justify-content: center;
  align-items: center;
}

.qr-canvas {
  width: 280px !important;
  height: 280px !important;
  border-radius: 12px;
  display: block;
}

/* Loading State - Updated */
.qr-loading {
  width: 280px;
  height: 280px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 16px;
}

.qr-loading .spinner {
  width: 48px !important;
  height: 48px !important;
  border: 4px solid #e2e8f0;
  border-top-color: #6366f1;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
  margin: 0;
}

.qr-loading p {
  color: #64748b;
  font-size: 14px;
  font-weight: 500;
  margin: 0;
}

/* Timer Badge - NEW */
.qr-timer-badge {
  position: absolute;
  top: 12px;
  right: 12px;
  background: rgba(0, 0, 0, 0.85);
  backdrop-filter: blur(8px);
  color: white;
  padding: 8px 16px;
  border-radius: 100px;
  font-size: 14px;
  font-weight: 600;
  font-family: 'SF Mono', 'Monaco', 'Consolas', monospace;
  display: flex;
  align-items: center;
  gap: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  z-index: 10;
}

.timer-icon {
  width: 16px;
  height: 16px;
  stroke: white;
  stroke-linecap: round;
  stroke-linejoin: round;
}

/* Instructions Improvements - REPLACE OLD .qr-instructions */
.qr-instructions {
  background: #f8fafc;
  border-radius: 16px;
  padding: 24px;
  margin-bottom: 24px;
  text-align: left;
}

.instructions-title {
  font-size: 15px;
  font-weight: 700;
  color: #0f172a;
  margin-bottom: 20px;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.instruction-step {
  display: flex;
  align-items: flex-start;
  gap: 16px;
  margin-bottom: 16px;
}

.instruction-step:last-child {
  margin-bottom: 0;
}

.step-number-badge {
  width: 32px;
  height: 32px;
  background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
  color: white;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  font-size: 14px;
  flex-shrink: 0;
}

.step-text {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 4px;
  padding-top: 2px;
}

.step-text strong {
  color: #0f172a;
  font-size: 15px;
  font-weight: 600;
}

.step-text span {
  color: #64748b;
  font-size: 13px;
  line-height: 1.5;
}

/* App Download Section - OPTIONAL */
.app-download-section {
  text-align: center;
  padding-top: 24px;
  border-top: 1px solid #e2e8f0;
}

.download-text {
  color: #64748b;
  font-size: 14px;
  margin-bottom: 16px;
}

.download-badges {
  display: flex;
  gap: 12px;
  justify-content: center;
  flex-wrap: wrap;
}

.badge-link {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 10px 20px;
  background: #0f172a;
  color: white;
  border-radius: 10px;
  text-decoration: none;
  font-size: 14px;
  font-weight: 600;
  transition: all 0.2s;
}

.badge-link:hover {
  background: #1e293b;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
}

.badge-icon {
  width: 18px;
  height: 18px;
}

/* Back Button Improvements - REPLACE OLD .back-btn if exists */
.back-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  background: #f1f5f9;
  border: none;
  border-radius: 8px;
  padding: 8px 16px;
  font-size: 14px;
  font-weight: 600;
  color: #0f172a;
  cursor: pointer;
  transition: all 0.2s;
}

.back-btn:hover {
  background: #e2e8f0;
}

.back-btn svg {
  stroke: #0f172a;
}

/* QR Expiry - Update positioning */
.qr-expiry {
  /* This is now handled by .qr-timer-badge */
  display: none;
}

/* Responsive adjustments */
@media (max-width: 480px) {
  .qr-canvas,
  .qr-loading {
    width: 240px !important;
    height: 240px !important;
  }
  
  .qr-frame {
    padding: 20px;
  }
  
  .qr-timer-badge {
    font-size: 12px;
    padding: 6px 12px;
  }
  
  .download-badges {
    flex-direction: column;
  }
  
  .badge-link {
    width: 100%;
    justify-content: center;
  }
  
  .instruction-step {
    gap: 12px;
  }
  
  .step-number-badge {
    width: 28px;
    height: 28px;
    font-size: 12px;
  }
}
</style>