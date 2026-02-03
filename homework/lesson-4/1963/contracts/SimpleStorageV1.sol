// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title SimpleStorageV1
 * @dev Version 1 of an upgradeable storage contract
 * 
 * This contract demonstrates upgradeable contract pattern with:
 * - Storage variables that will be preserved during upgrades
 * - Functions that can be called through the proxy via delegatecall
 * 
 * IMPORTANT: Storage layout must be compatible between versions!
 * - Storage variables are stored in the PROXY contract (via delegatecall)
 * - Order of storage variables matters
 * - New variables can only be added at the end
 */
contract SimpleStorageV1 {
    // Storage variables - order matters for upgrade compatibility!
    // These are stored in the Proxy contract's storage
    uint256 public storedValue;
    string public storedString;
    address public owner;
    uint8 public version; // Version tracking
    
    // Events
    event ValueUpdated(uint256 newValue);
    event StringUpdated(string newString);
    event OwnershipTransferred(address indexed previousOwner, address indexed newOwner);
    
    /**
     * @dev Modifier to check if caller is owner
     */
    modifier onlyOwner() {
        require(msg.sender == owner, "SimpleStorageV1: caller is not the owner");
        _;
    }
    
    /**
     * @dev Initializer function (replaces constructor in upgradeable contracts)
     * This is called via delegatecall from the Proxy constructor
     * 
     * @param _initialValue Initial value to store
     * @param _initialString Initial string to store
     */
    function initialize(uint256 _initialValue, string memory _initialString) public {
        require(owner == address(0), "SimpleStorageV1: already initialized");
        storedValue = _initialValue;
        storedString = _initialString;
        owner = msg.sender;
        version = 1;
        emit OwnershipTransferred(address(0), msg.sender);
    }
    
    /**
     * @dev Set a new value
     * @param _value New value to store
     */
    function setValue(uint256 _value) public {
        storedValue = _value;
        emit ValueUpdated(_value);
    }
    
    /**
     * @dev Set a new string
     * @param _string New string to store
     */
    function setString(string memory _string) public {
        storedString = _string;
        emit StringUpdated(_string);
    }
    
    /**
     * @dev Get the stored value
     * @return The stored uint256 value
     */
    function getValue() public view returns (uint256) {
        return storedValue;
    }
    
    /**
     * @dev Get the stored string
     * @return The stored string value
     */
    function getString() public view returns (string memory) {
        return storedString;
    }
    
    /**
     * @dev Get the contract version
     * @return The version number
     */
    function getVersion() public view returns (uint8) {
        return version;
    }
    
    /**
     * @dev Transfer ownership to a new address
     * @param newOwner Address of the new owner
     */
    function transferOwnership(address newOwner) public onlyOwner {
        require(newOwner != address(0), "SimpleStorageV1: new owner is zero address");
        emit OwnershipTransferred(owner, newOwner);
        owner = newOwner;
    }
}
