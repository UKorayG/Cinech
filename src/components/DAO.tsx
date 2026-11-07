'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Grid, List, X, Clock, CheckCircle, XCircle, Loader2, Film, Upload, ArrowRight, ListChecks } from 'lucide-react';
import { DaoContractError, useVotingContract } from '@/contracts/useVotingContract';
import ContractNotice from '@/components/dao/ContractNotice';
import { Proposal } from '@/contracts/types';
import { useAccount } from 'wagmi';
import { formatDistanceToNow } from 'date-fns';
import { DEFAULT_VOTING_DURATION } from '@/config';
import { useLanguage } from '@/contexts/LanguageContext';

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
  const { language } = useLanguage();
  const en = language === 'en';
  const { 
    contract,
    getProposals, 
    createMovieProposal, 
    createUploadProposal, 
    voteOnProposal,
    executeProposal
  } = useVotingContract();
  const canWrite = contract.canWrite;

  const errorText = (error: unknown) => {
    if (error instanceof DaoContractError) {
      if (error.status === 'wallet') return en ? 'Connect your wallet first.' : 'Önce cüzdanını bağla.';
      if (error.status === 'chain') return en ? 'Switch your wallet to Sepolia.' : 'Cüzdanını Sepolia ağına geçir.';
      return en ? 'The DAO contract is not available; on-chain actions are disabled.' : 'DAO sözleşmesi kullanılamıyor; zincir işlemleri kapalı.';
    }
    return en ? 'Transaction failed. See the console for details.' : 'İşlem başarısız. Ayrıntı için konsola bak.';
  };

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
      alert(errorText(error));
    } finally {
      setIsSubmitting(false);
      setUploadProgress(0);
    }
  };

  const handleVote = async (proposalId: bigint | number, support: boolean) => {
    if (!address) {
      alert(en ? 'Connect your wallet to vote.' : 'Oy vermek için cüzdanını bağla.');
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
      alert(errorText(error));
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
      alert(errorText(error));
    }
  };

  return (
    <div className="relative min-h-screen overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-gradient-to-br from-cinech-ink/30 via-cinech-ink-light/20 to-cinech-ink/80">
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
            className="inline-flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.3em] text-cinech-olive mb-6"
          >
            <span className="h-2 w-2 rounded-full bg-cinech-olive animate-rec-blink"></span>
            <span>[{en ? 'DAO Governance' : 'DAO Yönetişimi'}] 05</span>
          </motion.div>

          <motion.h2 
            className="font-display text-6xl md:text-8xl uppercase leading-[0.9] tracking-wide text-cinech-cream text-hard-olive mb-6"
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.1 }}
          >
            {en ? 'Community Proposals' : 'Topluluk Teklifleri'}
          </motion.h2>

          <motion.p 
            className="text-lg text-cinech-cream/75 max-w-2xl mx-auto mb-8"
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            {en ? 'Participate in the future of Cinech. Vote on proposals, submit your ideas, and help shape the platform.' : "Cinech'in geleceğine katıl. Tekliflere oy ver, fikrini sun, platformu birlikte şekillendir."}
          </motion.p>

          <motion.div 
            className="flex flex-col sm:flex-row justify-center gap-4 mb-8"
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            <button
              onClick={() => setIsCreatingProposal(true)}
              disabled={!canWrite}
              className="btn-cream group disabled:cursor-not-allowed disabled:opacity-50"
            >
              <Plus className="h-5 w-5 group-hover:rotate-90 transition-transform" />
              {en ? 'Create Proposal' : 'Teklif Oluştur'}
            </button>

            <button 
              onClick={() => document.getElementById('proposals')?.scrollIntoView({ behavior: 'smooth' })}
              className="btn-outline text-cinech-cream group"
            >
              {en ? 'View Proposals' : 'Teklifleri Gör'}
              <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
            </button>
          </motion.div>
        </motion.div>

        <ContractNotice contract={contract} />

        {/* Proposals Section */}
        <div id="proposals" className="pt-8">
          {/* Tabs */}
          <motion.div 
            className="sticky top-0 z-10 bg-cinech-ink/80 backdrop-blur-md border-b border-white/5 mb-8"
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
                      onClick={() => setActiveTab(tab as 'active' | 'pending' | 'completed')}
                      className={`px-4 py-3 text-sm font-medium rounded-t-lg transition-colors ${
                        activeTab === tab
                          ? 'text-cinech-brown border-b-2 border-cinech-brown bg-cinech-ink-light/60'
                          : 'text-cinech-cream/60 hover:text-cinech-cream hover:bg-white/5'
                      }`}
                    >
                      {en ? tab.charAt(0).toUpperCase() + tab.slice(1) : ({ active: 'Aktif', pending: 'Bekleyen', completed: 'Tamamlanan' } as Record<string, string>)[tab]}
                    </button>
                  ))}
                </div>

                <div className="flex items-center space-x-2 bg-cinech-ink-light/60 rounded-lg p-1">
                  <button
                    onClick={() => setViewMode('grid')}
                    className={`p-2 rounded-md transition-colors ${viewMode === 'grid' ? 'bg-cinech-ink-lighter text-cinech-brown' : 'text-cinech-cream/60 hover:text-cinech-cream'}`}
                    aria-label={en ? 'Grid view' : 'Izgara görünümü'}
                  >
                    <Grid className="h-5 w-5" />
                  </button>
                  <button
                    onClick={() => setViewMode('list')}
                    className={`p-2 rounded-md transition-colors ${viewMode === 'list' ? 'bg-cinech-ink-lighter text-cinech-brown' : 'text-cinech-cream/60 hover:text-cinech-cream'}`}
                    aria-label={en ? 'List view' : 'Liste görünümü'}
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
                  <div className="max-w-md mx-auto bg-gradient-to-br from-cinech-ink-light/50 to-cinech-ink/80 backdrop-blur-sm p-8 rounded-2xl border border-white/5 shadow-2xl shadow-black/50">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-cinech-olive/15 mb-4">
                      <ListChecks className="h-8 w-8 text-cinech-brown" />
                    </div>
                    <h4 className="text-xl font-semibold text-cinech-cream mb-2">
                      {activeTab === 'active' 
                        ? (en ? 'No Active Proposals' : 'Aktif teklif yok') 
                        : activeTab === 'pending'
                          ? 'No Pending Proposals'
                          : 'No Completed Proposals'}
                    </h4>
                    <p className="text-cinech-cream/60">
                      {activeTab === 'active' 
                        ? (en ? 'There are currently no active proposals. Check back later or create a new one.' : 'Şu an aktif teklif yok. Daha sonra tekrar bak ya da yeni bir teklif oluştur.') 
                        : activeTab === 'pending'
                          ? 'There are no proposals awaiting approval at this time.'
                          : 'No proposals have been completed yet.'}
                    </p>
                    {activeTab === 'active' && (
                      <button
                        onClick={() => setIsCreatingProposal(true)}
                        disabled={!canWrite}
                        className="btn-outline mt-6 text-cinech-cream !px-5 !py-2 !text-sm disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        <Plus className="h-4 w-4" />
                        {en ? 'Create Proposal' : 'Teklif Oluştur'}
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
                      <div className="h-full bg-gradient-to-br from-cinech-ink-light/50 to-cinech-ink/80 backdrop-blur-sm rounded-xl border border-white/5 overflow-hidden transition-all duration-300 hover:border-cinech-brown/30 hover:shadow-lg hover:shadow-cinech-brown/5">
                        <div className="p-6">
                          <div className="flex justify-between items-start mb-4">
                            <h3 className="text-xl font-semibold text-cinech-cream">{proposal.title}</h3>
                            {renderProposalStatus(getProposalStatus(proposal))}
                          </div>

                          <p className="text-cinech-cream/60 mb-6">{proposal.description}</p>

                          <div className="space-y-4">
                            <div>
                              <div className="flex justify-between text-sm text-cinech-cream/60 mb-1">
                                <span>{en ? 'Voting Progress' : 'Oylama durumu'}</span>
                                <span>{getVotePercentage(proposal, 'yes')}% Yes • {getVotePercentage(proposal, 'no')}% No</span>
                              </div>
                              <div className="h-2 bg-cinech-ink-lighter rounded-full overflow-hidden">
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
                            
                            <div className="flex items-center justify-between text-sm text-cinech-cream/60 pt-2 border-t border-white/5">
                              <div className="flex items-center">
                                <Clock className="h-4 w-4 mr-1.5 text-cinech-brown" />
                                <span>{getTimeLeft(proposal.endTime)}</span>
                              </div>
                              <button 
                                className="text-cinech-brown hover:text-cinech-brown/80 text-sm font-medium flex items-center group disabled:cursor-not-allowed disabled:opacity-50"
                                onClick={() => handleVote(proposal.id, true)}
                                disabled={!canWrite}
                              >
                                {en ? 'Vote now' : 'Oy ver'}
                                <ArrowRight className="h-3.5 w-3.5 ml-1 group-hover:translate-x-0.5 transition-transform" />
                              </button>
                            </div>
                          </div>
                        </div>
                        
                        {getProposalStatus(proposal) === 'active' && (
                          <div className="bg-cinech-ink-light/60 px-6 py-3 flex justify-between items-center border-t border-white/5">
                            <button
                              onClick={() => handleVote(proposal.id, true)}
                              disabled={!canWrite}
                              className="flex-1 flex items-center justify-center gap-2 bg-green-500/10 hover:bg-green-500/20 text-green-400 px-4 py-2 rounded-lg transition-colors disabled:cursor-not-allowed disabled:opacity-50"
                            >
                              <CheckCircle className="h-4 w-4" />
                              {en ? 'Vote yes' : 'Evet'}
                            </button>
                            <div className="w-4"></div>
                            <button
                              onClick={() => handleVote(proposal.id, false)}
                              disabled={!canWrite}
                              className="flex-1 flex items-center justify-center gap-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 px-4 py-2 rounded-lg transition-colors disabled:cursor-not-allowed disabled:opacity-50"
                            >
                              <XCircle className="h-4 w-4" />
                              {en ? 'Vote no' : 'Hayır'}
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
              className="bg-cinech-ink-light rounded-xl max-w-md w-full p-6 relative border border-white/10 shadow-2xl shadow-black/50"
            >
              <button
                onClick={() => setIsCreatingProposal(false)}
                className="absolute top-4 right-4 text-cinech-cream/60 hover:text-cinech-cream transition-colors p-1"
              >
                <X className="h-5 w-5" />
              </button>
              
              <div className="space-y-6">
                <div>
                  <h3 className="text-xl font-semibold text-cinech-cream mb-1">{en ? 'Create New Proposal' : 'Yeni Teklif Oluştur'}</h3>
                  <p className="text-sm text-cinech-cream/60">{en ? 'Submit a new proposal for the community to vote on' : 'Topluluğun oylaması için yeni bir teklif gönder'}</p>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-cinech-cream/75 mb-1.5">{en ? 'Proposal Title' : 'Teklif Başlığı'}</label>
                    <input
                      type="text"
                      name="title"
                      value={newProposal.title}
                      onChange={handleInputChange}
                      className="w-full bg-cinech-ink-lighter/50 border border-cinech-ink-lighter rounded-lg px-4 py-2.5 text-cinech-cream focus:outline-none focus:ring-2 focus:ring-cinech-brown/50 focus:border-transparent"
                      placeholder={en ? 'Enter proposal title' : 'Teklif başlığını yaz'}
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-cinech-cream/75 mb-1.5">{en ? 'Description' : 'Açıklama'}</label>
                    <textarea
                      name="description"
                      value={newProposal.description}
                      onChange={handleInputChange}
                      className="w-full bg-cinech-ink-lighter/50 border border-cinech-ink-lighter rounded-lg px-4 py-2.5 text-cinech-cream focus:outline-none focus:ring-2 focus:ring-cinech-brown/50 focus:border-transparent min-h-[120px]"
                      placeholder={en ? 'Describe your proposal in detail...' : 'Teklifini ayrıntılı anlat...'}
                    ></textarea>
                  </div>
                  
                  <div className="bg-cinech-ink-light/60 p-4 rounded-lg border border-cinech-ink-lighter/50">
                    <div className="flex items-center text-sm text-cinech-cream/60 mb-2">
                      <Clock className="h-4 w-4 mr-2 text-cinech-brown" />
                      <span>{en ? 'Voting will be active for 7 days' : 'Oylama 7 gün açık kalacak'}</span>
                    </div>
                    <p className="text-xs text-cinech-cream/50">{en ? 'Proposals require a majority of \u2018Yes\u2019 votes to pass.' : 'Tekliflerin geçmesi için \u2018Evet\u2019 oylarının çoğunlukta olması gerekir.'}</p>
                  </div>
                </div>
                
                <div className="flex justify-end space-x-3 pt-2">
                  <button
                    onClick={() => setIsCreatingProposal(false)}
                    className="px-4 py-2.5 text-cinech-cream/75 hover:text-cinech-cream text-sm font-medium transition-colors"
                  >
                    {en ? 'Cancel' : 'Vazgeç'}
                  </button>
                  <button
                    onClick={handleCreateProposal}
                    disabled={!canWrite || !newProposal.title?.trim() || !newProposal.description?.trim()}
                    className="btn-olive !px-5 !py-2 !text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {en ? 'Create Proposal' : 'Teklif Oluştur'}
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
