import { getAddress, isAddress } from 'viem';

const raw = process.env.NEXT_PUBLIC_DAO_CONTRACT_ADDRESS?.trim();

/**
 * Sepolia'daki MovieVotingDAO adresi. `.env.local` içinde NEXT_PUBLIC_DAO_CONTRACT_ADDRESS ile verilir
 * (scripts/deploy-dao.js dağıtımdan sonra kendisi yazar). Tanımlı değilse ya da adreste doğrulanmış bir
 * Cinech DAO sözleşmesi yoksa zincire yazma işlemleri kapalı kalır; bkz. hooks/useDaoContract.
 */
export const CONTRACT_ADDRESS: `0x${string}` | undefined =
  raw && isAddress(raw, { strict: false }) ? getAddress(raw) : undefined;

// IPFS configuration
export const IPFS_GATEWAY = 'https://ipfs.io/ipfs/';

// Default voting duration in seconds (7 days)
export const DEFAULT_VOTING_DURATION = 7 * 24 * 60 * 60;

// Minimum votes required for a proposal to pass
export const MINIMUM_VOTES = 10;
