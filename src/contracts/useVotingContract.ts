import { useAccount, useReadContract, useWriteContract, useChainId } from 'wagmi';
import { MovieVotingDAO } from '@/contracts/abis/MovieVotingDAO';
import { CONTRACT_ADDRESS } from '@/config';
import { useCallback, useMemo } from 'react';
import { Address, isAddress } from 'viem';

export function useVotingContract() {
  const { address } = useAccount();
  const chainId = useChainId();
  
  const contractConfig = useMemo(() => ({
    address: CONTRACT_ADDRESS as `0x${string}`,
    abi: MovieVotingDAO.abi,
  }), []);

  // Get proposal count
  const { data: proposalCount = 0n } = useReadContract({
    address: contractConfig.address,
    abi: contractConfig.abi,
    functionName: 'proposalCount',
  });

  // Get write contract functions
  const { writeContractAsync: writeContract } = useWriteContract();

  // Read functions
  const getProposal = useCallback(async (proposalId: number) => {
    if (!address) throw new Error('Wallet not connected');
    
    // These would be replaced with actual contract calls in a real implementation
    const proposalData = null; // Replace with actual contract call
    const mediaData = null;    // Replace with actual contract call
    const voted = false;       // Replace with actual contract call
    
    if (!proposalData) throw new Error('Proposal not found');
    
    return {
      ...proposalData,
      mediaProposal: mediaData,
      hasVoted: voted
    };
  }, [address]);

  const getMediaProposal = useCallback(async (proposalId: bigint) => {
    // This would be replaced with actual contract call in a real implementation
    return null;
  }, []);

  const hasVoted = useCallback(async (proposalId: bigint, voter: Address) => {
    // This would be replaced with actual contract call in a real implementation
    return false;
  }, []);

  const createMovieProposal = useCallback(async (
    title: string,
    description: string,
    duration: number,
    ipfsHash: string,
    metadataHash: string
  ) => {
    if (!writeContract) {
      throw new Error('Contract write not initialized');
    }
    
    return writeContract({
      address: contractConfig.address,
      abi: contractConfig.abi,
      functionName: 'createProposal',
      args: [
        title,
        description,
        BigInt(duration),
        0, // ProposalType.Movie
        ipfsHash,
        metadataHash
      ] as const,
    });
  }, [writeContract, contractConfig]);

  const createUploadProposal = useCallback(async (
    title: string,
    description: string,
    duration: number,
    ipfsHash: string,
    metadataHash: string
  ) => {
    if (!writeContract) {
      throw new Error('Contract write not initialized');
    }
    
    return writeContract({
      address: contractConfig.address,
      abi: contractConfig.abi,
      functionName: 'createProposal',
      args: [
        title,
        description,
        BigInt(duration),
        1, // ProposalType.Upload
        ipfsHash,
        metadataHash
      ] as const,
    });
  }, [writeContract, contractConfig]);

  const voteOnProposal = useCallback(async (proposalId: number, support: boolean) => {
    if (!writeContract) {
      throw new Error('Vote function not initialized');
    }
    
    return writeContract({
      address: contractConfig.address,
      abi: contractConfig.abi,
      functionName: 'vote',
      args: [BigInt(proposalId), support] as const,
    });
  }, [writeContract, contractConfig]);

  const executeProposal = useCallback(async (proposalId: number) => {
    if (!writeContract) {
      throw new Error('Execute proposal function not initialized');
    }
    
    return writeContract({
      address: contractConfig.address,
      abi: contractConfig.abi,
      functionName: 'executeProposal',
      args: [BigInt(proposalId)] as const,
    });
  }, [writeContract, contractConfig]);


  const getProposalCount = useCallback(async () => {
    return Number(proposalCount);
  }, [proposalCount]);

  const getProposals = useCallback(async (from = 0, to = 10) => {
    const count = await getProposalCount();
    const end = Math.min(count, to);
    const proposals = [];
    
    for (let i = from; i < end; i++) {
      try {
        const proposal = await getProposal(i + 1);
        if (proposal) {
          proposals.push(proposal);
        }
      } catch (error) {
        console.error(`Error fetching proposal ${i + 1}:`, error);
      }
    }
    
    return proposals;
  }, [getProposalCount, getProposal]);

  return useMemo(() => ({
    createMovieProposal,
    createUploadProposal,
    voteOnProposal,
    executeProposal,
    getProposal,
    getProposalCount,
    getProposals,
  }), [
    createMovieProposal,
    createUploadProposal,
    voteOnProposal,
    executeProposal,
    getProposal,
    getProposalCount,
    getProposals,
  ]);
}
