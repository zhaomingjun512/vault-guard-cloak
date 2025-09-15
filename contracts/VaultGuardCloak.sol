// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import { SepoliaConfig } from "@fhevm/solidity/config/ZamaConfig.sol";
import { euint32, externalEuint32, euint8, ebool, FHE } from "@fhevm/solidity/lib/FHE.sol";

contract VaultGuardCloak is SepoliaConfig {
    using FHE for *;
    
    struct Proposal {
        euint32 proposalId;
        euint32 votesFor;
        euint32 votesAgainst;
        euint32 totalVotes;
        bool isActive;
        bool isExecuted;
        string title;
        string description;
        address proposer;
        uint256 startTime;
        uint256 endTime;
        euint32 requiredQuorum;
    }
    
    struct Voter {
        euint32 reputation;
        bool hasVoted;
        euint8 voteChoice; // 0 = no vote, 1 = for, 2 = against
        uint256 lastVoteTime;
    }
    
    struct Treasury {
        euint32 totalFunds;
        euint32 availableFunds;
        euint32 lockedFunds;
        address[] signers;
        euint32 requiredSignatures;
    }
    
    mapping(uint256 => Proposal) public proposals;
    mapping(address => Voter) public voters;
    mapping(address => bool) public isSigner;
    mapping(address => euint32) public signerReputation;
    
    Treasury public treasury;
    
    uint256 public proposalCounter;
    uint256 public constant VOTING_PERIOD = 7 days;
    uint256 public constant EXECUTION_DELAY = 1 days;
    
    address public owner;
    address public verifier;
    
    event ProposalCreated(uint256 indexed proposalId, address indexed proposer, string title);
    event VoteCast(uint256 indexed proposalId, address indexed voter, uint8 choice);
    event ProposalExecuted(uint256 indexed proposalId, bool success);
    event FundsDeposited(address indexed depositor, uint32 amount);
    event FundsWithdrawn(address indexed recipient, uint32 amount);
    event SignerAdded(address indexed signer);
    event SignerRemoved(address indexed signer);
    event ReputationUpdated(address indexed user, uint32 reputation);
    
    modifier onlyOwner() {
        require(msg.sender == owner, "Only owner can call this function");
        _;
    }
    
    modifier onlySigner() {
        require(isSigner[msg.sender], "Only signers can call this function");
        _;
    }
    
    modifier onlyVerifier() {
        require(msg.sender == verifier, "Only verifier can call this function");
        _;
    }
    
    constructor(address _verifier, address[] memory _initialSigners, uint32 _requiredSignatures) {
        owner = msg.sender;
        verifier = _verifier;
        
        treasury.signers = _initialSigners;
        treasury.requiredSignatures = FHE.asEuint32(_requiredSignatures);
        treasury.totalFunds = FHE.asEuint32(0);
        treasury.availableFunds = FHE.asEuint32(0);
        treasury.lockedFunds = FHE.asEuint32(0);
        
        for (uint256 i = 0; i < _initialSigners.length; i++) {
            isSigner[_initialSigners[i]] = true;
            signerReputation[_initialSigners[i]] = FHE.asEuint32(100); // Initial reputation
        }
    }
    
    function createProposal(
        string memory _title,
        string memory _description,
        externalEuint32 _requiredQuorum,
        bytes calldata inputProof
    ) public onlySigner returns (uint256) {
        require(bytes(_title).length > 0, "Title cannot be empty");
        require(bytes(_description).length > 0, "Description cannot be empty");
        
        uint256 proposalId = proposalCounter++;
        
        // Convert externalEuint32 to euint32 using FHE.fromExternal
        euint32 internalQuorum = FHE.fromExternal(_requiredQuorum, inputProof);
        
        proposals[proposalId] = Proposal({
            proposalId: FHE.asEuint32(0), // Will be set properly later
            votesFor: FHE.asEuint32(0),
            votesAgainst: FHE.asEuint32(0),
            totalVotes: FHE.asEuint32(0),
            isActive: true,
            isExecuted: false,
            title: _title,
            description: _description,
            proposer: msg.sender,
            startTime: block.timestamp,
            endTime: block.timestamp + VOTING_PERIOD,
            requiredQuorum: internalQuorum
        });
        
        emit ProposalCreated(proposalId, msg.sender, _title);
        return proposalId;
    }
    
    function castVote(
        uint256 _proposalId,
        externalEuint32 _voteChoice,
        bytes calldata inputProof
    ) public onlySigner {
        require(proposals[_proposalId].proposer != address(0), "Proposal does not exist");
        require(proposals[_proposalId].isActive, "Proposal is not active");
        require(block.timestamp <= proposals[_proposalId].endTime, "Voting period has ended");
        require(!voters[msg.sender].hasVoted, "Already voted on this proposal");
        
        // Convert externalEuint32 to euint32 using FHE.fromExternal
        euint32 internalVoteChoice = FHE.fromExternal(_voteChoice, inputProof);
        
        // Update voter status
        voters[msg.sender].hasVoted = true;
        voters[msg.sender].voteChoice = FHE.asEuint8(internalVoteChoice);
        voters[msg.sender].lastVoteTime = block.timestamp;
        
        // Get voter reputation for weighted voting
        euint32 voterReputation = signerReputation[msg.sender];
        
        // Add vote to proposal (encrypted until quorum is reached)
        proposals[_proposalId].totalVotes = FHE.add(proposals[_proposalId].totalVotes, voterReputation);
        
        // Check if vote is for or against (1 = for, 2 = against)
        ebool isForVote = FHE.eq(internalVoteChoice, FHE.asEuint32(1));
        ebool isAgainstVote = FHE.eq(internalVoteChoice, FHE.asEuint32(2));
        
        // Add to appropriate vote count
        proposals[_proposalId].votesFor = FHE.select(
            isForVote,
            FHE.add(proposals[_proposalId].votesFor, voterReputation),
            proposals[_proposalId].votesFor
        );
        
        proposals[_proposalId].votesAgainst = FHE.select(
            isAgainstVote,
            FHE.add(proposals[_proposalId].votesAgainst, voterReputation),
            proposals[_proposalId].votesAgainst
        );
        
        emit VoteCast(_proposalId, msg.sender, 0); // Vote choice will be decrypted off-chain
    }
    
    function executeProposal(uint256 _proposalId) public onlySigner {
        require(proposals[_proposalId].proposer != address(0), "Proposal does not exist");
        require(proposals[_proposalId].isActive, "Proposal is not active");
        require(block.timestamp > proposals[_proposalId].endTime, "Voting period not ended");
        require(block.timestamp > proposals[_proposalId].endTime + EXECUTION_DELAY, "Execution delay not met");
        require(!proposals[_proposalId].isExecuted, "Proposal already executed");
        
        // Check if quorum is reached (this will be decrypted off-chain)
        // For now, we'll mark it as executable
        proposals[_proposalId].isExecuted = true;
        proposals[_proposalId].isActive = false;
        
        emit ProposalExecuted(_proposalId, true);
    }
    
    function depositFunds(externalEuint32 _amount, bytes calldata inputProof) public payable {
        require(msg.value > 0, "Must send ETH");
        
        // Convert externalEuint32 to euint32 using FHE.fromExternal
        euint32 internalAmount = FHE.fromExternal(_amount, inputProof);
        
        // Update treasury (encrypted)
        treasury.totalFunds = FHE.add(treasury.totalFunds, internalAmount);
        treasury.availableFunds = FHE.add(treasury.availableFunds, internalAmount);
        
        emit FundsDeposited(msg.sender, 0); // Amount will be decrypted off-chain
    }
    
    function withdrawFunds(
        uint256 _proposalId,
        address _recipient,
        externalEuint32 _amount,
        bytes calldata inputProof
    ) public onlySigner {
        require(proposals[_proposalId].isExecuted, "Proposal must be executed");
        require(_recipient != address(0), "Invalid recipient");
        
        // Convert externalEuint32 to euint32 using FHE.fromExternal
        euint32 internalAmount = FHE.fromExternal(_amount, inputProof);
        
        // Update treasury (encrypted)
        treasury.availableFunds = FHE.sub(treasury.availableFunds, internalAmount);
        treasury.lockedFunds = FHE.add(treasury.lockedFunds, internalAmount);
        
        // Transfer funds (in real implementation, this would be based on decrypted amount)
        // payable(_recipient).transfer(amount);
        
        emit FundsWithdrawn(_recipient, 0); // Amount will be decrypted off-chain
    }
    
    function addSigner(address _newSigner) public onlyOwner {
        require(_newSigner != address(0), "Invalid signer address");
        require(!isSigner[_newSigner], "Already a signer");
        
        isSigner[_newSigner] = true;
        treasury.signers.push(_newSigner);
        signerReputation[_newSigner] = FHE.asEuint32(100); // Initial reputation
        
        emit SignerAdded(_newSigner);
    }
    
    function removeSigner(address _signer) public onlyOwner {
        require(isSigner[_signer], "Not a signer");
        require(treasury.signers.length > 1, "Cannot remove last signer");
        
        isSigner[_signer] = false;
        
        // Remove from signers array
        for (uint256 i = 0; i < treasury.signers.length; i++) {
            if (treasury.signers[i] == _signer) {
                treasury.signers[i] = treasury.signers[treasury.signers.length - 1];
                treasury.signers.pop();
                break;
            }
        }
        
        emit SignerRemoved(_signer);
    }
    
    function updateReputation(address _user, euint32 _reputation) public onlyVerifier {
        require(_user != address(0), "Invalid user address");
        require(isSigner[_user], "User must be a signer");
        
        signerReputation[_user] = _reputation;
        emit ReputationUpdated(_user, 0); // FHE.decrypt(_reputation) - will be decrypted off-chain
    }
    
    function getProposalInfo(uint256 _proposalId) public view returns (
        string memory title,
        string memory description,
        uint8 votesFor,
        uint8 votesAgainst,
        uint8 totalVotes,
        uint8 requiredQuorum,
        bool isActive,
        bool isExecuted,
        address proposer,
        uint256 startTime,
        uint256 endTime
    ) {
        Proposal storage proposal = proposals[_proposalId];
        return (
            proposal.title,
            proposal.description,
            0, // FHE.decrypt(proposal.votesFor) - will be decrypted off-chain
            0, // FHE.decrypt(proposal.votesAgainst) - will be decrypted off-chain
            0, // FHE.decrypt(proposal.totalVotes) - will be decrypted off-chain
            0, // FHE.decrypt(proposal.requiredQuorum) - will be decrypted off-chain
            proposal.isActive,
            proposal.isExecuted,
            proposal.proposer,
            proposal.startTime,
            proposal.endTime
        );
    }
    
    function getTreasuryInfo() public view returns (
        uint8 totalFunds,
        uint8 availableFunds,
        uint8 lockedFunds,
        uint8 requiredSignatures,
        address[] memory signers
    ) {
        return (
            0, // FHE.decrypt(treasury.totalFunds) - will be decrypted off-chain
            0, // FHE.decrypt(treasury.availableFunds) - will be decrypted off-chain
            0, // FHE.decrypt(treasury.lockedFunds) - will be decrypted off-chain
            0, // FHE.decrypt(treasury.requiredSignatures) - will be decrypted off-chain
            treasury.signers
        );
    }
    
    function getVoterInfo(address _voter) public view returns (
        uint8 reputation,
        bool hasVoted,
        uint8 voteChoice,
        uint256 lastVoteTime
    ) {
        Voter storage voter = voters[_voter];
        return (
            0, // FHE.decrypt(voter.reputation) - will be decrypted off-chain
            voter.hasVoted,
            0, // FHE.decrypt(voter.voteChoice) - will be decrypted off-chain
            voter.lastVoteTime
        );
    }
    
    function getSignerReputation(address _signer) public view returns (uint8) {
        return 0; // FHE.decrypt(signerReputation[_signer]) - will be decrypted off-chain
    }
}
