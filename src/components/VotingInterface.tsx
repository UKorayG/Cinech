'use client';

import { useState, useEffect } from 'react';
import { useAccount, useReadContract, useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { VOTING_CONTRACT_ABI, CONTRACT_ADDRESSES } from '@/lib/contracts';

interface VotingInterfaceProps {
  roomId: number;
  onVoteCast?: () => void;
}

export default function VotingInterface({ roomId, onVoteCast }: VotingInterfaceProps) {
  const { address } = useAccount();
  const [hasVoted, setHasVoted] = useState(false);
  const [showVoting, setShowVoting] = useState(false);
  const [voteCounts, setVoteCounts] = useState({ choice1: 0, choice2: 0 });
  const [isLoading, setIsLoading] = useState(false);

  // Check if user has already voted
  const { data: userVoted } = useReadContract({
    address: CONTRACT_ADDRESSES.VOTING_CONTRACT,
    abi: VOTING_CONTRACT_ABI,
    functionName: 'hasVoted',
    args: [BigInt(roomId), address || '0x0'],
    query: {
      enabled: !!address,
    },
  });

  // Get current vote counts
  const { data: votes, refetch: refetchVotes } = useReadContract({
    address: CONTRACT_ADDRESSES.VOTING_CONTRACT,
    abi: VOTING_CONTRACT_ABI,
    functionName: 'getVotes',
    args: [BigInt(roomId)],
  });

  // Handle the vote transaction
  const { writeContract: castVote, isPending: isVoting } = useWriteContract({
    mutation: {
      onSuccess: (hash) => {
        // Successfully submitted the transaction
        setHasVoted(true);
        refetchVotes();
        if (onVoteCast) onVoteCast();
        setIsLoading(false);
      },
      onError: () => {
        // Handle error
        setIsLoading(false);
      },
    },
  });

  // Update local state when contract data changes
  useEffect(() => {
    if (votes) {
      setVoteCounts({
        choice1: Number(votes[0] || 0),
        choice2: Number(votes[1] || 0),
      });
    }
  }, [votes]);

  // Update hasVoted state
  useEffect(() => {
    if (userVoted !== undefined) {
      setHasVoted(userVoted as boolean);
    }
  }, [userVoted]);

  // Show voting interface at specific times during video playback
  useEffect(() => {
    // This would be triggered at specific times during video playback
    // For now, we'll just show it after 30 seconds for demo purposes
    const timer = setTimeout(() => {
      if (!hasVoted) {
        setShowVoting(true);
      }
    }, 30000);

    return () => clearTimeout(timer);
  }, [hasVoted]);

  const handleVote = (choice: number) => {
    if (!address || !castVote) return;
    
    setIsLoading(true);
    castVote({
      abi: VOTING_CONTRACT_ABI,
      address: CONTRACT_ADDRESSES.VOTING_CONTRACT,
      functionName: 'castVote',
      args: [BigInt(roomId), BigInt(choice)],
    });
  };

  if (!showVoting || hasVoted) return null;

  const totalVotes = voteCounts.choice1 + voteCounts.choice2;

  return (
    <div className="fixed bottom-8 left-1/2 transform -translate-x-1/2 bg-gray-900/90 backdrop-blur-md p-4 rounded-xl border border-white/10 shadow-2xl z-50 max-w-md w-full">
      <h3 className="text-white font-semibold mb-3 text-center">What should happen next?</h3>
      
      <div className="space-y-3">
        <button
          onClick={() => handleVote(1)}
          disabled={isLoading || hasVoted}
          className={`w-full text-left p-3 rounded-lg transition-colors ${
            hasVoted
              ? 'bg-green-500/20 text-green-400'
              : 'bg-white/5 hover:bg-white/10 text-white'
          }`}
        >
          <div className="flex justify-between items-center">
            <span>Killer Escapes</span>
            {hasVoted && (
              <span className="text-xs bg-green-500/30 px-2 py-0.5 rounded-full">
                {voteCounts.choice1} votes
              </span>
            )}
          </div>
          {hasVoted && totalVotes > 0 && (
            <div className="w-full bg-gray-700 rounded-full h-1.5 mt-2">
              <div 
                className="bg-green-500 h-1.5 rounded-full" 
                style={{ width: `${(voteCounts.choice1 / totalVotes) * 100}%` }}
              />
            </div>
          )}
        </button>

        <button
          onClick={() => handleVote(2)}
          disabled={isLoading || hasVoted}
          className={`w-full text-left p-3 rounded-lg transition-colors ${
            hasVoted
              ? 'bg-green-500/20 text-green-400'
              : 'bg-white/5 hover:bg-white/10 text-white'
          }`}
        >
          <div className="flex justify-between items-center">
            <span>Killer Caught</span>
            {hasVoted && (
              <span className="text-xs bg-green-500/30 px-2 py-0.5 rounded-full">
                {voteCounts.choice2} votes
              </span>
            )}
          </div>
          {hasVoted && totalVotes > 0 && (
            <div className="w-full bg-gray-700 rounded-full h-1.5 mt-2">
              <div 
                className="bg-green-500 h-1.5 rounded-full" 
                style={{ width: `${(voteCounts.choice2 / totalVotes) * 100}%` }}
              />
            </div>
          )}
        </button>
      </div>

      {isLoading && (
        <div className="mt-3 text-center text-sm text-gray-400">
          Processing your vote...
        </div>
      )}
    </div>
  );
}
