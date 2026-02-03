// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title Proxy
 * @dev UUPS (Universal Upgradeable Proxy Standard) Proxy Contract
 * 
 * This proxy uses delegatecall to forward all calls to the implementation contract.
 * The key concepts demonstrated:
 * 1. delegatecall - Executes code in the context of the proxy (storage stays in proxy)
 * 2. Assembly code - Low-level operations for efficiency and control
 * 3. Storage slot pattern - Implementation address stored in specific slot
 * 
 * Storage Layout:
 * - Slot 0: implementation address (to avoid storage collision)
 */
contract Proxy {
    /**
     * @dev Storage slot with the address of the current implementation.
     * This is the keccak-256 hash of "eip1967.proxy.implementation" subtracted by 1
     * Following EIP-1967 standard to avoid storage collision
     */
    bytes32 private constant IMPLEMENTATION_SLOT = 
        0x360894a13ba1a3210667c828492db98dca3e2076cc3735a920a3ca505d382bbc;

    /**
     * @dev Storage slot for the admin/owner of the proxy
     * This is the keccak-256 hash of "eip1967.proxy.admin" subtracted by 1
     */
    bytes32 private constant ADMIN_SLOT = 
        0xb53127684a568b3173ae13b9f8a6016e243e63b6e8ee1178d6a717850b5d6103;

    /**
     * @dev Emitted when the implementation is upgraded.
     */
    event Upgraded(address indexed implementation);
    
    /**
     * @dev Emitted when the admin is changed.
     */
    event AdminChanged(address indexed previousAdmin, address indexed newAdmin);

    /**
     * @dev Initializes the proxy with an implementation contract.
     * @param implementation Address of the implementation contract
     * @param data Calldata for initialization function
     * @param admin Address of the proxy admin (who can upgrade)
     */
    constructor(address implementation, bytes memory data, address admin) {
        // Store implementation address in the designated storage slot
        assembly {
            sstore(IMPLEMENTATION_SLOT, implementation)
            sstore(ADMIN_SLOT, admin)
        }
        
        // If data is provided, call the implementation's initialize function
        if (data.length > 0) {
            (bool success, ) = implementation.delegatecall(data);
            require(success, "Proxy: initialization failed");
        }
        
        emit Upgraded(implementation);
        emit AdminChanged(address(0), admin);
    }

    /**
     * @dev Returns the current implementation address.
     * Uses assembly to read from the storage slot
     */
    function getImplementation() public view returns (address) {
        address implementation;
        assembly {
            implementation := sload(IMPLEMENTATION_SLOT)
        }
        return implementation;
    }

    /**
     * @dev Returns the current admin address.
     * Uses assembly to read from the storage slot
     */
    function getAdmin() public view returns (address) {
        address admin;
        assembly {
            admin := sload(ADMIN_SLOT)
        }
        return admin;
    }

    /**
     * @dev Modifier to check if caller is admin
     */
    modifier onlyAdmin() {
        require(msg.sender == getAdmin(), "Proxy: caller is not the admin");
        _;
    }

    /**
     * @dev Upgrades the proxy to a new implementation.
     * Only the admin can upgrade.
     * 
     * @param newImplementation Address of the new implementation contract
     */
    function upgradeTo(address newImplementation) public onlyAdmin {
        address currentImplementation = getImplementation();
        require(
            newImplementation != address(0),
            "Proxy: new implementation is zero address"
        );
        require(
            newImplementation != currentImplementation,
            "Proxy: new implementation is the same as current"
        );

        // Store new implementation address using assembly
        assembly {
            sstore(IMPLEMENTATION_SLOT, newImplementation)
        }

        emit Upgraded(newImplementation);
    }
    
    /**
     * @dev Changes the admin of the proxy.
     * Only the current admin can change the admin.
     * 
     * @param newAdmin Address of the new admin
     */
    function changeAdmin(address newAdmin) public onlyAdmin {
        require(newAdmin != address(0), "Proxy: new admin is zero address");
        address previousAdmin = getAdmin();
        
        assembly {
            sstore(ADMIN_SLOT, newAdmin)
        }
        
        emit AdminChanged(previousAdmin, newAdmin);
    }

    /**
     * @dev Fallback function that delegates all calls to the implementation.
     * 
     * This is the core of the proxy pattern:
     * - Uses delegatecall to execute implementation code in proxy's context
     * - All storage reads/writes happen in the proxy contract
     * - msg.sender and msg.value are preserved
     * 
     * Assembly is used for:
     * 1. Loading the implementation address from storage
     * 2. Performing the delegatecall
     * 3. Handling return data
     * 4. Reverting with proper error messages
     */
    fallback() external payable {
        address implementation = getImplementation();
        
        assembly {
            // Copy calldata to memory
            calldatacopy(0, 0, calldatasize())
            
            // Delegatecall to implementation
            // delegatecall(gas, address, argsOffset, argsSize, retOffset, retSize)
            let result := delegatecall(
                gas(),
                implementation,
                0,
                calldatasize(),
                0,
                0
            )
            
            // Copy return data
            returndatacopy(0, 0, returndatasize())
            
            // Revert if delegatecall failed
            switch result
            case 0 {
                revert(0, returndatasize())
            }
            default {
                return(0, returndatasize())
            }
        }
    }

    /**
     * @dev Receive function for receiving Ether
     */
    receive() external payable {
        // Delegate to fallback
    }
}
