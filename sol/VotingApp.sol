pragma solidity ^0.5.0;


import "https://github.com/OpenZeppelin/openzeppelin-contracts/blob/release-v2.5.0/contracts/math/SafeMath.sol";


contract VotingAppCrowdsale {
    using SafeMath for uint256; 

    address private _owner;
    uint256 private _start_time;
    uint256 private _end_time;

    mapping(address => bool) private _isVoter;
    mapping(address => bool) private _hasVoted;
    mapping(address => bool) private _isCandidate;
    mapping(address => uint256) private _numberVotes;
    

    constructor(
        address votingAuth,
	    uint256 start_time,
	    uint256 end_time
    )
      public
    {
        _owner = votingAuth;
        _start_time = start_time;
        _end_time = end_time;
    }


    // modifier onlyVotingAuth {
    //     require(msg.sender == _owner);
    //     _;
    // }
    

    function getOwner() public view returns(address){
        return _owner;
    }


    function canVote(address voter) public view returns(bool){
        return _isVoter[voter];
    }

    function voterRegistration(address voter)
        public
        {
            _isVoter[voter] = true;
        }

    function candidateRegistration(address candidate)
        public
        {
            require(canVote(candidate),"Candidate should be a regestred voter!");
            require(address(msg.sender) == _owner,"Only Voting Authority can register a candidate");
            _isCandidate[candidate] = true;
        }


    function castMyVote(address candidate)
        public
        {
            require(canVote(address(msg.sender)),"You should register first!");
            require(_hasVoted[address(msg.sender)]==false ,"You have already voted!");
            
            require(_isCandidate[candidate],"This is not a cadidate!");
            require(now > _start_time && now < _end_time,"You are outside of the voting period");
            require(!_isCandidate[msg.sender], "You cannot vote for yourself. Sorry.");

            _hasVoted[address(msg.sender)] = true;
            _numberVotes[candidate] = _numberVotes[candidate].add(1);
        }

    function getNumberVotes(address candidate) public view returns(uint){
        require(_isCandidate[candidate],"This is not a cadidate!");
        return _numberVotes[candidate];
    }

    function setStartTime(uint start_time) public {
        require(msg.sender == _owner, "Only Voting Authority can set Start Time");
        _start_time = start_time;
    }

    function setEndTime(uint end_time) public {
        require(msg.sender == _owner, "Only Voting Authority can set Stop Time");
        _end_time = end_time;
    }
    
    function isOpen() public view returns(bool) {
        return now<_end_time && now>_start_time;
    }

    function getStartTime() public view returns(uint){
        return _start_time;
    }

    function getCloseTime() public view returns(uint){
        return _end_time;
    }
}



contract VotingAppCrowdsaleDeployer {
    
    string public description;
    address public voting_app_address;


    constructor(string memory election_name) public {

        description = election_name;
        VotingAppCrowdsale vote_crowdsale = 
                new VotingAppCrowdsale(address(msg.sender), now, now + 5 minutes);
        voting_app_address = address(vote_crowdsale);
    }
}