<template>
  <div class="dashboard-page">
    <!-- Navigation Header (matches homepage) -->
    <header class="navbar">
      <div class="container">
        <div class="nav-content">
          <!-- Logo -->
          <NuxtLink to="/" class="logo">
            <span class="logo-text">Lend</span>
            <span class="logo-dot">.</span>
          </NuxtLink>

          <!-- Desktop Menu -->
          <nav class="nav-menu">
            <NuxtLink to="/" class="nav-link">Home</NuxtLink>
            <NuxtLink to="/dashboard" class="nav-link active">Dashboard</NuxtLink>
            <a href="#my-loans" class="nav-link">My Loans</a>
            <a href="#history" class="nav-link">History</a>
          </nav>

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
        </div>
      </div>
    </header>

    <!-- Main Dashboard Content -->
    <main class="dashboard-main">
      <div class="container">
        <!-- Dashboard Header -->
        <div class="dashboard-header">
          <div class="header-content">
            <h1 class="dashboard-title">P2P Lending</h1>
            <p class="dashboard-subtitle">
              Borrow or lend stablecoins securely with BCH collateral
            </p>
          </div>
          
          <button class="btn-create-offer" @click="openCreateOfferModal">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <line x1="12" y1="5" x2="12" y2="19" stroke-width="2"/>
              <line x1="5" y1="12" x2="19" y2="12" stroke-width="2"/>
            </svg>
            Create Offer
          </button>
        </div>

        <!-- Tabs & Filters Section -->
        <div class="filters-section">
          <!-- Tabs -->
          <div class="tabs">
            <button 
              class="tab" 
              :class="{ active: activeTab === 'borrow' }"
              @click="activeTab = 'borrow'"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <line x1="12" y1="5" x2="12" y2="19" stroke-width="2"/>
                <line x1="5" y1="12" x2="19" y2="12" stroke-width="2"/>
              </svg>
              I Want to Borrow
              <span class="tab-subtitle">Browse lender offers</span>
            </button>
            <button 
              class="tab"
              :class="{ active: activeTab === 'lend' }"
              @click="activeTab = 'lend'"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <line x1="12" y1="1" x2="12" y2="23" stroke-width="2"/>
                <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" stroke-width="2"/>
              </svg>
              I Want to Lend
              <span class="tab-subtitle">Browse borrower requests</span>
            </button>
          </div>

          <!-- Filter Pills -->
          <div class="filter-pills">
            <div class="filter-pill">
              <select v-model="filters.amount" class="filter-select">
                <option value="">Amount (USD)</option>
                <option value="0-100">$0 - $100</option>
                <option value="100-500">$100 - $500</option>
                <option value="500-1000">$500 - $1,000</option>
                <option value="1000-5000">$1,000 - $5,000</option>
                <option value="5000+">$5,000+</option>
              </select>
            </div>

            <div class="filter-pill">
              <select v-model="filters.ltv" class="filter-select">
                <option value="">LTV Ratio</option>
                <option value="0-30">0% - 30%</option>
                <option value="30-50">30% - 50%</option>
                <option value="50-70">50% - 70%</option>
                <option value="70+">70%+</option>
              </select>
            </div>

            <div class="filter-pill">
              <select v-model="filters.duration" class="filter-select">
                <option value="">Duration</option>
                <option value="7">7 days</option>
                <option value="14">14 days</option>
                <option value="30">30 days</option>
                <option value="60">60 days</option>
                <option value="90">90 days</option>
              </select>
            </div>

            <div class="filter-pill">
              <select v-model="filters.interest" class="filter-select">
                <option value="">Interest Rate (APY)</option>
                <option value="0-5">0% - 5%</option>
                <option value="5-10">5% - 10%</option>
                <option value="10-15">10% - 15%</option>
                <option value="15-20">15% - 20%</option>
                <option value="20+">20%+</option>
              </select>
            </div>

            <button class="btn-filter-reset" @click="resetFilters" v-if="hasActiveFilters">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <line x1="18" y1="6" x2="6" y2="18" stroke-width="2"/>
                <line x1="6" y1="6" x2="18" y2="18" stroke-width="2"/>
              </svg>
              Clear Filters
            </button>
          </div>
        </div>

        <!-- Offers List -->
        <div class="offers-section">
          <!-- Loading State -->
          <div v-if="loading" class="loading-state">
            <div class="spinner"></div>
            <p>Loading offers...</p>
          </div>

          <!-- Empty State -->
          <div v-else-if="filteredOffers.length === 0" class="empty-state">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <circle cx="12" cy="12" r="10" stroke-width="2"/>
              <line x1="12" y1="8" x2="12" y2="12" stroke-width="2"/>
              <line x1="12" y1="16" x2="12.01" y2="16" stroke-width="2"/>
            </svg>
            <h3>No offers available</h3>
            <p>Be the first to create an offer!</p>
            <button class="btn-primary">Create Offer</button>
          </div>

          <!-- Offers Grid -->
          <div v-else class="offers-grid">
            <div 
              v-for="offer in filteredOffers" 
              :key="offer.id"
              class="offer-card"
              @click="viewOfferDetails(offer)"
            >
              <div class="offer-header">
                <div class="offer-type-badge" :class="offer.offerType">
                  {{ offer.offerType === 'lend' ? 'Lending Offer' : 'Borrow Request' }}
                </div>
                <div class="offer-status">
                  <span class="status-dot"></span>
                  Active
                </div>
              </div>

              <!-- Main Amount -->
              <div class="offer-amount">
                <div class="amount-label">
                  {{ activeTab === 'borrow' ? 'Available to Borrow' : 'Requesting to Borrow' }}
                </div>
                <div class="amount-value">${{ offer.loanAmount.toLocaleString() }}</div>
                <div class="amount-sublabel">Stablecoin (flexUSD)</div>
              </div>

              <!-- Key Metrics -->
              <div class="offer-metrics">
                <div class="metric-card">
                  <div class="metric-label">LTV</div>
                  <div class="metric-value">{{ offer.ltv }}%</div>
                </div>
                <div class="metric-card">
                  <div class="metric-label">Interest</div>
                  <div class="metric-value">{{ offer.interestRate }}%</div>
                </div>
                <div class="metric-card">
                  <div class="metric-label">Duration</div>
                  <div class="metric-value">{{ offer.duration }}d</div>
                </div>
              </div>

              <!-- Collateral Info -->
              <div class="offer-details">
                <div class="detail-item">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" stroke-width="2"/>
                  </svg>
                  <span>{{ offer.collateralAmount }} BCH collateral</span>
                </div>

                <div class="detail-item">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <line x1="12" y1="1" x2="12" y2="23" stroke-width="2"/>
                    <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" stroke-width="2"/>
                  </svg>
                  <span>Total repay: ${{ calculateTotalRepay(offer).toLocaleString() }}</span>
                </div>
              </div>

              <div class="offer-footer">
                <div class="user-info">
                  <div class="user-avatar">
                    {{ offer.userAddress.substring(0, 2).toUpperCase() }}
                  </div>
                  <div class="user-details">
                    <span class="user-address">{{ shortenAddress(offer.userAddress) }}</span>
                    <span class="user-rating">⭐ {{ offer.rating || '4.8' }}</span>
                  </div>
                </div>
                
                <button class="btn-accept" @click.stop="acceptOffer(offer)">
                  {{ activeTab === 'borrow' ? 'Borrow Now' : 'Lend Now' }}
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <line x1="5" y1="12" x2="19" y2="12" stroke-width="2"/>
                    <polyline points="12 5 19 12 12 19" stroke-width="2"/>
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>

    <!-- Create Offer Modal -->
    <div v-if="showCreateOfferModal" class="modal-overlay" @click="showCreateOfferModal = false">
      <div class="modal-content create-offer-modal" @click.stop>
        <div class="modal-header">
          <h3 class="modal-title">Create {{ offerForm.type === 'borrow' ? 'Borrow Request' : 'Lend Offer' }}</h3>
          <button @click="showCreateOfferModal = false" class="modal-close">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <line x1="18" y1="6" x2="6" y2="18" stroke-width="2"/>
              <line x1="6" y1="6" x2="18" y2="18" stroke-width="2"/>
            </svg>
          </button>
        </div>

        <div class="modal-body">
          <!-- Offer Type Toggle -->
          <div class="form-group">
            <label class="form-label">I want to:</label>
            <div class="offer-type-toggle">
              <button
                class="toggle-btn"
                :class="{ active: offerForm.type === 'borrow' }"
                @click="offerForm.type = 'borrow'"
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <line x1="12" y1="5" x2="12" y2="19" stroke-width="2"/>
                  <line x1="5" y1="12" x2="19" y2="12" stroke-width="2"/>
                </svg>
                Borrow Stablecoins
              </button>
              <button
                class="toggle-btn"
                :class="{ active: offerForm.type === 'lend' }"
                @click="offerForm.type = 'lend'"
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <line x1="12" y1="1" x2="12" y2="23" stroke-width="2"/>
                  <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" stroke-width="2"/>
                </svg>
                Lend Stablecoins
              </button>
            </div>
          </div>

          <!-- Loan Amount -->
          <div class="form-group">
            <label class="form-label">Loan Amount (USD)</label>
            <div class="input-with-icon">
              <span class="input-icon">$</span>
              <input
                v-model="offerForm.loanAmount"
                type="number"
                class="form-input"
                placeholder="500"
                min="0"
                step="10"
                @input="calculateCollateralFromLTV"
              />
              <span class="input-suffix">flexUSD</span>
            </div>
            <span class="form-hint">Amount of stablecoins {{ offerForm.type === 'borrow' ? 'you want to borrow' : 'you will lend' }}</span>
          </div>

          <!-- LTV Slider -->
          <div class="form-group">
            <label class="form-label">
              Loan-to-Value (LTV) Ratio
              <span class="label-value">{{ offerForm.ltv }}%</span>
            </label>
            <input
              v-model="offerForm.ltv"
              type="range"
              class="ltv-slider"
              min="10"
              max="80"
              step="5"
              @input="calculateCollateralFromLTV"
            />
            <div class="slider-labels">
              <span>10% (Conservative)</span>
              <span>80% (Aggressive)</span>
            </div>
            <div class="ltv-explanation">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <circle cx="12" cy="12" r="10" stroke-width="2"/>
                <line x1="12" y1="16" x2="12" y2="12" stroke-width="2"/>
                <line x1="12" y1="8" x2="12.01" y2="8" stroke-width="2"/>
              </svg>
              <span>Lower LTV = More collateral required = Safer for lender</span>
            </div>
          </div>

          <!-- Collateral Amount (Auto-calculated) -->
          <div class="form-group">
            <label class="form-label">Required BCH Collateral</label>
            <div class="collateral-display">
              <div class="collateral-amount">
                {{ offerForm.collateralAmount || '0.000000' }} BCH
              </div>
              <div class="collateral-usd">
                ≈ ${{ offerForm.collateralAmount ? (offerForm.collateralAmount * 350).toFixed(2) : '0.00' }} USD
              </div>
            </div>
            <span class="form-hint">Auto-calculated based on LTV ratio</span>
          </div>

          <!-- Interest Rate -->
          <div class="form-group">
            <label class="form-label">Interest Rate (APY)</label>
            <div class="input-with-icon">
              <input
                v-model="offerForm.interestRate"
                type="number"
                class="form-input"
                placeholder="8.5"
                min="0"
                max="100"
                step="0.1"
              />
              <span class="input-suffix">% APY</span>
            </div>
            <span class="form-hint">Annual percentage yield you {{ offerForm.type === 'borrow' ? 'will pay' : 'want to earn' }}</span>
          </div>

          <!-- Duration -->
          <div class="form-group">
            <label class="form-label">Loan Duration</label>
            <select v-model="offerForm.duration" class="form-select">
              <option value="7">7 days</option>
              <option value="14">14 days</option>
              <option value="30">30 days</option>
              <option value="45">45 days</option>
              <option value="60">60 days</option>
              <option value="90">90 days</option>
            </select>
          </div>

          <!-- Summary -->
          <div class="offer-summary">
            <h4 class="summary-title">Offer Summary</h4>
            <div class="summary-row">
              <span>Loan Amount:</span>
              <span class="summary-value">${{ offerForm.loanAmount || '0' }} flexUSD</span>
            </div>
            <div class="summary-row">
              <span>Collateral:</span>
              <span class="summary-value">{{ offerForm.collateralAmount || '0' }} BCH</span>
            </div>
            <div class="summary-row">
              <span>LTV Ratio:</span>
              <span class="summary-value">{{ calculatedLTV }}%</span>
            </div>
            <div class="summary-row">
              <span>Interest:</span>
              <span class="summary-value">{{ offerForm.interestRate || '0' }}% APY</span>
            </div>
            <div class="summary-row">
              <span>Duration:</span>
              <span class="summary-value">{{ offerForm.duration }} days</span>
            </div>
            <div class="summary-divider"></div>
            <div class="summary-row total">
              <span>Total to Repay:</span>
              <span class="summary-value">
                ${{ offerForm.loanAmount && offerForm.interestRate ? 
                  (Number(offerForm.loanAmount) + (Number(offerForm.loanAmount) * Number(offerForm.interestRate) / 100 * offerForm.duration / 365)).toFixed(2) : 
                  '0.00' }}
              </span>
            </div>
          </div>

          <!-- Create Button -->
          <button class="btn-create-offer-submit" @click="createOffer" :disabled="loading">
            <svg v-if="!loading" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <polyline points="20 6 9 17 4 12" stroke-width="2"/>
            </svg>
            <div v-else class="spinner-small"></div>
            {{ loading ? 'Creating...' : 'Create Offer' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useWallet } from '~/composables/useWallet-simple'

// ============== WALLET COMPOSABLE ==============
const {
  isConnected,
  showConnectModal,
  showDropdown,
  userAddress,
  userBalance,
  toggleAccountDropdown,
  copyAddress,
  viewOnExplorer,
  disconnectWallet,
  shortenAddress,
  formatBalance,
  initializeWallet
} = useWallet()

// ============== DASHBOARD STATE ==============
const activeTab = ref('borrow') // 'borrow' = browsing lender offers | 'lend' = browsing borrower requests
const loading = ref(false)
const showCreateOfferModal = ref(false)

// Filters
const filters = ref({
  amount: '',
  ltv: '',
  duration: '',
  interest: ''
})

// Create Offer Form
const offerForm = ref({
  type: 'borrow', // 'borrow' or 'lend'
  loanAmount: '',
  collateralAmount: '',
  ltv: 50,
  interestRate: '',
  duration: 30
})

// ============== MOCK DATA ==============
// TODO: Fetch from Django backend - GET /api/offers/
const mockOffers = ref([
  // LENDER OFFERS (shown in "I want to borrow" tab)
  {
    id: 1,
    offerType: 'lend', // This is a lender offering to lend
    userAddress: 'bitcoincash:qp3wjpa3tjlj042z2wv7hahsldgwhwy0rq9sywjpyy',
    loanAmount: 500, // USD worth of flexUSD they'll lend
    collateralAmount: 0.015, // BCH required as collateral
    ltv: 50, // Loan-to-Value ratio (loan is 50% of collateral value)
    interestRate: 8.5, // APY
    duration: 30, // days
    status: 'active',
    rating: 4.8,
    createdAt: new Date()
  },
  {
    id: 2,
    offerType: 'lend',
    userAddress: 'bitcoincash:qzg0esm3xr5j7wz9w8tvhqhghqz8qv9pqgv5g8hqxz',
    loanAmount: 1000,
    collateralAmount: 0.03,
    ltv: 60,
    interestRate: 12,
    duration: 60,
    status: 'active',
    rating: 4.9,
    createdAt: new Date()
  },
  // BORROWER REQUESTS (shown in "I want to lend" tab)
  {
    id: 3,
    offerType: 'borrow', // This is a borrower requesting to borrow
    userAddress: 'bitcoincash:qr5fkyh3hf2e3dnpjjn7eyn9c3tp9lqv5qr9sywjpyy',
    loanAmount: 250,
    collateralAmount: 0.008,
    ltv: 45,
    interestRate: 6,
    duration: 14,
    status: 'active',
    rating: 4.7,
    createdAt: new Date()
  },
  {
    id: 4,
    offerType: 'borrow',
    userAddress: 'bitcoincash:qp8wjpa3tjlj042z2wv7hahsldgwhwy0rq9sywjpyy',
    loanAmount: 750,
    collateralAmount: 0.02,
    ltv: 55,
    interestRate: 10,
    duration: 45,
    status: 'active',
    rating: 4.6,
    createdAt: new Date()
  }
])

// ============== COMPUTED ==============
const filteredOffers = computed(() => {
  // Show lender offers when user wants to borrow
  // Show borrower requests when user wants to lend
  let offers = mockOffers.value.filter(offer => {
    if (activeTab.value === 'borrow') {
      return offer.offerType === 'lend' // Show lender offers
    } else {
      return offer.offerType === 'borrow' // Show borrower requests
    }
  })
  
  // Apply filters
  if (filters.value.amount) {
    const [min, max] = filters.value.amount.includes('+') 
      ? [5000, Infinity] 
      : filters.value.amount.split('-').map(Number)
    offers = offers.filter(o => o.loanAmount >= min && (max ? o.loanAmount <= max : true))
  }
  
  if (filters.value.ltv) {
    const [min, max] = filters.value.ltv.includes('+') 
      ? [70, Infinity] 
      : filters.value.ltv.split('-').map(Number)
    offers = offers.filter(o => o.ltv >= min && (max ? o.ltv <= max : true))
  }
  
  if (filters.value.duration) {
    offers = offers.filter(o => o.duration === Number(filters.value.duration))
  }
  
  if (filters.value.interest) {
    const [min, max] = filters.value.interest.includes('+') 
      ? [20, Infinity] 
      : filters.value.interest.split('-').map(Number)
    offers = offers.filter(o => o.interestRate >= min && (max ? o.interestRate <= max : true))
  }
  
  return offers
})

const hasActiveFilters = computed(() => {
  return filters.value.amount || filters.value.ltv || filters.value.duration || filters.value.interest
})

// Calculate LTV from loan amount and collateral
const calculatedLTV = computed(() => {
  if (!offerForm.value.loanAmount || !offerForm.value.collateralAmount) return 0
  
  // Assuming BCH price (in real app, fetch from API)
  const bchPrice = 350 // USD per BCH
  const collateralValue = offerForm.value.collateralAmount * bchPrice
  
  if (collateralValue === 0) return 0
  
  return Math.round((offerForm.value.loanAmount / collateralValue) * 100)
})

// ============== METHODS ==============
const resetFilters = () => {
  filters.value = {
    amount: '',
    ltv: '',
    duration: '',
    interest: ''
  }
}

const calculateTotalRepay = (offer) => {
  // Calculate total amount to repay (principal + interest)
  const interestAmount = (offer.loanAmount * offer.interestRate / 100) * (offer.duration / 365)
  return offer.loanAmount + interestAmount
}

const viewOfferDetails = (offer) => {
  console.log('View offer details:', offer)
  // TODO: Navigate to offer details page
  // navigateTo(`/offers/${offer.id}`)
}

const acceptOffer = (offer) => {
  console.log('Accepting offer:', offer)
  
  if (!isConnected.value) {
    showConnectModal.value = true
    return
  }
  
  // TODO: Open accept offer modal with CashScript contract interaction
  alert(`Accepting offer #${offer.id}\n\nThis will create a CashScript contract transaction.`)
}

const openCreateOfferModal = () => {
  if (!isConnected.value) {
    showConnectModal.value = true
    return
  }
  
  showCreateOfferModal.value = true
  offerForm.value.type = activeTab.value // Pre-select based on current tab
}

const calculateCollateralFromLTV = () => {
  if (!offerForm.value.loanAmount || !offerForm.value.ltv) return
  
  const bchPrice = 350 // USD per BCH (fetch from API in production)
  const requiredCollateralValue = offerForm.value.loanAmount / (offerForm.value.ltv / 100)
  offerForm.value.collateralAmount = (requiredCollateralValue / bchPrice).toFixed(6)
}

const createOffer = async () => {
  // Validate form
  if (!offerForm.value.loanAmount || !offerForm.value.collateralAmount || !offerForm.value.interestRate) {
    alert('Please fill in all required fields')
    return
  }
  
  loading.value = true
  
  try {
    // TODO: Call Django backend to create CashScript contract
    // const response = await $fetch('/api/offers/create/', {
    //   method: 'POST',
    //   body: {
    //     type: offerForm.value.type,
    //     loanAmount: offerForm.value.loanAmount,
    //     collateralAmount: offerForm.value.collateralAmount,
    //     ltv: calculatedLTV.value,
    //     interestRate: offerForm.value.interestRate,
    //     duration: offerForm.value.duration,
    //     userAddress: userAddress.value
    //   }
    // })
    
    // Mock: Add to local array
    mockOffers.value.push({
      id: Date.now(),
      offerType: offerForm.value.type,
      userAddress: userAddress.value,
      loanAmount: Number(offerForm.value.loanAmount),
      collateralAmount: Number(offerForm.value.collateralAmount),
      ltv: calculatedLTV.value,
      interestRate: Number(offerForm.value.interestRate),
      duration: Number(offerForm.value.duration),
      status: 'active',
      rating: 0,
      createdAt: new Date()
    })
    
    // Reset form
    showCreateOfferModal.value = false
    offerForm.value = {
      type: 'borrow',
      loanAmount: '',
      collateralAmount: '',
      ltv: 50,
      interestRate: '',
      duration: 30
    }
    
    alert('Offer created successfully!')
    
  } catch (error) {
    console.error('Failed to create offer:', error)
    alert('Failed to create offer. Please try again.')
  } finally {
    loading.value = false
  }
}

// ============== LIFECYCLE ==============
let cleanup
onMounted(async () => {
  cleanup = initializeWallet()
  
  // TODO: Fetch offers from Django API
  // loading.value = true
  // try {
  //   const response = await $fetch('/api/offers/')
  //   mockOffers.value = response.offers
  // } catch (error) {
  //   console.error('Failed to fetch offers:', error)
  // } finally {
  //   loading.value = false
  // }
})

onUnmounted(() => {
  if (cleanup) cleanup()
})

// ============== META ==============
useHead({
  title: 'Dashboard - Lend',
  meta: [
    {
      name: 'description',
      content: 'Browse and create P2P lending offers on Bitcoin Cash'
    }
  ]
})
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap');

:root {
  --primary: #6366f1;
  --primary-dark: #4f46e5;
  --text-dark: #0f172a;
  --text-gray: #64748b;
  --text-light: #94a3b8;
  --bg-white: #ffffff;
  --bg-gray: #f8fafc;
  --bg-light: #faf5ff;
  --border: #e2e8f0;
  --shadow: rgba(0, 0, 0, 0.08);
  --success: #10b981;
  --warning: #f59e0b;
}

* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

.dashboard-page {
  background: var(--bg-white);
  min-height: 100vh;
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
}

.container {
  max-width: 1280px;
  margin: 0 auto;
  padding: 0 24px;
}

/* ===================================
   NAVBAR (matches homepage)
   =================================== */

.navbar {
  background: white;
  border-bottom: 1px solid var(--border);
  padding: 20px 0;
  position: sticky;
  top: 0;
  z-index: 100;
}

.nav-content {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.logo {
  font-size: 28px;
  font-weight: 900;
  display: flex;
  align-items: center;
  letter-spacing: -0.02em;
  text-decoration: none;
  color: var(--text-dark);
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

/* Wallet styles (from homepage) */
.nav-wallet {
  position: relative;
}

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

/* ===================================
   DASHBOARD MAIN
   =================================== */

.dashboard-main {
  padding: 48px 0 80px;
}

.dashboard-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 48px;
}

.header-content h1 {
  font-size: 42px;
  font-weight: 900;
  color: var(--text-dark);
  margin-bottom: 8px;
  letter-spacing: -0.02em;
}

.dashboard-subtitle {
  font-size: 17px;
  color: var(--text-gray);
}

.btn-create-offer {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 14px 28px;
  background: var(--primary);
  color: white;
  border: none;
  border-radius: 10px;
  font-size: 15px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-create-offer:hover {
  background: var(--primary-dark);
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(99, 102, 241, 0.3);
}

.btn-create-offer svg {
  width: 18px;
  height: 18px;
  stroke: white;
  stroke-linecap: round;
  stroke-linejoin: round;
}

/* ===================================
   TABS & FILTERS
   =================================== */

.filters-section {
  background: white;
  border: 1px solid var(--border);
  border-radius: 16px;
  padding: 24px;
  margin-bottom: 32px;
}

.tabs {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
  margin-bottom: 24px;
  background: var(--bg-gray);
  padding: 6px;
  border-radius: 12px;
}

.tab {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  padding: 16px 24px;
  background: transparent;
  border: none;
  border-radius: 8px;
  font-size: 15px;
  font-weight: 600;
  color: var(--text-gray);
  cursor: pointer;
  transition: all 0.2s;
}

.tab svg {
  width: 20px;
  height: 20px;
  stroke: currentColor;
  stroke-linecap: round;
  stroke-linejoin: round;
}

.tab:hover {
  color: var(--text-dark);
}

.tab.active {
  background: white;
  color: var(--primary);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.tab-subtitle {
  font-size: 12px;
  font-weight: 500;
  color: var(--text-light);
}

.filter-pills {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
  align-items: center;
}

.filter-pill {
  position: relative;
}

.filter-select {
  padding: 10px 40px 10px 16px;
  border: 1.5px solid var(--border);
  border-radius: 100px;
  font-size: 14px;
  font-weight: 500;
  color: var(--text-dark);
  background: white;
  cursor: pointer;
  transition: all 0.2s;
  appearance: none;
  background-image: url("data:image/svg+xml,%3Csvg width='12' height='8' viewBox='0 0 12 8' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M1 1.5L6 6.5L11 1.5' stroke='%2364748b' stroke-width='1.5' stroke-linecap='round'/%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: right 14px center;
}

.filter-select:hover {
  border-color: var(--primary);
}

.filter-select:focus {
  outline: none;
  border-color: var(--primary);
  box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.1);
}

.btn-filter-reset {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 10px 16px;
  background: var(--bg-gray);
  border: none;
  border-radius: 100px;
  font-size: 14px;
  font-weight: 500;
  color: var(--text-gray);
  cursor: pointer;
  transition: all 0.2s;
}

.btn-filter-reset:hover {
  background: var(--border);
  color: var(--text-dark);
}

.btn-filter-reset svg {
  width: 14px;
  height: 14px;
  stroke: currentColor;
  stroke-linecap: round;
  stroke-linejoin: round;
}

/* ===================================
   OFFERS LIST
   =================================== */

.offers-section {
  min-height: 400px;
}

.loading-state,
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 80px 20px;
  text-align: center;
}

.spinner {
  width: 48px;
  height: 48px;
  border: 4px solid var(--border);
  border-top-color: var(--primary);
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
  margin-bottom: 16px;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.empty-state svg {
  width: 64px;
  height: 64px;
  stroke: var(--text-light);
  stroke-linecap: round;
  stroke-linejoin: round;
  margin-bottom: 16px;
}

.empty-state h3 {
  font-size: 20px;
  font-weight: 700;
  color: var(--text-dark);
  margin-bottom: 8px;
}

.empty-state p {
  font-size: 15px;
  color: var(--text-gray);
  margin-bottom: 24px;
}

.btn-primary {
  padding: 12px 28px;
  background: var(--primary);
  color: white;
  border: none;
  border-radius: 10px;
  font-size: 15px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-primary:hover {
  background: var(--primary-dark);
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(99, 102, 241, 0.3);
}

.offers-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 24px;
}

.offer-card {
  background: white;
  border: 1.5px solid var(--border);
  border-radius: 16px;
  padding: 24px;
  cursor: pointer;
  transition: all 0.3s;
}

.offer-card:hover {
  border-color: var(--primary);
  transform: translateY(-4px);
  box-shadow: 0 12px 32px rgba(99, 102, 241, 0.12);
}

.offer-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.offer-type-badge {
  padding: 6px 12px;
  border-radius: 6px;
  font-size: 11px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.offer-type-badge.borrow {
  background: #dbeafe;
  color: #1e40af;
}

.offer-type-badge.lend {
  background: #dcfce7;
  color: #166534;
}

.offer-status {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  font-weight: 600;
  color: var(--success);
}

.status-dot {
  width: 6px;
  height: 6px;
  background: var(--success);
  border-radius: 50%;
}

.offer-amount {
  margin-bottom: 20px;
}

.amount-label {
  font-size: 12px;
  color: var(--text-light);
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  margin-bottom: 8px;
}

.amount-value {
  font-size: 32px;
  font-weight: 900;
  color: var(--text-dark);
  margin-bottom: 4px;
  letter-spacing: -0.02em;
}

.amount-sublabel {
  font-size: 13px;
  color: var(--text-gray);
  font-weight: 500;
}

/* Metrics Cards */
.offer-metrics {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 12px;
  margin-bottom: 20px;
}

.metric-card {
  background: var(--bg-gray);
  border-radius: 8px;
  padding: 12px;
  text-align: center;
}

.metric-label {
  font-size: 11px;
  color: var(--text-light);
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  margin-bottom: 6px;
}

.metric-value {
  font-size: 18px;
  font-weight: 800;
  color: var(--primary);
}

.offer-details {
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin-bottom: 20px;
  padding: 16px 0;
  border-top: 1px solid var(--border);
  border-bottom: 1px solid var(--border);
}

.detail-item {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 13px;
  color: var(--text-gray);
  font-weight: 500;
}

.detail-item svg {
  width: 16px;
  height: 16px;
  stroke: var(--primary);
  stroke-linecap: round;
  stroke-linejoin: round;
  flex-shrink: 0;
}

.offer-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 10px;
  flex: 1;
  min-width: 0;
}

.user-avatar {
  width: 36px;
  height: 36px;
  background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  font-size: 13px;
  color: white;
  flex-shrink: 0;
}

.user-details {
  display: flex;
  flex-direction: column;
  gap: 2px;
  min-width: 0;
}

.user-address {
  font-size: 12px;
  font-family: monospace;
  color: var(--text-gray);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.user-rating {
  font-size: 11px;
  color: var(--warning);
  font-weight: 600;
}

.btn-accept {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 10px 20px;
  background: var(--primary);
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  white-space: nowrap;
  flex-shrink: 0;
}

.btn-accept:hover {
  background: var(--primary-dark);
  transform: translateX(2px);
}

.btn-accept svg {
  width: 14px;
  height: 14px;
  stroke: white;
  stroke-linecap: round;
  stroke-linejoin: round;
}

/* ===================================
   CREATE OFFER MODAL
   =================================== */

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

.create-offer-modal {
  background: white;
  border-radius: 20px;
  max-width: 560px;
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
  stroke-linecap: round;
  stroke-linejoin: round;
}

.modal-body {
  padding: 24px;
}

/* Form Styles */
.form-group {
  margin-bottom: 24px;
}

.form-label {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 14px;
  font-weight: 600;
  color: var(--text-dark);
  margin-bottom: 8px;
}

.label-value {
  font-size: 16px;
  color: var(--primary);
}

.form-input,
.form-select {
  width: 100%;
  padding: 12px 16px;
  border: 1.5px solid var(--border);
  border-radius: 10px;
  font-size: 15px;
  color: var(--text-dark);
  background: white;
  transition: all 0.2s;
}

.form-input:focus,
.form-select:focus {
  outline: none;
  border-color: var(--primary);
  box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.1);
}

.input-with-icon {
  position: relative;
  display: flex;
  align-items: center;
}

.input-icon {
  position: absolute;
  left: 16px;
  font-size: 15px;
  font-weight: 600;
  color: var(--text-gray);
}

.input-with-icon .form-input {
  padding-left: 32px;
  padding-right: 80px;
}

.input-suffix {
  position: absolute;
  right: 16px;
  font-size: 13px;
  font-weight: 600;
  color: var(--text-light);
}

.form-hint {
  display: block;
  margin-top: 6px;
  font-size: 12px;
  color: var(--text-light);
}

/* Offer Type Toggle */
.offer-type-toggle {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
}

.toggle-btn {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  padding: 16px;
  background: var(--bg-gray);
  border: 2px solid transparent;
  border-radius: 12px;
  font-size: 14px;
  font-weight: 600;
  color: var(--text-gray);
  cursor: pointer;
  transition: all 0.2s;
}

.toggle-btn svg {
  width: 24px;
  height: 24px;
  stroke: currentColor;
  stroke-linecap: round;
  stroke-linejoin: round;
}

.toggle-btn:hover {
  background: var(--border);
}

.toggle-btn.active {
  background: var(--bg-light);
  border-color: var(--primary);
  color: var(--primary);
}

/* LTV Slider */
.ltv-slider {
  width: 100%;
  height: 8px;
  border-radius: 4px;
  background: var(--bg-gray);
  outline: none;
  -webkit-appearance: none;
}

.ltv-slider::-webkit-slider-thumb {
  -webkit-appearance: none;
  appearance: none;
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background: var(--primary);
  cursor: pointer;
  box-shadow: 0 2px 8px rgba(99, 102, 241, 0.3);
}

.ltv-slider::-moz-range-thumb {
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background: var(--primary);
  cursor: pointer;
  border: none;
  box-shadow: 0 2px 8px rgba(99, 102, 241, 0.3);
}

.slider-labels {
  display: flex;
  justify-content: space-between;
  margin-top: 8px;
  font-size: 11px;
  color: var(--text-light);
}

.ltv-explanation {
  display: flex;
  align-items: flex-start;
  gap: 8px;
  margin-top: 12px;
  padding: 12px;
  background: var(--bg-light);
  border-radius: 8px;
  font-size: 12px;
  color: var(--text-gray);
}

.ltv-explanation svg {
  width: 16px;
  height: 16px;
  stroke: var(--primary);
  stroke-linecap: round;
  stroke-linejoin: round;
  flex-shrink: 0;
  margin-top: 1px;
}

/* Collateral Display */
.collateral-display {
  background: var(--bg-gray);
  border-radius: 12px;
  padding: 16px;
  text-align: center;
}

.collateral-amount {
  font-size: 24px;
  font-weight: 800;
  color: var(--text-dark);
  margin-bottom: 4px;
  font-family: monospace;
}

.collateral-usd {
  font-size: 14px;
  color: var(--text-light);
}

/* Offer Summary */
.offer-summary {
  background: var(--bg-light);
  border: 1.5px solid var(--border);
  border-radius: 12px;
  padding: 20px;
  margin-bottom: 20px;
}

.summary-title {
  font-size: 15px;
  font-weight: 700;
  color: var(--text-dark);
  margin-bottom: 16px;
}

.summary-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 0;
  font-size: 14px;
  color: var(--text-gray);
}

.summary-value {
  font-weight: 600;
  color: var(--text-dark);
}

.summary-divider {
  height: 1px;
  background: var(--border);
  margin: 8px 0;
}

.summary-row.total {
  font-size: 16px;
  font-weight: 700;
  color: var(--text-dark);
  padding-top: 12px;
}

.summary-row.total .summary-value {
  font-size: 18px;
  color: var(--primary);
}

/* Submit Button */
.btn-create-offer-submit {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  width: 100%;
  padding: 16px;
  background: var(--primary);
  color: white;
  border: none;
  border-radius: 10px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-create-offer-submit:hover:not(:disabled) {
  background: var(--primary-dark);
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(99, 102, 241, 0.3);
}

.btn-create-offer-submit:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.btn-create-offer-submit svg {
  width: 18px;
  height: 18px;
  stroke: white;
  stroke-linecap: round;
  stroke-linejoin: round;
}

.spinner-small {
  width: 18px;
  height: 18px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-top-color: white;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

/* ===================================
   RESPONSIVE
   =================================== */

@media (max-width: 768px) {
  .dashboard-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 20px;
  }

  .btn-create-offer {
    width: 100%;
    justify-content: center;
  }

  .nav-menu {
    display: none;
  }

  .offers-grid {
    grid-template-columns: 1fr;
  }

  .filter-pills {
    flex-direction: column;
    width: 100%;
  }

  .filter-pill,
  .filter-select {
    width: 100%;
  }

  .account-info {
    min-width: auto;
  }
}
</style>