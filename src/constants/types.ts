export type IslandVariant = 
  | 'crossChainBridge' 
  | 'remittanceFX' 
  | 'yieldStream';

// 1. Cross-Chain Bridge & Gasless Rail Variant Data
export interface CrossChainBridgeData {
  sourceChain: 'base' | 'solana' | 'arbitrum' | 'polygon' | 'ethereum';
  destinationChain: 'base' | 'solana' | 'arbitrum' | 'polygon' | 'ethereum';
  tokenSymbol: 'USDC' | 'USDT' | 'EURC';
  amount: number;
  routeProtocol: 'Circle CCTP' | 'Hyperlane' | 'LayerZero' | 'Across';
  gasless: boolean;
  estimatedSeconds: number;
  stage: 'burn' | 'attestation' | 'mint' | 'settled';
  txHash?: string;
  onChainSpeed: string;
}

// 2. 3D Flippable Remittance & FX Card Variant Data
export interface RemittanceFXData {
  senderAmount: number;
  senderCurrency: 'USDC' | 'USDT' | 'PYUSD';
  fiatCurrency: 'NGN' | 'KES' | 'EUR' | 'BRL' | 'GHS' | 'INR' | 'PHP';
  exchangeRate: number;
  payoutAmount: number;
  recipientName: string;
  recipientBank: string;
  accountNumber: string;
  rateLockedSeconds: number;
  payoutSpeed: 'Instant Rail' | 'Under 60s' | 'SEPA Instant';
  guaranteedBy: string;
}

// 3. Real-Time Yield Streamer Variant Data
export interface YieldStreamData {
  vaultName: string;
  protocol: 'Aave v3' | 'Morpho Blue' | 'Compound v3' | 'Sky / Maker';
  asset: 'USDC' | 'USDT' | 'EURC';
  depositedAmount: number;
  currentYieldAccrued: number;
  apy: number;
  dailyYieldUsd: number;
  annualYieldUsd: number;
  instantLiquidity: boolean;
}

// Master Island Props (Discriminated Union)
export type StableIslandProps =
  | {
      variant: 'crossChainBridge';
      data: CrossChainBridgeData;
      visible: boolean;
      onDismiss?: () => void;
      onAction?: () => void;
    }
  | {
      variant: 'remittanceFX';
      data: RemittanceFXData;
      visible: boolean;
      onDismiss?: () => void;
      onAction?: () => void;
    }
  | {
      variant: 'yieldStream';
      data: YieldStreamData;
      visible: boolean;
      onDismiss?: () => void;
      onAction?: () => void;
    };

export interface StableIslandRef {
  triggerSettled: (customMsg?: string) => void;
  triggerFailed: (errorMsg?: string) => void;
  expand: () => void;
  collapse: () => void;
  dismiss: () => void;
}
