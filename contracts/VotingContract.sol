// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract MovieVotingDAO {
    // Events
    event ProposalCreated(
        uint256 indexed proposalId,
        address indexed creator,
        string title,
        string description,
        uint256 startTime,
        uint256 endTime,
        ProposalType proposalType
    );
    
    event VoteCast(
        address indexed voter,
        uint256 indexed proposalId,
        bool support,
        uint256 weight
    );

    enum ProposalType { Movie, Upload, Other }
    enum ProposalStatus { Pending, Active, Passed, Rejected, Executed }

    struct Proposal {
        uint256 id;
        string title;
        string description;
        uint256 startTime;
        uint256 endTime;
        uint256 yesVotes;
        uint256 noVotes;
        address creator;
        ProposalType proposalType;
        ProposalStatus status;
        bool executed;
        mapping(address => bool) hasVoted;
    }

    // State variables
    uint256 public proposalCount;
    mapping(uint256 => Proposal) public proposals;
    uint256 public votingPeriod = 7 days; // Default voting period
    uint256 public minimumVotes = 10; // Minimum votes to consider a proposal passed
    
    // Movie/Upload specific data
    struct MediaProposal {
        string ipfsHash; // IPFS hash for the media file
        string metadataHash; // IPFS hash for the metadata
        bool approved;
    }
    
    mapping(uint256 => MediaProposal) public mediaProposals;

    // Modifiers
    modifier onlyActiveProposal(uint256 proposalId) {
        require(proposalId <= proposalCount && proposalId > 0, "Invalid proposal ID");
        require(block.timestamp >= proposals[proposalId].startTime, "Voting not started");
        require(block.timestamp <= proposals[proposalId].endTime, "Voting ended");
        _;
    }

    // Proposal creation
    function createProposal(
        string memory _title,
        string memory _description,
        uint256 _duration,
        ProposalType _proposalType,
        string memory _ipfsHash,
        string memory _metadataHash
    ) external {
        require(bytes(_title).length > 0, "Title cannot be empty");
        require(bytes(_description).length > 0, "Description cannot be empty");
        require(_duration > 0, "Duration must be positive");
        
        proposalCount++;
        Proposal storage newProposal = proposals[proposalCount];
        
        newProposal.id = proposalCount;
        newProposal.title = _title;
        newProposal.description = _description;
        newProposal.startTime = block.timestamp;
        newProposal.endTime = block.timestamp + _duration;
        newProposal.creator = msg.sender;
        newProposal.proposalType = _proposalType;
        newProposal.status = ProposalStatus.Active;
        newProposal.executed = false;
        
        // Store media-specific data if it's a movie or upload proposal
        if (_proposalType == ProposalType.Movie || _proposalType == ProposalType.Upload) {
            mediaProposals[proposalCount] = MediaProposal({
                ipfsHash: _ipfsHash,
                metadataHash: _metadataHash,
                approved: false
            });
        }
        
        emit ProposalCreated(
            proposalCount,
            msg.sender,
            _title,
            _description,
            block.timestamp,
            block.timestamp + _duration,
            _proposalType
        );
    }

    // Voting function
    function vote(uint256 _proposalId, bool _support) external onlyActiveProposal(_proposalId) {
        Proposal storage proposal = proposals[_proposalId];
        require(!proposal.hasVoted[msg.sender], "Already voted");
        
        // In a real implementation, you might want to check token balance for voting power
        uint256 votingPower = 1; // 1 vote per address for simplicity
        
        if (_support) {
            proposal.yesVotes += votingPower;
        } else {
            proposal.noVotes += votingPower;
        }
        
        proposal.hasVoted[msg.sender] = true;
        
        emit VoteCast(msg.sender, _proposalId, _support, votingPower);
    }
    
    // Execute proposal if passed
    function executeProposal(uint256 _proposalId) external {
        Proposal storage proposal = proposals[_proposalId];
        require(!proposal.executed, "Proposal already executed");
        require(block.timestamp > proposal.endTime, "Voting not ended");
        
        if (proposal.yesVotes > proposal.noVotes && 
            (proposal.yesVotes + proposal.noVotes) >= minimumVotes) {
            // Proposal passed
            proposal.status = ProposalStatus.Passed;
            
            // Execute the proposal action
            if (proposal.proposalType == ProposalType.Movie || 
                proposal.proposalType == ProposalType.Upload) {
                mediaProposals[_proposalId].approved = true;
            }
            // Add more execution logic for different proposal types
            
        } else {
            proposal.status = ProposalStatus.Rejected;
        }
        
        proposal.executed = true;
    }
    
    // Getters
    function getProposal(uint256 _proposalId) external view returns (
        uint256 id,
        string memory title,
        string memory description,
        uint256 startTime,
        uint256 endTime,
        uint256 yesVotes,
        uint256 noVotes,
        address creator,
        ProposalType proposalType,
        ProposalStatus status,
        bool executed
    ) {
        Proposal storage p = proposals[_proposalId];
        return (
            p.id,
            p.title,
            p.description,
            p.startTime,
            p.endTime,
            p.yesVotes,
            p.noVotes,
            p.creator,
            p.proposalType,
            p.status,
            p.executed
        );
    }
    
    function getMediaProposal(uint256 _proposalId) external view returns (
        string memory ipfsHash,
        string memory metadataHash,
        bool approved
    ) {
        MediaProposal storage mp = mediaProposals[_proposalId];
        return (
            mp.ipfsHash,
            mp.metadataHash,
            mp.approved
        );
    }

    /**
     * @dev Check if an address has voted in a specific room
     * @param roomId The ID of the room
     * @param voter The address to check
     * @return hasVoted Boolean indicating if the address has voted
     */
    function hasVoted(uint256 roomId, address voter) external view returns (bool) {
        return roomVotes[roomId].hasVoted[voter];
    }
}
