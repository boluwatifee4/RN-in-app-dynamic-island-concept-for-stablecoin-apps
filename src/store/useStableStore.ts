import { create } from 'zustand';
import type { 
  IslandVariant, 
  CrossChainBridgeData, 
  RemittanceFXData, 
  YieldStreamData, 
} from '../constants/types';
import { generateTxHash } from '../services/rpcService';

export interface LedgerItem {
  id: string;
  type: 'send' | 'receive' | 'bridge' | 'remit' | 'yield';
  title: string;
  subtitle: string;
  amount: number;
  currency: string;
  network: string;
  timestamp: number;
  status: 'settled' | 'pending' | 'failed';
  txHash?: string;
  fiatEquivalent?: string;
}

// Transaction status for the island overlay
export type TransactionStage = 'idle' | 'burning' | 'attesting' | 'minting' | 'settled' | 'failed';

export interface TransactionStatus {
  id: string;
  type: 'bridge' | 'send' | 'remittance' | 'yield';
  stage: TransactionStage;
  progress: number; // 0-100
  title: string;
  subtitle: string;
  txHash?: string;
  startTime: number;
}

interface ActiveIslandState {
  variant: IslandVariant;
  visible: boolean;
  data: CrossChainBridgeData | RemittanceFXData | YieldStreamData;
}

interface StableStoreState {
  // Balances
  usdcBalance: number;
  usdtBalance: number;
  eurcBalance: number;
  totalUsdBalance: number;
  selectedFiatCode: string;

  // Active Island (legacy - will be phased out)
  activeIsland: ActiveIslandState | null;

  // Transaction Status (for island overlay)
  activeTransaction: TransactionStatus | null;

  // Send flow
  sendAmount: string;
  sendRecipient: string;
  sendNetwork: string;

  // Bridge flow
  bridgeSource: string;
  bridgeDest: string;
  bridgeAmount: string;

  // FX flow
  fxSendAmount: string;
  fxFiatCurrency: string;
  fxRecipientName: string;
  fxRecipientBank: string;
  fxAccountNumber: string;

  // Yield flow
  yieldDepositAmount: string;
  yieldVault: string;

  // Ledger
  ledger: LedgerItem[];

  // Live RPC state
  currentBlockNumber: number;
  currentGasGwei: number;

  // Actions
  setSelectedFiatCode: (code: string) => void;
  setLiveRpc: (block: number, gas: number) => void;

  // Island actions
  showIsland: (variant: IslandVariant, data: ActiveIslandState['data']) => void;
  hideIsland: () => void;

  // Transaction actions
  startTransaction: (type: TransactionStatus['type'], title: string, subtitle: string) => void;
  updateTransactionStage: (stage: TransactionStage, progress: number) => void;
  completeTransaction: () => void;
  failTransaction: () => void;
  dismissTransaction: () => void;
  deductBalance: (amount: number, currency?: 'usdc' | 'usdt' | 'eurc') => void;

  // Flow setters
  setSendFlow: (data: Partial<Pick<StableStoreState, 'sendAmount' | 'sendRecipient' | 'sendNetwork'>>) => void;
  setBridgeFlow: (data: Partial<Pick<StableStoreState, 'bridgeSource' | 'bridgeDest' | 'bridgeAmount'>>) => void;
  setFxFlow: (data: Partial<Pick<StableStoreState, 'fxSendAmount' | 'fxFiatCurrency' | 'fxRecipientName' | 'fxRecipientBank' | 'fxAccountNumber'>>) => void;
  setYieldFlow: (data: Partial<Pick<StableStoreState, 'yieldDepositAmount' | 'yieldVault'>>) => void;
  resetFlows: () => void;

  addLedgerItem: (item: LedgerItem) => void;
}

const INITIAL_FLOWS = {
  sendAmount: '',
  sendRecipient: '',
  sendNetwork: 'base',
  bridgeSource: 'base',
  bridgeDest: 'solana',
  bridgeAmount: '',
  fxSendAmount: '',
  fxFiatCurrency: 'NGN',
  fxRecipientName: '',
  fxRecipientBank: '',
  fxAccountNumber: '',
  yieldDepositAmount: '',
  yieldVault: 'aave',
};

