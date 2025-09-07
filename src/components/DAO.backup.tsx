'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Vote, Clock, CheckCircle, XCircle, Plus, Zap, TrendingUp, ListChecks, CheckCircle2, X, Users, ArrowRight, BarChart2, ExternalLink } from 'lucide-react';
import { useAccount, useWriteContract, useReadContract } from 'wagmi';
import { DAO_ABI, CONTRACT_ADDRESSES } from '@/lib/contracts';
import { useInView } from 'framer-motion';
import ProposalCard from './ProposalCard';

// Animation variants
const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2
    }
  }
} as const;

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  show: { 
    y: 0, 
    opacity: 1,
    transition: {
      type: 'spring' as const,
      stiffness: 100,
      damping: 15
    }
  }
} as const;

const fadeIn = {
  hidden: { opacity: 0 },
  show: { 
    opacity: 1,
    transition: { duration: 0.5 }
  }
} as const;

// Animation variants for framer-motion
const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

interface Proposal {
  id: number;
  title: string;
  description: string;
  yesVotes: number;
  noVotes: number;
  startTime: number;
  endTime: number;
  status: 'active' | 'pending' | 'executed';
}

export default function DAO() {
  const [isMounted, setIsMounted] = useState(false);
  const [activeTab, setActiveTab] = useState<'active' | 'pending' | 'executed'>('active');
  const [isCreatingProposal, setIsCreatingProposal] = useState(false);
  const [newProposal, setNewProposal] = useState('');
  const [timeLeft, setTimeLeft] = useState('Loading...');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const containerRef = useRef(null);
  const isInView = useInView(containerRef, { once: true, amount: 0.2 });
  
  const [proposals, setProposals] = useState<Proposal[]>([
    {
      id: 1,
      title: 'Add New Movie Category',
      description: 'Shall we add a new category for classic films?',
      yesVotes: 120,
      noVotes: 45,
      startTime: Date.now() - 86400000, // 1 day ago
      endTime: Date.now() + 86400000 * 2, // 2 days from now
      status: 'active'
    },
    {
      id: 2,
      title: 'Update Membership Fees',
      description: 'Should we increase membership fees by 10%?',
      yesVotes: 0,
      noVotes: 0,
      startTime: Date.now() + 86400000, // starts tomorrow
      endTime: Date.now() + 86400000 * 4, // ends in 4 days
      status: 'pending'
    },
    {
      id: 3,
      title: 'New Feature: Watch Parties',
      description: 'Shall we add a watch party feature for premium members?',
      yesVotes: 200,
      noVotes: 50,
      startTime: Date.now() - 86400000 * 3, // 3 days ago
      endTime: Date.now() - 86400000, // ended 1 day ago
      status: 'executed'
    }
  ]);

  useEffect(() => {
    setIsMounted(true);
    
    // Update time left every second
    const timer = setInterval(() => {
      if (proposals.length > 0) {
        const now = Date.now();
        const activeProposal = proposals.find(p => p.status === 'active');
        if (activeProposal) {
          const endTime = activeProposal.endTime;
          const diff = Math.max(0, endTime - now);
          
          const days = Math.floor(diff / (1000 * 60 * 60 * 24));
          const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
          const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
          const seconds = Math.floor((diff % (1000 * 60)) / 1000);
          
          if (days > 0) {
            setTimeLeft(`${days}d ${hours}h ${minutes}m`);
          } else if (hours > 0) {
            setTimeLeft(`${hours}h ${minutes}m ${seconds}s`);
          } else {
            setTimeLeft(`${minutes}m ${seconds}s`);
          }
        }
      }
    }, 1000);
    
    return () => clearInterval(timer);
  }, [proposals]);

  const filteredProposals = proposals.filter(proposal => {
    if (activeTab === 'active') return proposal.status === 'active';
    if (activeTab === 'pending') return proposal.status === 'pending';
    return proposal.status === 'executed';
  });

  const { address } = useAccount();

  const handleVote = (proposalId: number, voteType: 'yes' | 'no') => {
    setProposals(proposals.map(proposal => {
      if (proposal.id === proposalId) {
        return {
          ...proposal,
          yesVotes: voteType === 'yes' ? proposal.yesVotes + 1 : proposal.yesVotes,
          noVotes: voteType === 'no' ? proposal.noVotes + 1 : proposal.noVotes
        };
      }
      return proposal;
    }));
  };

  const getTimeLeft = (endTime: number) => {
    const now = Date.now();
    const diff = endTime - now;
    
    if (diff <= 0) return 'Time Expired';
    
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    
    if (days > 0) return `${days}d ${hours}h left`;
    if (hours > 0) return `${hours}h ${Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))}m left`;
    return `${Math.floor((diff % (1000 * 60)) / 1000)}s left`;
  };

  const getVotePercentage = (yes: number, no: number) => {
    const total = yes + no;
    if (total === 0) return { yes: 0, no: 0 };
    return {
      yes: Math.round((yes / total) * 100),
      no: Math.round((no / total) * 100)
    };
  };

  const handleCreateProposal = () => {
    if (!newProposal.trim()) return;
    
    const newProposalObj: Proposal = {
      id: proposals.length + 1,
      title: `Proposal #${proposals.length + 1}`,
      description: newProposal,
      yesVotes: 0,
      noVotes: 0,
      startTime: Date.now(),
      endTime: Date.now() + 86400000 * 3, // 3 days from now
      status: 'active'
    };
    
    setProposals([newProposalObj, ...proposals]);
    setNewProposal('');
    setIsCreatingProposal(false);
  };

  return (
    <div className="relative min-h-screen overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-900/30 via-purple-900/20 to-gray-900/80">
          <div className="absolute inset-0 bg-[url('/grid.svg')] [mask-image:linear-gradient(180deg,white,transparent)] opacity-5"></div>
          <div className="absolute inset-0 bg-[radial-gradient(circle_800px_at_100%_200px,#3b82f6,transparent)] opacity-20 animate-blob"></div>
          <div className="absolute inset-0 bg-[radial-gradient(circle_600px_at_50%_800px,#8b5cf6,transparent)] opacity-20 animate-blob animation-delay-2000"></div>
          <div className="absolute inset-0 bg-[radial-gradient(circle_400px_at_80%_400px,#ec4899,transparent)] opacity-20 animate-blob animation-delay-4000"></div>
        </div>
      </div>
      
      <motion.div 
        initial="hidden"
        animate={isInView ? "show" : "hidden"}
        variants={containerVariants}
        ref={containerRef}
        className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12"
      >
        {/* Hero Section */}
        <motion.div variants={itemVariants} className="mb-12 text-center">
          <motion.div 
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center px-4 py-2 rounded-full bg-white/5 border border-white/10 mb-4"
          >
            <div className="w-2 h-2 rounded-full bg-cinech-gold animate-pulse mr-2"></div>
            <span className="text-sm font-medium text-cinech-gold">DAO Governance</span>
          </motion.div>
          
          <motion.h2 
            className="text-4xl md:text-5xl font-bold text-white mb-4 bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-300"
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.1 }}
          >
            Community Proposals
          </motion.h2>
          
          <motion.p 
            className="text-lg text-gray-300 max-w-2xl mx-auto mb-8"
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            Participate in the future of Cinech. Vote on proposals, submit your ideas, and help shape the platform.
          </motion.p>
        
        <motion.div 
          className="flex flex-col sm:flex-row justify-center gap-4 mb-8"
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          <button
            onClick={() => setIsCreatingProposal(true)}
            className="group inline-flex items-center justify-center gap-2 bg-cinech-gold hover:bg-cinech-gold/90 text-cinech-dark px-6 py-3 rounded-xl font-semibold transition-all duration-300 hover:shadow-lg hover:shadow-cinech-gold/20"
          >
            <Plus className="h-5 w-5 group-hover:rotate-90 transition-transform" />
            Create Proposal
          </button>
          
          <button 
            onClick={() => document.getElementById('proposals')?.scrollIntoView({ behavior: 'smooth' })}
            className="group inline-flex items-center justify-center gap-2 bg-white/5 hover:bg-white/10 border border-white/10 text-white px-6 py-3 rounded-xl font-medium transition-all duration-300"
          >
            View Proposals
          </button>
        </motion.div>
        
        <motion.div 
          className="flex justify-center gap-1 mb-12"
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.4 }}
        >
          <div className="flex items-center text-sm text-gray-400">
            <BarChart2 className="h-4 w-4 mr-1.5 text-cinech-gold" />
            <span>120+ Active Voters</span>
          </div>
          <span className="mx-2 text-gray-600">•</span>
          <div className="flex items-center text-sm text-gray-400">
            <Users className="h-4 w-4 mr-1.5 text-cinech-gold" />
            <span>45+ Proposals</span>
          </div>
        </motion.div>
      </motion.div>

      {/* Tabs and View Toggle */}
      <motion.div 
        id="proposals"
        variants={itemVariants}
        className="sticky top-20 z-10 bg-gray-900/80 backdrop-blur-lg pt-6 pb-2 -mx-4 sm:mx-0 px-4 sm:px-0"
      >
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
            <h3 className="text-2xl font-bold text-white">
              {activeTab === 'active' 
                ? 'Active Proposals' 
                : activeTab === 'pending' 
                  ? 'Pending Approval' 
                  : 'Completed Proposals'}
            </h3>
            
            <div className="flex items-center space-x-2">
              <div className="inline-flex bg-gray-800/50 rounded-lg p-1">
                {['grid', 'list'].map((mode) => (
                  <button
                    key={mode}
                    onClick={() => setViewMode(mode as 'grid' | 'list')}
                    className={`p-2 rounded-md transition-colors ${
                      viewMode === mode 
                        ? 'bg-cinech-gold/20 text-cinech-gold' 
                        : 'text-gray-400 hover:text-white hover:bg-white/5'
                    }`}
                    aria-label={`${mode} view`}
                  >
                    {mode === 'grid' ? (
                      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <rect x="3" y="3" width="7" height="7"></rect>
                        <rect x="14" y="3" width="7" height="7"></rect>
                        <rect x="14" y="14" width="7" height="7"></rect>
                        <rect x="3" y="14" width="7" height="7"></rect>
                      </svg>
                    ) : (
                      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <line x1="8" y1="6" x2="21" y2="6"></line>
                        <line x1="8" y1="12" x2="21" y2="12"></line>
                        <line x1="8" y1="18" x2="21" y2="18"></line>
                        <line x1="3" y1="6" x2="3.01" y2="6"></line>
                        <line x1="3" y1="12" x2="3.01" y2="12"></line>
                        <line x1="3" y1="18" x2="3.01" y2="18"></line>
                      </svg>
                    )}
                  </button>
                ))}
              </div>
              
              <div className="inline-flex bg-gray-800/50 rounded-lg p-1">
                {['active', 'pending', 'executed'].map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab as 'active' | 'pending' | 'executed')}
                    className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
                      activeTab === tab
                        ? 'bg-cinech-gold/20 text-cinech-gold'
                        : 'text-gray-400 hover:text-white hover:bg-white/5'
                    }`}
                  >
                    {tab === 'active' ? 'Active' : tab === 'pending' ? 'Pending' : 'Completed'}
                  </button>
                ))}
              </div>
            </div>
          </div>
          

      {/* Proposals List */}
      <motion.div 
        variants={containerVariants}
        className={`${viewMode === 'grid' ? 'grid md:grid-cols-2 lg:grid-cols-3 gap-6' : 'space-y-6'}`}
      >
        <AnimatePresence>
          {filteredProposals.length === 0 ? (
            <motion.div 
              className={`${viewMode === 'grid' ? 'md:col-span-2 lg:col-span-3' : ''} text-center py-16`}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <div className="max-w-md mx-auto bg-gradient-to-br from-gray-800/50 to-gray-900/80 backdrop-blur-sm p-8 rounded-2xl border border-white/5 shadow-2xl">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-cinech-gold/10 mb-4">
                  <ListChecks className="h-8 w-8 text-cinech-gold" />
                </div>
                <h4 className="text-xl font-semibold text-white mb-2">
                  {activeTab === 'active' 
                    ? 'No Active Proposals' 
                    : activeTab === 'pending'
                      ? 'No Pending Proposals'
                      : 'No Completed Proposals'}
                </h4>
                <p className="text-gray-400">
                  {activeTab === 'active' 
                    ? 'There are currently no active proposals. Check back later or create a new one.' 
                    : activeTab === 'pending'
                      ? 'There are no proposals awaiting approval at this time.'
                      : 'No proposals have been completed yet.'}
                </p>
                {activeTab === 'active' && (
                  <button
                    onClick={() => setIsCreatingProposal(true)}
                    className="mt-6 inline-flex items-center gap-2 bg-cinech-gold/10 hover:bg-cinech-gold/20 text-cinech-gold px-6 py-2 rounded-lg font-medium transition-colors border border-cinech-gold/20"
                  >
                    <Plus className="h-4 w-4" />
                    Create Proposal
                  </button>
                )}
              </div>
            </motion.div>
          ) : (
            <AnimatePresence>
              {filteredProposals.map((proposal) => (
                <ProposalCard 
                  key={proposal.id}
                  proposal={proposal}
                  viewMode={viewMode}
                  onVote={handleVote}
                  getTimeLeft={getTimeLeft}
                  getVotePercentage={getVotePercentage}
                />
              ))}
            </AnimatePresence>
          )}
        </AnimatePresence>
      </motion.div>

      {/* New Proposal Modal */}
      {isCreatingProposal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800 rounded-xl max-w-md w-full p-6 relative">
            <button
              onClick={() => setIsCreatingProposal(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-white text-2xl"
            >
              &times;
            </button>
            <h3 className="text-xl font-semibold text-white mb-4">Create New Proposal</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Proposal Description</label>
                <textarea
                  value={newProposal}
                  onChange={(e) => setNewProposal(e.target.value)}
                  className="w-full bg-gray-700/50 border border-gray-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-cinech-gold/50"
                  rows={4}
                  placeholder="Please describe your proposal in detail..."
                />
              </div>
              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => setIsCreatingProposal(false)}
                  className="px-4 py-2 text-gray-300 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  onClick={handleCreateProposal}
                  disabled={!newProposal.trim()}
                  className="px-4 py-2 bg-cinech-gold hover:bg-cinech-gold/90 text-cinech-dark rounded-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Create Proposal
                </button>
      )}
    </AnimatePresence>
  </motion.div>

  {/* New Proposal Modal */}
  {isCreatingProposal && (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-800 rounded-xl max-w-md w-full p-6 relative">
        <button
          onClick={() => setIsCreatingProposal(false)}
          className="absolute top-4 right-4 text-gray-400 hover:text-white text-2xl"
        >
          &times;
        </button>
        <h3 className="text-xl font-semibold text-white mb-4">Create New Proposal</h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Proposal Description</label>
            <textarea
              value={newProposal}
              onChange={(e) => setNewProposal(e.target.value)}
              className="w-full bg-gray-700/50 border border-gray-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-cinech-gold/50"
              rows={4}
              placeholder="Please describe your proposal in detail..."
            />
          </div>
          <div className="flex justify-end space-x-3">
            <button
              onClick={() => setIsCreatingProposal(false)}
              className="px-4 py-2 text-gray-300 hover:text-white"
            >
              Cancel
            </button>
            <button
              onClick={handleCreateProposal}
              disabled={!newProposal.trim()}
              className="px-4 py-2 bg-cinech-gold hover:bg-cinech-gold/90 text-cinech-dark rounded-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Create Proposal
            </button>
          </div>
        </div>
      </div>
    </div>
  )}
</div>
</motion.div>
</div>
</motion.div>