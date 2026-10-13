/**
 * Live Blockchain RPC & Settlement Service
 * Connects directly to public EVM / Base RPCs for real block heights and gas prices.
 */

export interface LiveChainState {
  blockNumber: number;
  gasPriceGwei: number;
  baseFeeGwei: number;
  latencyMs: number;
  lastUpdated: number;
  /** true when RPC is unreachable — block/gas are estimates, not live values */
  isFallback: boolean;
}

const BASE_RPC_URL = 'https://mainnet.base.org';

/**
 * Shown when the RPC is unreachable. The block number is a rough estimate
 * (1 block / 2s since 2024-09-10) and must be labelled as offline by callers.
 */
function offlineState(latencyMs = 0): LiveChainState {
  return {
    blockNumber: 21850000 + Math.floor((Date.now() - 1726000000000) / 2000),
    gasPriceGwei: 0.0015,
    baseFeeGwei: 0.001,
    latencyMs,
    lastUpdated: Date.now(),
    isFallback: true,
  };
}

export async function fetchLiveBaseState(): Promise<LiveChainState> {
  const startTime = Date.now();
  try {
    const blockPromise = fetch(BASE_RPC_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        jsonrpc: '2.0',
        id: 1,
        method: 'eth_blockNumber',
        params: [],
      }),
    }).then((res) => res.json());

    const gasPromise = fetch(BASE_RPC_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        jsonrpc: '2.0',
        id: 2,
        method: 'eth_gasPrice',
        params: [],
      }),
    }).then((res) => res.json());

    const [blockData, gasData] = await Promise.all([blockPromise, gasPromise]);
    const latency = Date.now() - startTime;

    if (!blockData?.result || !gasData?.result) {
      return offlineState(latency);
    }

    const blockNumber = parseInt(blockData.result, 16);
    const gasWei = parseInt(gasData.result, 16);
    const gasGwei = parseFloat((gasWei / 1e9).toFixed(4));

    return {
      blockNumber,
      gasPriceGwei: Math.max(0.001, gasGwei),
      baseFeeGwei: 0.001,
      latencyMs: latency,
      lastUpdated: Date.now(),
      isFallback: false,
    };
  } catch (error) {
    return offlineState();
  }
}

/**
 * Generates a random mock TX hash (settlement is simulated end-to-end)
 */
export function generateTxHash(): string {
  const chars = '0123456789abcdef';
  let hash = '0x';
  for (let i = 0; i < 64; i++) {
    hash += chars[Math.floor(Math.random() * chars.length)];
  }
  return hash;
}

/**
 * Generates standard ERC-20 transfer calldata for demonstration
 */
export function generateTransferCalldata(toAddress: string, amountUnits: number): string {
  const methodSig = '0xa9059cbb'; // transfer(address,uint256)
  const paddedAddress = toAddress.replace('0x', '').toLowerCase().padStart(64, '0');
  const amountHex = (amountUnits * 1e6).toString(16).padStart(64, '0');
  return `${methodSig}${paddedAddress}${amountHex}`;
}

export function truncateAddress(addr: string, prefix = 6, suffix = 4): string {
  if (!addr || addr.length < prefix + suffix) return addr;
  return `${addr.slice(0, prefix)}...${addr.slice(-suffix)}`;
}
