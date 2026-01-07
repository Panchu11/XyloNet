// Quick reference: Enable Base Sepolia after ETH Sepolia testing succeeds

// File: frontend/src/components/bridge/BridgeWidget.tsx
// Line: ~632

// CURRENT (only Sepolia):
const isComingSoon = chain.id !== 'Ethereum_Sepolia'

// CHANGE TO (Sepolia + Base):
const isComingSoon = !['Ethereum_Sepolia', 'Base_Sepolia'].includes(chain.id)

// ALTERNATIVE (enable all chains at once):
const isComingSoon = false // Enables all chains
