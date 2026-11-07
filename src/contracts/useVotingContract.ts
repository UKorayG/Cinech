'use client';

import { useCallback, useMemo } from 'react';
import { useAccount, usePublicClient, useReadContract, useWriteContract } from 'wagmi';
import type { Address } from 'viem';
import { ACTIVE_CHAIN } from '@/lib/wagmi';
import { useDaoContract, type DaoContractStatus } from '@/hooks/useDaoContract';
import { MovieVotingDAO } from './abis/MovieVotingDAO';
import { ProposalType, type MediaProposal, type Proposal, type ProposalStatus } from './types';

const ABI = MovieVotingDAO.abi;

/** Zincir işlemi engellendiğinde fırlatılır; arayüz `status` alanına göre açıklama gösterir */
export class DaoContractError extends Error {
  constructor(readonly status: DaoContractStatus | 'wallet' | 'chain') {
    super(`DAO contract not writable: ${status}`);
    this.name = 'DaoContractError';
  }
}

/**
 * MovieVotingDAO ile konuşan kanca. Okumalar doğrulanmış sözleşme adresinden yapılır; yazmalar
 * yalnızca sözleşme doğrulanmış, cüzdan bağlı ve Sepolia'dayken gönderilir.
 */
export function useVotingContract() {
  const { address: account } = useAccount();
  const contract = useDaoContract();
  const publicClient = usePublicClient({ chainId: ACTIVE_CHAIN.id });
  const { writeContractAsync } = useWriteContract();

  const { data: proposalCount = 0n, refetch: refetchCount } = useReadContract({
    address: contract.address,
    abi: ABI,
    functionName: 'proposalCount',
    chainId: ACTIVE_CHAIN.id,
    query: { enabled: contract.ready },
  });

  const assertWritable = useCallback((): Address => {
    if (contract.status !== 'ready' || !contract.address) throw new DaoContractError(contract.status);
    if (!contract.isConnected || !account) throw new DaoContractError('wallet');
    if (!contract.onActiveChain) throw new DaoContractError('chain');
    return contract.address;
  }, [contract, account]);

  const getProposal = useCallback(
    async (proposalId: number | bigint): Promise<Proposal> => {
      if (!publicClient || !contract.ready || !contract.address) throw new DaoContractError(contract.status);
      const address = contract.address;
      const id = BigInt(proposalId);
      const [raw, media, voted] = await Promise.all([
        publicClient.readContract({ address, abi: ABI, functionName: 'getProposal', args: [id] }),
        publicClient.readContract({ address, abi: ABI, functionName: 'getMediaProposal', args: [id] }),
        account ? publicClient.readContract({ address, abi: ABI, functionName: 'hasVoted', args: [id, account] }) : Promise.resolve(false),
      ]);
      const [pid, title, description, startTime, endTime, yesVotes, noVotes, creator, proposalType, status, executed] = raw;
      if (pid === 0n) throw new Error(`Proposal ${id} not found`);
      const [ipfsHash, metadataHash, approved] = media;
      const mediaProposal: MediaProposal | undefined = ipfsHash || metadataHash ? { ipfsHash, metadataHash, approved } : undefined;
      return {
        id: pid,
        title,
        description,
        startTime,
        endTime,
        yesVotes,
        noVotes,
        creator,
        proposalType: proposalType as ProposalType,
        status: status as ProposalStatus,
        executed,
        hasVoted: voted,
        mediaProposal,
      };
    },
    [publicClient, contract, account],
  );

  const getProposals = useCallback(
    async (from = 1, to?: number): Promise<Proposal[]> => {
      if (!publicClient || !contract.ready || !contract.address) return [];
      const count = Number(await publicClient.readContract({ address: contract.address, abi: ABI, functionName: 'proposalCount' }));
      const last = Math.min(count, to ?? count);
      const ids = Array.from({ length: Math.max(0, last - from + 1) }, (_, i) => from + i);
      const results = await Promise.allSettled(ids.map((id) => getProposal(id)));
      return results.flatMap((r) => (r.status === 'fulfilled' ? [r.value] : []));
    },
    [publicClient, contract, getProposal],
  );

  const createProposal = useCallback(
    async (type: ProposalType, title: string, description: string, durationSeconds: number, ipfsHash: string, metadataHash: string) => {
      const address = assertWritable();
      const hash = await writeContractAsync({
        address,
        abi: ABI,
        functionName: 'createProposal',
        args: [title, description, BigInt(durationSeconds), type, ipfsHash, metadataHash],
        chainId: ACTIVE_CHAIN.id,
      });
      await publicClient?.waitForTransactionReceipt({ hash });
      await refetchCount();
      return hash;
    },
    [assertWritable, writeContractAsync, publicClient, refetchCount],
  );

  const createMovieProposal = useCallback(
    (title: string, description: string, duration: number, ipfsHash: string, metadataHash: string) =>
      createProposal(ProposalType.Movie, title, description, duration, ipfsHash, metadataHash),
    [createProposal],
  );

  const createUploadProposal = useCallback(
    (title: string, description: string, duration: number, ipfsHash: string, metadataHash: string) =>
      createProposal(ProposalType.Upload, title, description, duration, ipfsHash, metadataHash),
    [createProposal],
  );

  const voteOnProposal = useCallback(
    async (proposalId: number | bigint, support: boolean) => {
      const address = assertWritable();
      const hash = await writeContractAsync({ address, abi: ABI, functionName: 'vote', args: [BigInt(proposalId), support], chainId: ACTIVE_CHAIN.id });
      await publicClient?.waitForTransactionReceipt({ hash });
      return hash;
    },
    [assertWritable, writeContractAsync, publicClient],
  );

  const executeProposal = useCallback(
    async (proposalId: number | bigint) => {
      const address = assertWritable();
      const hash = await writeContractAsync({ address, abi: ABI, functionName: 'executeProposal', args: [BigInt(proposalId)], chainId: ACTIVE_CHAIN.id });
      await publicClient?.waitForTransactionReceipt({ hash });
      return hash;
    },
    [assertWritable, writeContractAsync, publicClient],
  );

  const getProposalCount = useCallback(async () => Number(proposalCount), [proposalCount]);

  return useMemo(
    () => ({
      contract,
      createMovieProposal,
      createUploadProposal,
      voteOnProposal,
      executeProposal,
      getProposal,
      getProposalCount,
      getProposals,
    }),
    [contract, createMovieProposal, createUploadProposal, voteOnProposal, executeProposal, getProposal, getProposalCount, getProposals],
  );
}
