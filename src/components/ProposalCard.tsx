'use client';

import { motion } from 'framer-motion';
import { CheckCircle, XCircle, Clock, CheckCircle2, ExternalLink } from 'lucide-react';

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

interface ProposalCardProps {
  proposal: Proposal;
  viewMode: 'grid' | 'list';
  onVote: (id: number, vote: 'yes' | 'no') => void;
  getTimeLeft: (endTime: number) => string;
  getVotePercentage: (yes: number, no: number) => { yes: number; no: number };
}

export default function ProposalCard({ proposal, viewMode, onVote, getTimeLeft, getVotePercentage }: ProposalCardProps) {
  const timeLeft = getTimeLeft(proposal.endTime);
  const percentages = getVotePercentage(proposal.yesVotes, proposal.noVotes);
  const isActive = Date.now() < proposal.endTime && Date.now() > proposal.startTime;
  const isPending = Date.now() < proposal.startTime;
  const totalVotes = proposal.yesVotes + proposal.noVotes;
  
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ type: 'spring', stiffness: 300, damping: 25 }}
      className={`group relative bg-gradient-to-br from-gray-800/50 to-gray-900/80 backdrop-blur-sm rounded-2xl overflow-hidden border border-white/5 hover:border-cinech-gold/30 transition-all duration-300 hover:shadow-lg hover:shadow-cinech-gold/5 ${
        viewMode === 'list' ? 'flex flex-col md:flex-row' : 'h-full flex flex-col'
      }`}
    >
      {/* Status Badge */}
      <div className={`absolute top-4 right-4 px-3 py-1 rounded-full text-xs font-medium ${
        isPending 
          ? 'bg-amber-500/20 text-amber-400' 
          : isActive 
            ? 'bg-green-500/20 text-green-400' 
            : 'bg-gray-500/20 text-gray-400'
      }`}>
        {isPending ? 'Pending' : isActive ? 'Voting Active' : 'Completed'}
      </div>

      <div className={`p-6 ${viewMode === 'list' ? 'md:flex-1' : 'flex-1'}`}>
        <div className="flex items-start justify-between">
          <div>
            <h3 className="text-xl font-semibold text-white mb-2 pr-8 group-hover:text-cinech-gold transition-colors">
              {proposal.title}
            </h3>
            <p className="text-gray-400 mb-4 line-clamp-3">{proposal.description}</p>
          </div>
          <button className="p-1.5 rounded-full hover:bg-white/5 text-gray-500 hover:text-white transition-colors ml-2">
            <ExternalLink className="h-4 w-4" />
          </button>
        </div>
        
        {/* Voting Progress */}
        <div className="mt-4 space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-green-400 font-medium">
              {Math.round(percentages.yes)}% Yes
            </span>
            <span className="text-gray-400">
              {proposal.yesVotes.toLocaleString()} votes
            </span>
          </div>
          <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-green-500 to-emerald-400 transition-all duration-500 ease-out" 
              style={{ width: `${percentages.yes}%` }}
            />
          </div>
          
          <div className="flex justify-between text-sm mt-3">
            <span className="text-red-400 font-medium">
              {Math.round(percentages.no)}% No
            </span>
            <span className="text-gray-400">
              {proposal.noVotes.toLocaleString()} votes
            </span>
          </div>
          <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-red-500 to-pink-500 transition-all duration-500 ease-out" 
              style={{ width: `${percentages.no}%` }}
            />
          </div>
        </div>
        
        {/* Time and Stats */}
        <div className="mt-4 pt-4 border-t border-white/5 flex items-center justify-between text-sm">
          <div className="flex items-center text-gray-400">
            {isPending ? (
              <>
                <Clock className="h-4 w-4 mr-1.5 text-blue-400" />
                <span>Starts in {timeLeft}</span>
              </>
            ) : isActive ? (
              <>
                <div className="h-2 w-2 rounded-full bg-green-400 mr-1.5 animate-pulse"></div>
                <span>Ends in {timeLeft}</span>
              </>
            ) : (
              <>
                <CheckCircle2 className="h-4 w-4 mr-1.5 text-green-400" />
                <span>Ended {timeLeft}</span>
              </>
            )}
          </div>
          <div className="text-gray-500">
            {totalVotes.toLocaleString()} total votes
          </div>
        </div>
      </div>

      {/* Voting Buttons */}
      {isActive && (
        <div className={`p-4 bg-gradient-to-t from-black/50 to-transparent ${
          viewMode === 'list' ? 'md:w-64 md:border-l md:border-white/5' : 'border-t border-white/5'
        }`}>
          <h4 className="text-sm font-medium text-gray-300 mb-3">Cast your vote</h4>
          <div className="space-y-2">
            <button
              onClick={() => onVote(proposal.id, 'yes')}
              className="w-full flex items-center justify-center gap-2 bg-green-500/10 hover:bg-green-500/20 border border-green-500/30 text-green-400 px-4 py-2.5 rounded-lg font-medium transition-all hover:shadow-lg hover:shadow-green-500/10"
            >
              <CheckCircle className="h-5 w-5" />
              Vote Yes
            </button>
            <button
              onClick={() => onVote(proposal.id, 'no')}
              className="w-full flex items-center justify-center gap-2 bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 text-red-400 px-4 py-2.5 rounded-lg font-medium transition-all hover:shadow-lg hover:shadow-red-500/10"
            >
              <XCircle className="h-5 w-5" />
              Vote No
            </button>
          </div>
        </div>
      )}
      
      {/* Hover Effect */}
      <div className="absolute inset-0 bg-gradient-to-br from-cinech-gold/0 via-cinech-gold/0 to-cinech-gold/0 group-hover:via-cinech-gold/3 group-hover:to-cinech-gold/5 transition-all duration-300 pointer-events-none" />
    </motion.div>
  );
}