export const useStableStore = create<StableStoreState>((set, get) => ({
  usdcBalance: 8450.00,
  usdtBalance: 3820.50,
  eurcBalance: 1600.00,
  totalUsdBalance: 14370.50,
  selectedFiatCode: 'USD',

  currentBlockNumber: 21854190,
  currentGasGwei: 0.0012,

  activeIsland: null,
  activeTransaction: null,

  ...INITIAL_FLOWS,

  ledger: [
    {
      id: 'tx-1',
      type: 'send',
      title: 'Sent to @vitalik.eth',
      subtitle: 'Gasless Paymaster on Base',
      amount: 250.00,
      currency: 'USDC',
      network: 'Base',
      timestamp: Date.now() - 1000 * 60 * 12,
      status: 'settled',
      txHash: '0x8f2a991c0b3291...e491',
      fiatEquivalent: '$250.00',
    },
    {
      id: 'tx-2',
      type: 'remit',
      title: 'Remittance to Alex O.',
      subtitle: 'Instant Bank Rail (GTBank)',
      amount: 400.00,
      currency: 'USDC',
      network: 'Base',
      timestamp: Date.now() - 1000 * 60 * 45,
      status: 'settled',
      txHash: '0x3c91af0219...bb48',
      fiatEquivalent: '₦594,000.00',
    },
    {
      id: 'tx-3',
      type: 'yield',
      title: 'Aave v3 Yield Auto-Compound',
      subtitle: '+5.32% APY Harvested',
      amount: 14.82,
      currency: 'USDC',
      network: 'Base',
      timestamp: Date.now() - 1000 * 60 * 180,
      status: 'settled',
      fiatEquivalent: '+$14.82',
    },
    {
      id: 'tx-4',
      type: 'receive',
      title: 'Received from @solara.pay',
      subtitle: 'Solana High Speed Rail',
      amount: 1200.00,
      currency: 'USDC',
      network: 'Solana',
      timestamp: Date.now() - 1000 * 60 * 360,
      status: 'settled',
      txHash: '5Knp8Z4T...9wXy',
      fiatEquivalent: '$1,200.00',
    },
  ],

  setSelectedFiatCode: (code) => set({ selectedFiatCode: code }),
  setLiveRpc: (block, gas) => set({ currentBlockNumber: block, currentGasGwei: gas }),

  showIsland: (variant, data) =>
    set({ activeIsland: { variant, visible: true, data } }),

  hideIsland: () =>
    set((state) => ({
      activeIsland: state.activeIsland
        ? { ...state.activeIsland, visible: false }
        : null,
    })),

  // Transaction status actions
  startTransaction: (type, title, subtitle) =>
    set({
      activeTransaction: {
        id: generateTxHash(),
        type,
        stage: 'burning',
        progress: 0,
        title,
        subtitle,
        startTime: Date.now(),
      },
    }),

  updateTransactionStage: (stage, progress) =>
    set((state) => {
      if (!state.activeTransaction) return state;
      return {
        activeTransaction: { ...state.activeTransaction, stage, progress },
      };
    }),

  completeTransaction: () =>
    set((state) => {
      if (!state.activeTransaction) return state;
      return {
        activeTransaction: { ...state.activeTransaction, stage: 'settled', progress: 100 },
      };
    }),

  failTransaction: () =>
    set((state) => {
      if (!state.activeTransaction) return state;
      return {
        activeTransaction: { ...state.activeTransaction, stage: 'failed', progress: 0 },
      };
    }),

  dismissTransaction: () => set({ activeTransaction: null }),

  deductBalance: (amount, currency = 'usdc') =>
    set((state) => {
      const key = `${currency}Balance` as const;
      const current = state[key];
      const newBalance = Math.max(0, current - amount);
      return {
        [key]: newBalance,
        totalUsdBalance: state.usdcBalance + state.usdtBalance + state.eurcBalance
          - (currency === 'usdc' ? amount : 0)
          - (currency === 'usdt' ? amount : 0)
          - (currency === 'eurc' ? amount : 0)
          + (currency === 'usdc' ? newBalance : 0)
          + (currency === 'usdt' ? newBalance : 0)
          + (currency === 'eurc' ? newBalance : 0),
      };
    }),

  // Flow setters
  setSendFlow: (data) => set((s) => ({ ...s, ...data })),
  setBridgeFlow: (data) => set((s) => ({ ...s, ...data })),
  setFxFlow: (data) => set((s) => ({ ...s, ...data })),
  setYieldFlow: (data) => set((s) => ({ ...s, ...data })),
  resetFlows: () => set(INITIAL_FLOWS),

  addLedgerItem: (item) =>
    set((state) => ({ ledger: [item, ...state.ledger] })),
}));
