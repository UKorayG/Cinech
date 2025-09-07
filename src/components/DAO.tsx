'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Grid, List, X, Clock, CheckCircle, XCircle, Loader2, Film, Upload, ArrowRight, ListChecks } from 'lucide-react';
import { useVotingContract } from '@/contracts/useVotingContract';
import { Proposal } from '@/contracts/types';
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

export default function DAO() {
  const [activeTab, setActiveTab] = useState<'active' | 'pending' | 'completed'>('active');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isCreatingProposal, setIsCreatingProposal] = useState(false);

  const { address } = useAccount();
  const { 
    getProposals, 
    createMovieProposal, 
    createUploadProposal, 
    voteOnProposal,
    executeProposal
  } = useVotingContract();

  const [newProposal, setNewProposal] = useState<{
    title: string;
    description: string;
    type: 'movie' | 'upload';
    duration: number;
    file: File | null;
  }>({
    title: '',
    description: '',
    type: 'movie',
    duration: 7, // days
    file: null,
  });

  const [proposals, setProposals] = useState<Proposal[]>([]);

  // Fetch proposals on component mount
  useEffect(() => {
    const loadProposals = async () => {
      try {
        setIsLoading(true);
        const proposalsData = await getProposals();
        setProposals(proposalsData);
      } catch (error) {
        console.error('Error loading proposals:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadProposals();

    // Set up polling or use WebSocket for real-time updates in production
    const interval = setInterval(loadProposals, 30000); // Refresh every 30 seconds

    return () => clearInterval(interval);
  }, [getProposals]);

  // Filter proposals based on active tab
  const filteredProposals = proposals.filter(proposal => {
    const status = getProposalStatus(proposal);
    return status === activeTab;
    return true;
  });

  // Handle file upload to IPFS
  const uploadToIPFS = async (file: File) => {
    try {
      // In a real implementation, you would upload to IPFS here
      // For now, we'll simulate a successful upload
      await new Promise(resolve => setTimeout(resolve, 1000));
      setUploadProgress(100);
      return `ipfs://mock-cid/${file.name}`;
    } catch (error) {
      console.error('Error uploading to IPFS:', error);
      throw new Error('Failed to upload file to IPFS');
    }
  };

  const getTimeLeft = (endTime: bigint): string => {
    const endDate = new Date(Number(endTime) * 1000);
    return formatDistanceToNow(endDate, { addSuffix: true });
  };

  const getProposalStatus = (proposal: Proposal): 'pending' | 'active' | 'completed' => {
    const now = Math.floor(Date.now() / 1000);
    const startTime = typeof proposal.startTime === 'bigint' ? Number(proposal.startTime) : proposal.startTime;
    const endTime = typeof proposal.endTime === 'bigint' ? Number(proposal.endTime) : proposal.endTime;

    if (now < startTime) return 'pending';
    if (now <= endTime) return 'active';
    return 'completed';
  };

  const getVotePercentage = (proposal: Proposal, voteType: 'yes' | 'no'): number => {
    const yesVotes = Number(proposal.yesVotes || 0);
    const noVotes = Number(proposal.noVotes || 0);
    const totalVotes = yesVotes + noVotes;
    if (totalVotes === 0) return 0;

    const votes = voteType === 'yes' ? yesVotes : noVotes;
    return Math.round((votes / totalVotes) * 100);
  };

  const renderProposalStatus = (status: 'active' | 'pending' | 'completed') => {
    switch (status) {
      case 'active':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
            <Clock className="h-3 w-3 mr-1" />
            Active
          </span>
        );
      case 'pending':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
            <Clock className="h-3 w-3 mr-1" />
            Pending
          </span>
        );
      case 'completed':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
            <CheckCircle className="h-3 w-3 mr-1" />
            Completed
          </span>
        );
      default:
        return null;
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const target = e.target as HTMLInputElement;
    const { name, value, type } = target;
    
    if (type === 'file') {
      const file = target.files?.[0] || null;
      setNewProposal(prev => ({
        ...prev,
        file
      }));
    } else if (name === 'type') {
      setNewProposal(prev => ({
        ...prev,
        type: value as 'movie' | 'upload'
      }));
    } else if (name === 'duration') {
      setNewProposal(prev => ({
        ...prev,
        [name]: parseInt(value) || 0
      }));
    } else if (name === 'title' || name === 'description') {
      setNewProposal(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleCreateProposal = async (e: React.FormEvent) => {
    e.preventDefault();
    const title = typeof newProposal.title === 'string' ? newProposal.title.trim() : '';
    const description = typeof newProposal.description === 'string' ? newProposal.description.trim() : '';
    
    if (!title || !description) {
      alert('Please fill in all required fields');
      return;
    }
    try {
      setIsSubmitting(true);
      setUploadProgress(0);

      let ipfsHash = '';
      let metadataHash = '';

      // Upload file to IPFS if exists
      if (newProposal.file) {
        ipfsHash = await uploadToIPFS(newProposal.file);

        // Create metadata JSON
        const metadata = {
          name: newProposal.title,
          description: newProposal.description,
          type: newProposal.type,
          created: new Date().toISOString(),
          file: ipfsHash,
        };

        // Upload metadata to IPFS
        const metadataFile = new File(
          [JSON.stringify(metadata)],
          'metadata.json',
          { type: 'application/json' }
        );

        metadataHash = await uploadToIPFS(metadataFile);
      }

      // Create proposal on-chain
      const durationInSeconds = newProposal.duration * 24 * 60 * 60; // Convert days to seconds

      if (newProposal.type === 'movie') {
        await createMovieProposal(
          newProposal.title,
          newProposal.description,
          durationInSeconds,
          ipfsHash,
          metadataHash
        );
      } else {
        await createUploadProposal(
          newProposal.title,
          newProposal.description,
          durationInSeconds,
          ipfsHash,
          metadataHash
        );
      }

      // Refresh proposals
      const updatedProposals = await getProposals();
      setProposals(updatedProposals);

      // Reset form
      setNewProposal({ 
        title: '', 
        description: '', 
        type: 'movie', 
        duration: 7, 
        file: null 
      });

      setIsModalOpen(false);
    } catch (error) {
      console.error('Error creating proposal:', error);
      alert('Failed to create proposal. See console for details.');
    } finally {
      setIsSubmitting(false);
      setUploadProgress(0);
    }
  };

  const handleVote = async (proposalId: bigint | number, support: boolean) => {
    if (!address) {
      alert('Please connect your wallet to vote');
      return;
    }

    try {
      // Convert to bigint if it's a number
      const id = typeof proposalId === 'number' ? BigInt(proposalId) : proposalId;
      await voteOnProposal(Number(id), support);

      // Update local state optimistically
      setProposals(proposals.map(p => {
        // Convert both IDs to strings for comparison to handle both number and bigint
        const pId = typeof p.id === 'bigint' ? p.id.toString() : String(p.id);
        const propId = id.toString();
        
        if (pId === propId) {
          return {
            ...p,
            yesVotes: support ? p.yesVotes + 1n : p.yesVotes,
            noVotes: !support ? p.noVotes + 1n : p.noVotes,
            hasVoted: true
          };
        }
        return p;
      }));
    } catch (error) {
      console.error('Error voting:', error);
      alert('Failed to submit vote. See console for details.');
    }
  };

  const handleExecuteProposal = async (proposalId: bigint | number) => {
    try {
      // Convert to number as the contract expects
      const id = typeof proposalId === 'bigint' ? Number(proposalId) : proposalId;
      await executeProposal(id);

      // Update local state
      const updatedProposals = await getProposals();
      setProposals(updatedProposals);
    } catch (error) {
      console.error('Error executing proposal:', error);
      alert('Failed to execute proposal. See console for details.');
    }
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
        animate="show"
        variants={{
          hidden: { opacity: 0 },
          show: {
            opacity: 1,
            transition: {
              staggerChildren: 0.1,
              delayChildren: 0.2
            }
          }
        }}
        className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12"
      >
        {/* Hero Section */}
        <motion.div 
          variants={{
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
          }}
          className="mb-12 text-center"
        >
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
              onClick={() => setIsModalOpen(true)}
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
              <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
            </button>
          </motion.div>
        </motion.div>

        {/* Proposals Section */}
        <div id="proposals" className="pt-8">
          {/* Tabs */}
          <motion.div 
            className="sticky top-0 z-10 bg-gray-900/80 backdrop-blur-md border-b border-white/5 mb-8"
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex justify-between items-center">
                <div className="flex space-x-1">
                  {['active', 'pending', 'completed'].map((tab) => (
                    <button
                      key={tab}
                      onClick={() => setActiveTab(tab as any)}
                      className={`px-4 py-3 text-sm font-medium rounded-t-lg transition-colors ${
                        activeTab === tab
                          ? 'text-cinech-gold border-b-2 border-cinech-gold bg-gray-800/50'
                          : 'text-gray-400 hover:text-white hover:bg-white/5'
                      }`}
                    >
                      {tab.charAt(0).toUpperCase() + tab.slice(1)}
                    </button>
                  ))}
                </div>

                <div className="flex items-center space-x-2 bg-gray-800/50 rounded-lg p-1">
                  <button
                    onClick={() => setViewMode('grid')}
                    className={`p-2 rounded-md transition-colors ${viewMode === 'grid' ? 'bg-gray-700 text-cinech-gold' : 'text-gray-400 hover:text-white'}`}
                    aria-label="Grid view"
                  >
                    <Grid className="h-5 w-5" />
                  </button>
                  <button
                    onClick={() => setViewMode('list')}
                    className={`p-2 rounded-md transition-colors ${viewMode === 'list' ? 'bg-gray-700 text-cinech-gold' : 'text-gray-400 hover:text-white'}`}
                    aria-label="List view"
                  >
                    <List className="h-5 w-5" />
                  </button>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Proposals List */}
          <motion.div 
            variants={{
              hidden: { opacity: 0 },
              show: {
                opacity: 1,
                transition: {
                  staggerChildren: 0.1,
                  delayChildren: 0.2
                }
              }
            }}
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
                  <div className="max-w-md mx-auto bg-gradient-to-br from-gray-800/50 to-gray-900/80 backdrop-blur-sm p-8 rounded-2xl border border-white/5 shadow-2xl shadow-black/50">
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
                        onClick={() => setIsModalOpen(true)}
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
                    <motion.div
                      key={proposal.id}
                      variants={{
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
                      }}
                      initial="hidden"
                      animate="show"
                      exit="hidden"
                      className={`${viewMode === 'grid' ? 'h-full' : ''}`}
                    >
                      <div className="h-full bg-gradient-to-br from-gray-800/50 to-gray-900/80 backdrop-blur-sm rounded-xl border border-white/5 overflow-hidden transition-all duration-300 hover:border-cinech-gold/30 hover:shadow-lg hover:shadow-cinech-gold/5">
                        <div className="p-6">
                          <div className="flex justify-between items-start mb-4">
                            <h3 className="text-xl font-semibold text-white">{proposal.title}</h3>
                            {renderProposalStatus(getProposalStatus(proposal))}
                          </div>

                          <p className="text-gray-400 mb-6">{proposal.description}</p>

                          <div className="space-y-4">
                            <div>
                              <div className="flex justify-between text-sm text-gray-400 mb-1">
                                <span>Voting Progress</span>
                                <span>{getVotePercentage(proposal, 'yes')}% Yes • {getVotePercentage(proposal, 'no')}% No</span>
                              </div>
                              <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
                                <div 
                                  className="h-full bg-gradient-to-r from-green-500 to-green-400" 
                                  style={{ width: `${getVotePercentage(proposal, 'yes')}%` }}
                                />
                              </div>
                            </div>

                            <div className="flex justify-between text-sm">
                              <div className="text-green-400">
                                <CheckCircle className="inline h-4 w-4 mr-1" />
                                {proposal.yesVotes} Yes
                              </div>
                              <div className="text-red-400">
                                <XCircle className="inline h-4 w-4 mr-1" />
                                {proposal.noVotes} No
                              </div>
                            </div>
                            
                            <div className="flex items-center justify-between text-sm text-gray-400 pt-2 border-t border-white/5">
                              <div className="flex items-center">
                                <Clock className="h-4 w-4 mr-1.5 text-cinech-gold" />
                                <span>{getTimeLeft(proposal.endTime)}</span>
                              </div>
                              <button 
                                className="text-cinech-gold hover:text-cinech-gold/80 text-sm font-medium flex items-center group"
                                onClick={() => handleVote(proposal.id, true)}
                              >
                                Vote Now
                                <ArrowRight className="h-3.5 w-3.5 ml-1 group-hover:translate-x-0.5 transition-transform" />
                              </button>
                            </div>
                          </div>
                        </div>
                        
                        {getProposalStatus(proposal) === 'active' && (
                          <div className="bg-gray-800/50 px-6 py-3 flex justify-between items-center border-t border-white/5">
                            <button
                              onClick={() => handleVote(proposal.id, true)}
                              className="flex-1 flex items-center justify-center gap-2 bg-green-500/10 hover:bg-green-500/20 text-green-400 px-4 py-2 rounded-lg transition-colors"
                            >
                              <CheckCircle className="h-4 w-4" />
                              Vote Yes
                            </button>
                            <div className="w-4"></div>
                            <button
onClick={() => handleVote(proposal.id, false)}
                              className="flex-1 flex items-center justify-center gap-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 px-4 py-2 rounded-lg transition-colors"
                            >
                              <XCircle className="h-4 w-4" />
                              Vote No
                            </button>
                          </div>
                        )}
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              )}
            </AnimatePresence>
          </motion.div>
        </div>
      </motion.div>

      {/* New Proposal Modal */}
      <AnimatePresence>
        {isCreatingProposal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            onClick={(e) => e.target === e.currentTarget && setIsCreatingProposal(false)}
          >
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 20, opacity: 0 }}
              className="bg-gray-800 rounded-xl max-w-md w-full p-6 relative border border-white/10 shadow-2xl shadow-black/50"
            >
              <button
                onClick={() => setIsCreatingProposal(false)}
                className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors p-1"
              >
                <X className="h-5 w-5" />
              </button>
              
              <div className="space-y-6">
                <div>
                  <h3 className="text-xl font-semibold text-white mb-1">Create New Proposal</h3>
                  <p className="text-sm text-gray-400">Submit a new proposal for the community to vote on</p>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1.5">Proposal Title</label>
                    <input
                      type="text"
                      name="title"
                      value={newProposal.title}
                      onChange={handleInputChange}
                      className="w-full bg-gray-700/50 border border-gray-600 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-cinech-gold/50 focus:border-transparent"
                      placeholder="Enter proposal title"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1.5">Description</label>
                    <textarea
                      name="description"
                      value={newProposal.description}
                      onChange={handleInputChange}
                      className="w-full bg-gray-700/50 border border-gray-600 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-cinech-gold/50 focus:border-transparent min-h-[120px]"
                      placeholder="Describe your proposal in detail..."
                    ></textarea>
                  </div>
                  
                  <div className="bg-gray-800/50 p-4 rounded-lg border border-gray-700/50">
                    <div className="flex items-center text-sm text-gray-400 mb-2">
                      <Clock className="h-4 w-4 mr-2 text-cinech-gold" />
                      <span>Voting will be active for 7 days</span>
                    </div>
                    <p className="text-xs text-gray-500">Proposals require a majority of 'Yes' votes to pass.</p>
                  </div>
                </div>
                
                <div className="flex justify-end space-x-3 pt-2">
                  <button
                    onClick={() => setIsCreatingProposal(false)}
                    className="px-4 py-2.5 text-gray-300 hover:text-white text-sm font-medium transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleCreateProposal}
                    disabled={!newProposal.title?.trim() || !newProposal.description?.trim()}
                    className="px-6 py-2.5 bg-cinech-gold hover:bg-cinech-gold/90 text-cinech-dark rounded-lg font-medium text-sm disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    Create Proposal
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
