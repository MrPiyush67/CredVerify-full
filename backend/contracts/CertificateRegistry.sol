// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

contract CertificateRegistry {
    address public owner;

    struct Record {
        string cid;
        address ownerAddress;
        uint256 timestamp;
    }

    mapping(bytes32 => Record) public records;

    event Registered(bytes32 indexed fingerprint, string cid, address indexed owner, uint256 timestamp);

    modifier onlyOwner() {
        require(msg.sender == owner, "Caller is not owner");
        _;
    }

    constructor() {
        owner = msg.sender;
    }

    function register(bytes32 fingerprint, string calldata cid) external onlyOwner {
        records[fingerprint] = Record({ cid: cid, ownerAddress: msg.sender, timestamp: block.timestamp });
        emit Registered(fingerprint, cid, msg.sender, block.timestamp);
    }

    function getRecord(bytes32 fingerprint) external view returns (string memory cid, address ownerAddress, uint256 timestamp) {
        Record storage r = records[fingerprint];
        return (r.cid, r.ownerAddress, r.timestamp);
    }
}
