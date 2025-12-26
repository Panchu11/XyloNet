// Token Logo Components - Using official downloaded icons
import Image from 'next/image'

interface TokenLogoProps {
  size?: number
  className?: string
}

// Token icons using downloaded official images
export function USDCLogo({ size = 32, className = '' }: TokenLogoProps) {
  return (
    <Image
      src="/tokens/usdc.png"
      alt="USDC"
      width={size}
      height={size}
      className={`rounded-full ${className}`}
    />
  )
}

export function EURCLogo({ size = 32, className = '' }: TokenLogoProps) {
  return (
    <Image
      src="/tokens/eurc.png"
      alt="EURC"
      width={size}
      height={size}
      className={`rounded-full ${className}`}
    />
  )
}

export function USYCLogo({ size = 32, className = '' }: TokenLogoProps) {
  return (
    <Image
      src="/tokens/usyc.png"
      alt="USYC"
      width={size}
      height={size}
      className={`rounded-full ${className}`}
    />
  )
}

export function TokenLogo({ symbol, size = 32, className = '' }: TokenLogoProps & { symbol: string }) {
  switch (symbol.toUpperCase()) {
    case 'USDC':
      return <USDCLogo size={size} className={className} />
    case 'EURC':
      return <EURCLogo size={size} className={className} />
    case 'USYC':
      return <USYCLogo size={size} className={className} />
    default:
      return (
        <div 
          className={`rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center ${className}`}
          style={{ width: size, height: size }}
        >
          <span className="text-white font-bold" style={{ fontSize: size * 0.4 }}>
            {symbol[0]}
          </span>
        </div>
      )
  }
}

// Official Chain Logos - Using downloaded official images

export function EthereumLogo({ size = 32, className = '' }: TokenLogoProps) {
  return (
    <Image
      src="/chains/ethereum.svg"
      alt="Ethereum"
      width={size}
      height={size}
      className={className}
    />
  )
}

export function ArbitrumLogo({ size = 32, className = '' }: TokenLogoProps) {
  return (
    <Image
      src="/chains/arbitrum.svg"
      alt="Arbitrum"
      width={size}
      height={size}
      className={className}
    />
  )
}

export function BaseLogo({ size = 32, className = '' }: TokenLogoProps) {
  return (
    <Image
      src="/chains/base.jpg"
      alt="Base"
      width={size}
      height={size}
      className={`rounded-full ${className}`}
    />
  )
}

export function OptimismLogo({ size = 32, className = '' }: TokenLogoProps) {
  return (
    <Image
      src="/chains/optimism.svg"
      alt="Optimism"
      width={size}
      height={size}
      className={className}
    />
  )
}

export function PolygonLogo({ size = 32, className = '' }: TokenLogoProps) {
  return (
    <Image
      src="/chains/polygon.svg"
      alt="Polygon"
      width={size}
      height={size}
      className={className}
    />
  )
}

export function AvalancheLogo({ size = 32, className = '' }: TokenLogoProps) {
  return (
    <Image
      src="/chains/avalanche.svg"
      alt="Avalanche"
      width={size}
      height={size}
      className={className}
    />
  )
}

// Arc Logo - Uses XyloNet branding
export function ArcLogo({ size = 32, className = '' }: TokenLogoProps) {
  return (
    <Image
      src="/logo.png"
      alt="Arc"
      width={size}
      height={size}
      className={`rounded-full ${className}`}
    />
  )
}

// XyloNet Logo
export function XyloNetLogo({ size = 32, className = '' }: TokenLogoProps) {
  return (
    <Image 
      src="/logo.png" 
      alt="XyloNet" 
      width={size} 
      height={size} 
      className={`rounded-lg ${className}`}
    />
  )
}

// XyloNet Logo Fallback (when no custom logo provided)
export function XyloNetLogoFallback({ size = 32, className = '' }: TokenLogoProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 256 256" className={className}>
      <defs>
        <linearGradient id="xyloGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#6366F1"/>
          <stop offset="50%" stopColor="#8B5CF6"/>
          <stop offset="100%" stopColor="#A855F7"/>
        </linearGradient>
      </defs>
      <circle cx="128" cy="128" r="128" fill="url(#xyloGrad)"/>
      <text x="128" y="148" textAnchor="middle" fill="white" fontSize="100" fontFamily="Arial" fontWeight="bold">X</text>
    </svg>
  )
}

export function ChainLogo({ name, size = 32, className = '' }: TokenLogoProps & { name: string }) {
  const chainName = name.toLowerCase()
  
  if (chainName.includes('ethereum') || chainName === 'sepolia') {
    return <EthereumLogo size={size} className={className} />
  }
  if (chainName.includes('arbitrum')) {
    return <ArbitrumLogo size={size} className={className} />
  }
  if (chainName.includes('base')) {
    return <BaseLogo size={size} className={className} />
  }
  if (chainName.includes('optimism')) {
    return <OptimismLogo size={size} className={className} />
  }
  if (chainName.includes('polygon') || chainName.includes('amoy')) {
    return <PolygonLogo size={size} className={className} />
  }
  if (chainName.includes('avalanche') || chainName.includes('fuji')) {
    return <AvalancheLogo size={size} className={className} />
  }
  if (chainName.includes('arc')) {
    return <ArcLogo size={size} className={className} />
  }
  
  // Default fallback
  return (
    <div 
      className={`rounded-full flex items-center justify-center bg-gray-600 ${className}`}
      style={{ width: size, height: size }}
    >
      <span className="text-white font-bold" style={{ fontSize: size * 0.4 }}>
        {name[0]}
      </span>
    </div>
  )
}
