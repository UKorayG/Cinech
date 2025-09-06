// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract VotingContract {
    // Event to emit when a vote is cast
    event VoteCast(address indexed voter, uint256 indexed roomId, uint256 choice);

    // Struct to store vote counts for each choice in a room
    struct RoomVotes {
        uint256 choice1; // Katil Kaçtı
        uint256 choice2; // Katil Yakalandı
        mapping(address => bool) hasVoted; // Track if an address has voted
    }

    // Mapping from room ID to its votes
    mapping(uint256 => RoomVotes) public roomVotes;

    /**
     * @dev Cast a vote for a specific room
     * @param roomId The ID of the room
     * @param choice The choice (1 for Katil Kaçtı, 2 for Katil Yakalandı)
     */
    function castVote(uint256 roomId, uint256 choice) external {
        require(choice == 1 || choice == 2, "Invalid choice");
        require(!roomVotes[roomId].hasVoted[msg.sender], "Already voted");

        // Update vote count
        if (choice == 1) {
            roomVotes[roomId].choice1++;
        } else {
            roomVotes[roomId].choice2++;
        }

        // Mark as voted
        roomVotes[roomId].hasVoted[msg.sender] = true;

        // Emit event
        emit VoteCast(msg.sender, roomId, choice);
    }

    /**
     * @dev Get vote counts for a room
     * @param roomId The ID of the room
     * @return choice1Votes Number of votes for choice 1 (Katil Kaçtı)
     * @return choice2Votes Number of votes for choice 2 (Katil Yakalandı)
     */
    function getVotes(uint256 roomId) external view returns (uint256 choice1Votes, uint256 choice2Votes) {
        return (roomVotes[roomId].choice1, roomVotes[roomId].choice2);
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
