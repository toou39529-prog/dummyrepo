<template>
  <button class="wallet-button">
    <svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
      <path d="M21 12V7H5a2 2 0 0 1 0-4h14v4" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
      <path d="M3 5v14a2 2 0 0 0 2 2h16v-5" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
      <path d="M18 12a2 2 0 0 0 0 4h4v-4Z" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
    </svg>
    Connect Wallet
  </button>
</template>

<style scoped>
.wallet-button {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  padding: 14px 32px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  border-radius: 12px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 4px 20px rgba(102, 126, 234, 0.4);
}

.wallet-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 30px rgba(102, 126, 234, 0.6);
}

.wallet-button:active {
  transform: translateY(0);
}

.icon {
  width: 20px;
  height: 20px;
  stroke-width: 2;
}
</style>