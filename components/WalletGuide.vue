<template>
  <div class="wallet-guide">
    <h3>Install Paytaca Wallet</h3>
    
    <div class="guide-steps">
      <div class="step">
        <div class="step-number">1</div>
        <div class="step-content">
          <h4>Download Paytaca</h4>
          <p>Get Paytaca Wallet from your app store</p>
          <div class="store-buttons">
            <a href="https://play.google.com/store/apps/details?id=com.paytaca" target="_blank">
              <button class="store-btn android">Google Play</button>
            </a>
            <a href="https://apps.apple.com/app/paytaca-wallet/id123456" target="_blank">
              <button class="store-btn ios">App Store</button>
            </a>
          </div>
        </div>
      </div>
      
      <div class="step">
        <div class="step-number">2</div>
        <div class="step-content">
          <h4>Create or Import Wallet</h4>
          <p>Set up your wallet and secure your recovery phrase</p>
        </div>
      </div>
      
      <div class="step">
        <div class="step-number">3</div>
        <div class="step-content">
          <h4>Connect to Lend</h4>
          <p>Return here and click "Connect Wallet"</p>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.wallet-guide {
  padding: 20px;
}

.guide-steps {
  display: flex;
  flex-direction: column;
  gap: 20px;
  margin-top: 20px;
}

.step {
  display: flex;
  gap: 15px;
  align-items: flex-start;
}

.step-number {
  background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
  color: white;
  width: 30px;
  height: 30px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  flex-shrink: 0;
}

.step-content h4 {
  margin: 0 0 5px 0;
  color: var(--text-dark);
}

.step-content p {
  margin: 0;
  color: var(--text-gray);
  font-size: 14px;
}

.store-buttons {
  display: flex;
  gap: 10px;
  margin-top: 10px;
}

.store-btn {
  padding: 8px 16px;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
}

.store-btn.android {
  background: #3DDC84;
  color: #000;
}

.store-btn.ios {
  background: #000;
  color: #fff;
}
</style>