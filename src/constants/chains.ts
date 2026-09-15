export interface BlockchainNetwork {
  id: string;
  name: string;
  shortName: string;
  symbol: string;
  color: string;
  iconUrl?: string;
  avgBlockTime: string;
  avgFeeUsd: number;
  rpcUrl?: string;
  explorerUrl: string;
  isLayer2: boolean;
  supportsPaymaster: boolean;
}

export const NETWORKS: Record<string, BlockchainNetwork> = {
  base: {
    id: 'base',
    name: 'Base Mainnet',
    shortName: 'Base',
    symbol: 'ETH',
    color: '#0052FF',
    iconUrl: 'https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/base/info/logo.png',
    avgBlockTime: '2.0s',
    avgFeeUsd: 0.0008,
    rpcUrl: 'https://mainnet.base.org',
    explorerUrl: 'https://basescan.org',
    isLayer2: true,
    supportsPaymaster: true,
  },
  solana: {
    id: 'solana',
    name: 'Solana',
    shortName: 'Solana',
    symbol: 'SOL',
    color: '#9945FF',
    iconUrl: 'https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/solana/info/logo.png',
    avgBlockTime: '0.4s',
    avgFeeUsd: 0.0005,
    rpcUrl: 'https://api.mainnet-beta.solana.com',
    explorerUrl: 'https://solscan.io',
    isLayer2: false,
    supportsPaymaster: true,
  },
  arbitrum: {
    id: 'arbitrum',
    name: 'Arbitrum One',
    shortName: 'Arbitrum',
    symbol: 'ETH',
    color: '#28A0F0',
    iconUrl: 'https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/arbitrum/info/logo.png',
    avgBlockTime: '0.25s',
    avgFeeUsd: 0.0035,
    rpcUrl: 'https://arb1.arbitrum.io/rpc',
    explorerUrl: 'https://arbiscan.io',
    isLayer2: true,
    supportsPaymaster: true,
  },
  polygon: {
    id: 'polygon',
    name: 'Polygon PoS',
    shortName: 'Polygon',
    symbol: 'POL',
    color: '#8247E5',
    iconUrl: 'https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/polygon/info/logo.png',
    avgBlockTime: '2.1s',
    avgFeeUsd: 0.002,
    rpcUrl: 'https://polygon-rpc.com',
    explorerUrl: 'https://polygonscan.com',
    isLayer2: true,
    supportsPaymaster: true,
  },
  ethereum: {
    id: 'ethereum',
    name: 'Ethereum Mainnet',
    shortName: 'Ethereum',
    symbol: 'ETH',
    color: '#627EEA',
    iconUrl: 'https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/info/logo.png',
    avgBlockTime: '12.0s',
    avgFeeUsd: 3.45,
    rpcUrl: 'https://cloudflare-eth.com',
    explorerUrl: 'https://etherscan.io',
    isLayer2: false,
    supportsPaymaster: false,
  },
};
