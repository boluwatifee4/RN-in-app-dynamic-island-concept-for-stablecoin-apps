export interface StablecoinAsset {
  symbol: string;
  name: string;
  issuer: string;
  pegCurrency: 'USD' | 'EUR';
  balance: number;
  apy: number;
  iconColor: string;
  iconUrl?: string;
  supportedNetworks: string[];
}

export interface FiatCurrency {
  code: string;
  name: string;
  symbol: string;
  country: string;
  flag: string;
  defaultRatePerUsd: number;
}

export const STABLECOINS: Record<string, StablecoinAsset> = {
  USDC: {
    symbol: 'USDC',
    name: 'USD Coin',
    issuer: 'Circle',
    pegCurrency: 'USD',
    balance: 8450.00,
    apy: 5.25,
    iconColor: '#2775CA',
    iconUrl: 'https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48/logo.png',
    supportedNetworks: ['base', 'solana', 'arbitrum', 'polygon', 'ethereum'],
  },
  USDT: {
    symbol: 'USDT',
    name: 'Tether USD',
    issuer: 'Tether',
    pegCurrency: 'USD',
    balance: 3820.50,
    apy: 4.80,
    iconColor: '#26A17B',
    iconUrl: 'https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/0xdAC17F958D2ee523a2206206994597C13D831ec7/logo.png',
    supportedNetworks: ['solana', 'arbitrum', 'polygon', 'ethereum'],
  },
  EURC: {
    symbol: 'EURC',
    name: 'Euro Coin',
    issuer: 'Circle',
    pegCurrency: 'EUR',
    balance: 1600.00,
    apy: 3.90,
    iconColor: '#0052FF',
    iconUrl: 'https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/0x1aBaEA1f7C830bD89Acc67eC4af516284b1bC33c/logo.png',
    supportedNetworks: ['base', 'ethereum', 'solana'],
  },
  PYUSD: {
    symbol: 'PYUSD',
    name: 'PayPal USD',
    issuer: 'Paxos / PayPal',
    pegCurrency: 'USD',
    balance: 500.00,
    apy: 4.50,
    iconColor: '#003087',
    iconUrl: 'https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/0x6c3ea9036406852006290770BEdFcAbA0e23A0e8/logo.png',
    supportedNetworks: ['solana', 'ethereum'],
  },
};

export const FIAT_REMITTANCE_PAIRS: Record<string, FiatCurrency> = {
  NGN: {
    code: 'NGN',
    name: 'Nigerian Naira',
    symbol: '₦',
    country: 'Nigeria',
    flag: '🇳🇬',
    defaultRatePerUsd: 1485.00,
  },
  KES: {
    code: 'KES',
    name: 'Kenyan Shilling',
    symbol: 'KSh',
    country: 'Kenya',
    flag: '🇰🇪',
    defaultRatePerUsd: 129.50,
  },
  EUR: {
    code: 'EUR',
    name: 'Euro',
    symbol: '€',
    country: 'European Union',
    flag: '🇪🇺',
    defaultRatePerUsd: 0.92,
  },
  BRL: {
    code: 'BRL',
    name: 'Brazilian Real',
    symbol: 'R$',
    country: 'Brazil',
    flag: '🇧🇷',
    defaultRatePerUsd: 5.48,
  },
  GHS: {
    code: 'GHS',
    name: 'Ghanaian Cedi',
    symbol: 'GH₵',
    country: 'Ghana',
    flag: '🇬🇭',
    defaultRatePerUsd: 15.60,
  },
  INR: {
    code: 'INR',
    name: 'Indian Rupee',
    symbol: '₹',
    country: 'India',
    flag: '🇮🇳',
    defaultRatePerUsd: 83.90,
  },
  PHP: {
    code: 'PHP',
    name: 'Philippine Peso',
    symbol: '₱',
    country: 'Philippines',
    flag: '🇵🇭',
    defaultRatePerUsd: 56.40,
  },
};
