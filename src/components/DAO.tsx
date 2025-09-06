'use client';

import { useState, useEffect } from 'react';
import { Vote, Clock, CheckCircle, XCircle, Plus, Zap, TrendingUp, ListChecks, CheckCircle2, X, Users } from 'lucide-react';
import { useAccount, useWriteContract, useReadContract } from 'wagmi';
import { DAO_ABI, CONTRACT_ADDRESSES } from '@/lib/contracts';

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
  const [timeLeft, setTimeLeft] = useState('Yükleniyor...');
  
  const [proposals, setProposals] = useState<Proposal[]>([
    {
      id: 1,
      title: 'Yeni Film Kategorisi Ekle',
      description: 'Klasik filmler için yeni bir kategori ekleyelim mi?',
      yesVotes: 120,
      noVotes: 45,
      startTime: Date.now() - 86400000, // 1 gün önce
      endTime: Date.now() + 86400000 * 2, // 2 gün sonra
      status: 'active'
    },
    {
      id: 2,
      title: 'Üyelik Ücretlerini Güncelle',
      description: 'Üyelik ücretlerini %10 artıralım mı?',
      yesVotes: 0,
      noVotes: 0,
      startTime: Date.now() + 86400000, // yarın başlıyor
      endTime: Date.now() + 86400000 * 4, // 4 gün sonra bitiyor
      status: 'pending'
    },
    {
      id: 3,
      title: 'Yeni Özellik: İzleme Partileri',
      description: 'Premium üyeler için birlikte izleme özelliği ekleyelim mi?',
      yesVotes: 200,
      noVotes: 50,
      startTime: Date.now() - 86400000 * 3, // 3 gün önce
      endTime: Date.now() - 86400000, // 1 gün önce bitti
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
            setTimeLeft(`${days}g ${hours}sa ${minutes}d`);
          } else if (hours > 0) {
            setTimeLeft(`${hours}sa ${minutes}d ${seconds}sn`);
          } else {
            setTimeLeft(`${minutes}d ${seconds}sn`);
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
    
    if (diff <= 0) return 'Süre Doldu';
    
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    
    if (days > 0) return `${days}g ${hours}s kaldı`;
    if (hours > 0) return `${hours}sa ${Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))}dk kaldı`;
    return `${Math.floor((diff % (1000 * 60)) / 1000)}sn kaldı`;
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
      title: `Öneri #${proposals.length + 1}`,
      description: newProposal,
      yesVotes: 0,
      noVotes: 0,
      startTime: Date.now(),
      endTime: Date.now() + 86400000 * 3, // 3 gün sonra
      status: 'active'
    };
    
    setProposals([newProposalObj, ...proposals]);
    setNewProposal('');
    setIsCreatingProposal(false);
  };

  return (
    <div className="bg-gradient-to-br from-gray-900/80 to-gray-800/80 backdrop-blur-lg rounded-2xl p-6 shadow-2xl border border-white/10 overflow-hidden">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8">
        <div className="flex items-center">
          <div className="p-3 bg-cinech-gold/20 rounded-xl mr-4">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-cinech-gold">
              <path d="M7 10v12"></path>
              <path d="M15 5.88 14 10h5.83a2 2 0 0 1 1.92 2.56l-2.33 8A2 2 0 0 1 16.5 22h-8.5a2 2 0 0 1-2-2v-8a2 2 0 0 1 2-2h5l4-4.6A2 2 0 0 1 18 4h0a2 2 0 0 1 2 2v4"></path>
              <path d="M12 10v10"></path>
              <path d="M7 16h10"></path>
            </svg>
          </div>
          <div>
            <h2 className="text-2xl font-bold text-white">DAO Önerileri</h2>
            <p className="text-gray-400">Topluluk kararlarına katılın</p>
          </div>
        </div>
        <button
          onClick={() => setIsCreatingProposal(true)}
          className="mt-4 md:mt-0 flex items-center gap-2 bg-cinech-gold hover:bg-cinech-gold/90 text-cinech-dark px-4 py-2 rounded-lg font-medium transition-colors"
        >
          <Plus className="h-5 w-5" />
          Yeni Öneri
        </button>
      </div>

      {/* Sekmeler */}
      <div className="flex space-x-2 mb-6 border-b border-gray-700">
        {['active', 'pending', 'executed'].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab as 'active' | 'pending' | 'executed')}
            className={`px-4 py-2 text-sm font-medium rounded-t-lg transition-colors ${
              activeTab === tab
                ? 'bg-cinech-gold/20 text-cinech-gold border-b-2 border-cinech-gold'
                : 'text-gray-400 hover:text-white hover:bg-gray-700/50'
            }`}
          >
            {tab === 'active' ? 'Aktif' : tab === 'pending' ? 'Bekleyen' : 'Tamamlanan'}
          </button>
        ))}
      </div>

      {/* Öneri Listesi */}
      <div className="space-y-4">
        {filteredProposals.length === 0 ? (
          <div className="text-center py-12">
            <div className="bg-gray-800/50 p-6 rounded-2xl inline-block">
              <ListChecks className="h-10 w-10 text-gray-500 mx-auto mb-3" />
              <h4 className="text-gray-300 font-medium">
                {activeTab === 'active' 
                  ? 'Henüz aktif öneri yok' 
                  : activeTab === 'pending'
                    ? 'Bekleyen öneri bulunamadı'
                    : 'Tamamlanmış öneri yok'}
              </h4>
              <p className="text-gray-500 text-sm mt-1">
                {activeTab === 'active' 
                  ? 'Şu anda aktif olan herhangi bir öneri bulunmuyor.' 
                  : activeTab === 'pending'
                    ? 'Onay bekleyen herhangi bir öneri bulunmuyor.'
                    : 'Henüz tamamlanmış bir öneri bulunmuyor.'}
              </p>
            </div>
          </div>
        ) : (
          filteredProposals.map((proposal) => {
            const timeLeft = getTimeLeft(proposal.endTime);
            const percentages = getVotePercentage(proposal.yesVotes, proposal.noVotes);
            const isActive = Date.now() < proposal.endTime;
            const isPending = Date.now() < proposal.startTime;
            const totalVotes = proposal.yesVotes + proposal.noVotes;

            return (
              <div 
                key={proposal.id} 
                className="group relative bg-gradient-to-br from-gray-800/50 to-gray-900/80 backdrop-blur-sm rounded-xl p-5 border border-white/5 hover:border-cinech-gold/30 transition-all duration-300 hover:shadow-lg hover:shadow-cinech-gold/5 overflow-hidden"
              >
                {/* Durum Etiketi */}
                <div className={`absolute top-4 right-4 px-3 py-1 rounded-full text-xs font-medium ${
                  isPending 
                    ? 'bg-amber-500/20 text-amber-400' 
                    : isActive 
                      ? 'bg-green-500/20 text-green-400' 
                      : 'bg-gray-500/20 text-gray-400'
                }`}>
                  {isPending ? 'Bekliyor' : isActive ? 'Aktif' : 'Tamamlandı'}
                </div>

                <h3 className="text-xl font-semibold text-white mb-2 pr-16">{proposal.title}</h3>
                <p className="text-gray-400 mb-4">{proposal.description}</p>
                
                {/* Oylama Durumu */}
                <div className="mb-4">
                  <div className="flex justify-between text-sm text-gray-400 mb-1">
                    <span>Evet: {proposal.yesVotes} (%{percentages.yes})</span>
                    <span>Hayır: {proposal.noVotes} (%{percentages.no})</span>
                  </div>
                  <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-green-500 to-green-400" 
                      style={{ width: `${percentages.yes}%` }}
                    />
                  </div>
                </div>

                {/* Zaman ve Oylar */}
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center text-gray-400">
                    <Clock className="h-4 w-4 mr-1" />
                    <span>{isMounted ? timeLeft : 'Yükleniyor...'}</span>
                  </div>
                  <div className="flex items-center text-gray-400">
                    <Users className="h-4 w-4 mr-1" />
                    <span>{totalVotes} oy</span>
                  </div>
                </div>

                {/* Oylama Butonları */}
                {isActive && (
                  <div className="flex space-x-3 mt-4">
                    <button
                      onClick={() => handleVote(proposal.id, 'yes')}
                      className="flex-1 flex items-center justify-center gap-2 bg-green-500/20 hover:bg-green-500/30 text-green-400 px-4 py-2 rounded-lg transition-colors"
                    >
                      <CheckCircle className="h-4 w-4" />
                      Evet
                    </button>
                    <button
                      onClick={() => handleVote(proposal.id, 'no')}
                      className="flex-1 flex items-center justify-center gap-2 bg-red-500/20 hover:bg-red-500/30 text-red-400 px-4 py-2 rounded-lg transition-colors"
                    >
                      <XCircle className="h-4 w-4" />
                      Hayır
                    </button>
                  </div>
                )}
                
                {/* Hover Efekti */}
                <div className="absolute inset-0 bg-gradient-to-br from-cinech-gold/0 to-cinech-gold/0 group-hover:from-cinech-gold/5 group-hover:to-cinech-gold/10 transition-all duration-300 pointer-events-none" />
              </div>
            );
          })
        )}
      </div>

      {/* Yeni Öneri Modalı */}
      {isCreatingProposal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800 rounded-xl max-w-md w-full p-6 relative">
            <button
              onClick={() => setIsCreatingProposal(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-white text-2xl"
            >
              &times;
            </button>
            <h3 className="text-xl font-semibold text-white mb-4">Yeni Öneri Oluştur</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Açıklama
                </label>
                <textarea
                  value={newProposal}
                  onChange={(e) => setNewProposal(e.target.value)}
                  className="w-full bg-gray-700/50 border border-gray-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-cinech-gold/50"
                  rows={4}
                  placeholder="Önerinizi detaylı bir şekilde açıklayın..."
                />
              </div>
              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => setIsCreatingProposal(false)}
                  className="px-4 py-2 text-gray-300 hover:text-white"
                >
                  İptal
                </button>
                <button
                  onClick={handleCreateProposal}
                  disabled={!newProposal.trim()}
                  className="px-4 py-2 bg-cinech-gold hover:bg-cinech-gold/90 text-cinech-dark rounded-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Öneriyi Oluştur
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}