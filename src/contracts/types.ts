export enum ProposalType {
  Movie = 0,
  Upload = 1,
  Other = 2
}

export enum ProposalStatus {
  Pending = 0,
  Active = 1,
  Passed = 2,
  Rejected = 3,
  Executed = 4
}

export interface MediaProposal {
  ipfsHash: string;
  metadataHash: string;
  approved: boolean;
}

export interface Proposal {
  id: bigint;
  title: string;
  description: string;
  startTime: bigint;
  endTime: bigint;
  yesVotes: bigint;
  noVotes: bigint;
  creator: `0x${string}`;
  proposalType: ProposalType;
  status: ProposalStatus;
  executed: boolean;
  hasVoted: boolean;
  mediaProposal?: MediaProposal;
}

export interface VotingContractABI {
  // State Variables
  proposalCount: () => Promise<bigint>;
  minimumVotes: () => Promise<bigint>;
  
  // Functions
  createProposal: (
    title: string,
    description: string,
    duration: bigint,
    proposalType: ProposalType,
    ipfsHash: string,
    metadataHash: string
  ) => Promise<{ hash: string }>;
  
  vote: (proposalId: bigint, support: boolean) => Promise<{ hash: string }>;
  executeProposal: (proposalId: bigint) => Promise<{ hash: string }>;
  getProposal: (proposalId: bigint) => Promise<{
    id: bigint;
    title: string;
    description: string;
    startTime: bigint;
    endTime: bigint;
    yesVotes: bigint;
    noVotes: bigint;
    creator: `0x${string}`;
    proposalType: ProposalType;
    status: ProposalStatus;
    executed: boolean;
  }>;
  
  getMediaProposal: (proposalId: bigint) => Promise<{
    ipfsHash: string;
    metadataHash: string;
    approved: boolean;
  }>;
  
  hasVoted: (proposalId: bigint, voter: `0x${string}`) => Promise<boolean>;
  
  // Events
  events: {
    ProposalCreated: {
      listener: (args: {
        proposalId: bigint;
        creator: `0x${string}`;
        title: string;
        description: string;
        startTime: bigint;
        endTime: bigint;
        proposalType: ProposalType;
      }) => void;
    };
    
    VoteCast: {
      listener: (args: {
        voter: `0x${string}`;
        proposalId: bigint;
        support: boolean;
        weight: bigint;
      }) => void;
    };
  };
}
