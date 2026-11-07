'use client';

import { useMemo } from 'react';
import { useAccount, useBytecode } from 'wagmi';
import { toFunctionSelector, type AbiFunction } from 'viem';
import { ACTIVE_CHAIN } from '@/lib/wagmi';
import { CONTRACT_ADDRESS } from '@/config';
import { MovieVotingDAO } from '@/contracts/abis/MovieVotingDAO';

export type DaoContractStatus =
  /** Adres tanımlı değil */
  | 'unconfigured'
  /** Bytecode sorgulanıyor */
  | 'checking'
  /** RPC'ye ulaşılamadı */
  | 'unreachable'
  /** Adreste sözleşme yok */
  | 'no-code'
  /** Sözleşme var ama MovieVotingDAO fonksiyonlarını taşımıyor */
  | 'foreign'
  | 'ready';

const REQUIRED: readonly string[] = ['proposalCount', 'createProposal', 'vote', 'getProposal', 'hasVoted'];

type AbiItem = (typeof MovieVotingDAO.abi)[number];

/** Zorunlu fonksiyonların 4 baytlık seçicileri; dağıtılmış bytecode içinde aranır */
const REQUIRED_SELECTORS: readonly string[] = MovieVotingDAO.abi
  .filter((item): item is Extract<AbiItem, { type: 'function' }> => item.type === 'function' && REQUIRED.includes(item.name))
  .map((fn) => toFunctionSelector(fn as AbiFunction).slice(2).toLowerCase());

/**
 * DAO sözleşmesinin gerçekten bizim sözleşmemiz olduğunu doğrular: adres tanımlı mı, Sepolia'da kod var mı,
 * kod oylama fonksiyonlarını içeriyor mu. Yazma işlemleri yalnızca `canWrite` doğruyken yapılmalı.
 */
export function useDaoContract() {
  const { chain, isConnected } = useAccount();
  const { data: bytecode, isPending, isError } = useBytecode({
    address: CONTRACT_ADDRESS,
    chainId: ACTIVE_CHAIN.id,
    query: { enabled: Boolean(CONTRACT_ADDRESS), staleTime: 5 * 60_000, retry: 1 },
  });

  const status: DaoContractStatus = useMemo(() => {
    if (!CONTRACT_ADDRESS) return 'unconfigured';
    if (isError) return 'unreachable';
    if (isPending) return 'checking';
    if (!bytecode || bytecode === '0x') return 'no-code';
    const code = bytecode.toLowerCase();
    return REQUIRED_SELECTORS.every((selector) => code.includes(selector)) ? 'ready' : 'foreign';
  }, [bytecode, isPending, isError]);

  const onActiveChain = chain?.id === ACTIVE_CHAIN.id;

  return {
    address: CONTRACT_ADDRESS,
    status,
    ready: status === 'ready',
    isConnected,
    onActiveChain,
    /** Sözleşme doğrulanmış, cüzdan bağlı ve doğru ağda */
    canWrite: status === 'ready' && isConnected && onActiveChain,
    chainName: ACTIVE_CHAIN.name,
    explorerUrl: CONTRACT_ADDRESS ? `https://sepolia.etherscan.io/address/${CONTRACT_ADDRESS}` : null,
  };
}
