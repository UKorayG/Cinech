'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Grid, List, X, Clock, CheckCircle, XCircle, Loader2, Film, Upload, ArrowRight, ListChecks } from 'lucide-react';
import { useVotingContract } from '@/contracts/useVotingContract';
import { Proposal, ProposalStatus } from '@/contracts/types';
import { useAccount } from 'wagmi';
import { formatDistanceToNow } from 'date-fns';
import { DEFAULT_VOTING_DURATION } from '@/config';

type ProposalTypeUI = 'movie' | 'upload';

interface NewProposal {
  title: string;
  description: string;
  type: ProposalTypeUI;
  duration: number;
  file: File | null;
}

export default function NewDAO() {
  const [activeTab, setActiveTab] = useState<'active' | 'pending' | 'completed'>('active');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isCreatingProposal, setIsCreatingProposal] = useState(false);
  const [proposals, setProposals] = useState<Proposal[]>([]);
  
  const [newProposal, setNewProposal] = useState<{
    title: string;
    description: string;
    type: ProposalTypeUI;
    duration: number;
    file: File | null;
  }>({
    title: '',
    description: '',
    type: 'movie',
    duration: 7,
    file: null,
  });

  const { address } = useAccount();
  const { 
    getProposals: fetchProposals, 
    createMovieProposal, 
    createUploadProposal, 
    voteOnProposal,
    executeProposal
  } = useVotingContract();

  // Fetch proposals on component mount
  useEffect(() => {
    const loadProposals = async () => {
      try {
        setIsLoading(true);
        const proposalsData = await fetchProposals();
        setProposals(proposalsData);
      } catch (error) {
        console.error('Error loading proposals:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadProposals();
    const interval = setInterval(loadProposals, 30000);
    return () => clearInterval(interval);
  }, [fetchProposals]);

  // Filter proposals based on active tab
  const filteredProposals = proposals.filter(proposal => {
    const now = Math.floor(Date.now() / 1000);
    const startTime = typeof proposal.startTime === 'bigint' ? Number(proposal.startTime) : proposal.startTime;
    const endTime = typeof proposal.endTime === 'bigint' ? Number(proposal.endTime) : proposal.endTime;

    if (activeTab === 'active') return now >= startTime && now <= endTime;
    if (activeTab === 'pending') return now < startTime;
    if (activeTab === 'completed') return now > endTime;
    return true;
  });

  // Handle file upload (simulated)
  const uploadToIPFS = async (file: File): Promise<string> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        setUploadProgress(100);
        resolve(`ipfs://mock-cid/${file.name}`);
      }, 1000);
    });
  };

  const handleCreateProposal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProposal.title || !newProposal.description) return;
    
    try {
      setIsSubmitting(true);
      
      // In a real implementation, you would upload to IPFS here
      let ipfsHash = '';
      if (newProposal.file) {
        ipfsHash = await uploadToIPFS(newProposal.file);
      }
      
      if (newProposal.type === 'movie') {
        await createMovieProposal(
          newProposal.title,
          newProposal.description,
          newProposal.duration,
          ipfsHash,
          '' // metadataHash
        );
      } else {
        await createUploadProposal(
          newProposal.title,
          newProposal.description,
          newProposal.duration,
          ipfsHash,
          '' // metadataHash
        );
      }
      
      // Refresh proposals
      const updatedProposals = await fetchProposals();
      setProposals(updatedProposals);
      setIsModalOpen(false);
      setNewProposal({
        title: '',
        description: '',
        type: 'movie',
        duration: 7,
        file: null,
      });
    } catch (error) {
      console.error('Error creating proposal:', error);
    } finally {
      setIsSubmitting(false);
      setUploadProgress(0);
    }
  };

  const handleVote = async (proposalId: bigint | number, support: boolean) => {
    // Convert to bigint if it's a number
    const id = typeof proposalId === 'number' ? BigInt(proposalId) : proposalId;
    if (!address) {
      alert('Please connect your wallet to vote');
      return;
    }

    try {
      await voteOnProposal(id, support);
      
      // Update local state optimistically
      setProposals(proposals.map(p => {
        // Convert both IDs to strings for comparison to handle both number and bigint
        const pId = typeof p.id === 'bigint' ? p.id.toString() : String(p.id);
        const propId = typeof proposalId === 'bigint' ? proposalId.toString() : String(proposalId);
        
        return {
          ...p,
          yesVotes: pId === propId && support ? p.yesVotes + 1n : p.yesVotes,
          noVotes: pId === propId && !support ? p.noVotes + 1n : p.noVotes,
          hasVoted: pId === propId ? true : p.hasVoted
        };
      }));
    } catch (error) {
      console.error('Error voting:', error);
      alert('Failed to submit vote. See console for details.');
    }
  };

  const handleExecuteProposal = async (proposalId: bigint | number) => {
    // Convert to bigint if it's a number
    const id = typeof proposalId === 'number' ? BigInt(proposalId) : proposalId;
    try {
      await executeProposal(id);
      const updatedProposals = await fetchProposals();
      setProposals(updatedProposals);
    } catch (error) {
      console.error('Error executing proposal:', error);
      alert('Failed to execute proposal. See console for details.');
    }
  };

  // Helper function to safely convert proposal IDs for comparison
  const getProposalId = (id: bigint | number | string): string => {
    if (typeof id === 'bigint') return id.toString();
    if (typeof id === 'number') return id.toString();
    return id;
  };

  // Rest of your component JSX...
  return (
    <div className="min-h-screen bg-gray-900 text-white p-6">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">DAO Governance</h1>
        
        {/* Tabs */}
        <div className="flex space-x-4 mb-6">
          {(['active', 'pending', 'completed'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 rounded-lg ${
                activeTab === tab 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
              }`}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>

        {/* Create Proposal Button */}
        <button
          onClick={() => setIsModalOpen(true)}
          className="mb-6 flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg"
        >
          <Plus size={20} />
          <span>Create Proposal</span>
        </button>

        {/* Proposals List */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProposals.map((proposal) => (
            <div key={proposal.id.toString()} className="bg-gray-800 rounded-lg p-6">
              <h3 className="text-xl font-semibold mb-2">{proposal.title}</h3>
              <p className="text-gray-300 mb-4">{proposal.description}</p>
              
              <div className="flex justify-between items-center mb-4">
                <span className="text-sm text-gray-400">
                  {proposal.yesVotes.toString()} 👍 / {proposal.noVotes.toString()} 👎
                </span>
                <span className="text-sm text-gray-400">
            </div>
          ))}
        </div>

        {/* Create Proposal Modal */}
        {isModalOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-gray-800 rounded-lg p-6 w-full max-w-2xl">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-bold">Create New Proposal</h2>
                <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-white">
                  <X size={24} />
                </button>
              </div>
              
              <form onSubmit={handleCreateProposal}>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Title</label>
                    <input
                      type="text"
                      value={newProposal.title}
                      onChange={(e) => setNewProposal({...newProposal, title: e.target.value})}
                      className="w-full bg-gray-700 rounded-lg px-4 py-2 text-white"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-1">Description</label>
                    <textarea
                      value={newProposal.description}
                      onChange={(e) => setNewProposal({...newProposal, description: e.target.value})}
                      rows={4}
                      className="w-full bg-gray-700 rounded-lg px-4 py-2 text-white"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-1">Type</label>
                    <select
                      value={newProposal.type}
                      onChange={(e) => setNewProposal({...newProposal, type: e.target.value as ProposalType})}
                      className="w-full bg-gray-700 rounded-lg px-4 py-2 text-white"
                    >
                      <option value="movie">Movie Proposal</option>
                      <option value="upload">Upload Proposal</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-1">Duration (days)</label>
                    <input
                      type="number"
                      min="1"
                      value={newProposal.duration}
                      onChange={(e) => setNewProposal({...newProposal, duration: parseInt(e.target.value)})}
                      className="w-full bg-gray-700 rounded-lg px-4 py-2 text-white"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      {newProposal.type === 'movie' ? 'Movie File' : 'File to Upload'}
                    </label>
                    <input
                      type="file"
                      onChange={(e) => setNewProposal({...newProposal, file: e.target.files?.[0] || null})}
                      className="w-full bg-gray-700 rounded-lg px-4 py-2 text-white"
                      required={newProposal.type === 'upload'}
                    />
                  </div>
                  
                  {uploadProgress > 0 && uploadProgress < 100 && (
                    <div className="w-full bg-gray-700 rounded-full h-2.5">
                      <div 
                        className="bg-blue-600 h-2.5 rounded-full" 
                        style={{ width: `${uploadProgress}%` }}
                      ></div>
                    </div>
                  )}
                  
                  <div className="flex justify-end space-x-3 pt-4">
                    <button
                      type="button"
                      onClick={() => setIsModalOpen(false)}
                      className="px-4 py-2 bg-gray-600 hover:bg-gray-500 rounded-lg"
                      disabled={isSubmitting}
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2 bg-blue-600 hover:bg-blue-500 rounded-lg flex items-center space-x-2"
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2 className="animate-spin" size={20} />
                          <span>Creating...</span>
                        </>
                      ) : (
                        <span>Create Proposal</span>
                      )}
                    </button>
                  </div>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
