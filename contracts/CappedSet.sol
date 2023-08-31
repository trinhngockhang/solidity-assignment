// SPDX-License-Identifier: GPL-3.0

pragma solidity ^0.8.9;

import "./BokkyPooBahsRedBlackTreeLibrary.sol";

/**
 * @title Capped set contract
 * @dev Store & retrieve uint by address
 */
contract CappedSet {
    using BokkyPooBahsRedBlackTreeLibrary for BokkyPooBahsRedBlackTreeLibrary.Tree;

    BokkyPooBahsRedBlackTreeLibrary.Tree tree;
    
    /// @dev Use this var to save address with min Value so we don't have to query in the tree each time find lowest value.
    address private minAddress;


    /// @dev Maximum number of elements that set can save
    uint256 public maxLength;
    /// @dev Current length of set
    uint256 private counter;

    // Use for testing
    event LowestItem(address indexed addr, uint256 indexed value);

    /// @dev Constructor of contract, init maxLength, counter and set maximum number
    /// @param numElements maximum number of element
    constructor(uint256 numElements) {
        require(numElements > 0, "max length of set must greater than 0");
        maxLength = numElements;
        counter = 0;
    }

    /// @dev get value by passing address
    /// @param addr address need to query value
    function getValueByAddress(address addr) external view returns (uint256) {
        require(tree.exists(addr), "Can not query non-existed address");
        (, , , , , uint256 value) = tree.getNode(addr);
        return value;
    }

    /// @dev insert key-value (address-uint) to the set
    /// @param addr address need to insert
    /// @param value value of address
    /// @return newLowestAddress address that has lowest value
    /// @return newLowestValue lowest value
    function insert(
        address addr,
        uint256 value
    ) public returns (address newLowestAddress, uint256 newLowestValue) {
        require(!tree.exists(addr), "Can not add existed address");
        tree.insert(addr, value);
        counter++;

        // First element
        if (counter == 1) {
            emit LowestItem(address(0), 0);
            minAddress = addr;
            return (address(0), 0);
        }

        // If we need to update current MinAddress cached.
        (, , , , , uint currentMinValue) = tree.getNode(minAddress);
        if (value < currentMinValue) {
            minAddress = addr;
        }

        // Remove min Address if size is over
        if (counter > maxLength) {
            tree.remove(minAddress);
            counter--;
            // Need to update min Address
            minAddress = tree.treeMinimum(tree.root);
        }

        (, , , , , uint minValue) = tree.getNode(minAddress);

        emit LowestItem(minAddress, minValue);
        return (minAddress, minValue);
    }

    /// @dev update value by key
    /// @param addr address need to insert
    /// @param newVal new value of address
    /// @return newLowestAddress address that has lowest value
    /// @return newLowestValue lowest value
    function update(
        address addr,
        uint256 newVal
    ) public returns (address newLowestAddress, uint256 newLowestValue) {
        require(tree.exists(addr), "Can not update non-existed address");
        tree.remove(addr);
        tree.insert(addr, newVal);

        // If we need to update current MinAddress cached.
        (, , , , , uint currentMinValue) = tree.getNode(minAddress);
        if (newVal < currentMinValue) {
            minAddress = addr;
        }

        // If we update current min Address, update new min value address
        if(addr == minAddress) {
            minAddress = tree.treeMinimum(tree.root);
        }

        (, , , , , uint minValue) = tree.getNode(minAddress);

        emit LowestItem(minAddress, minValue);
        return (minAddress, minValue);
    }

    /// @dev remove value by key
    /// @param addr address need remove
    /// @return newLowestAddress address that has lowest value
    /// @return newLowestValue lowest value
    function remove(
        address addr
    ) public returns (address newLowestAddress, uint256 newLowestValue) {
        require(tree.exists(addr), "Can not remove non-existed address");
        tree.remove(addr);
        counter--;
        // If remove last node
        if(counter == 0) {
            emit LowestItem(address(0), 0);
            minAddress = address(0);
            return (address(0), 0);
        }
        // Update new adress with min value
        if (addr == minAddress && counter > 0) {
            minAddress = tree.treeMinimum(tree.root);
        }
        (, , , , , uint minValue) = tree.getNode(minAddress);

        emit LowestItem(minAddress, minValue);
        return (minAddress, minValue);
    }
}
