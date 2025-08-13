// SPDX-License-Identifier: MIT
pragma solidity ^0.8.10;

// Adapted from Cryptofin labs Array Utilities and UintArrayUtils
// https://github.com/cryptofinlabs/cryptofin-solidity/blob/master/contracts/array-utils/AddressArrayUtils.sol

library AddressArrayUtils {
    /**
     * Finds the index of the first occurrence of the given element.
     * @param A The input array to search
     * @param a The value to find
     * @return Returns (index and isIn) for the first occurrence starting from index 0
     */
    function indexOf(address[] memory A, address a) internal pure returns (uint256, bool) {
        uint256 length = A.length;
        for (uint256 i = 0; i < length; i++) {
            if (A[i] == a) {
                return (i, true);
            }
        }
        return (0, false);
    }

    /**
     * Returns true if the value is present in the list. Uses indexOf internally.
     * @param A The input array to search
     * @param a The value to find
     * @return Returns isIn for the first occurrence starting from index 0
     */
    function contains(address[] memory A, address a) internal pure returns (bool) {
        (, bool isIn) = indexOf(A, a);
        return isIn;
    }

    /**
     * Computes the difference of two arrays. Assumes there are no duplicates.
     * @param A The first array
     * @param B The second array
     * @return A - B; an array of values in A not found in B.
     */
    function difference(address[] memory A, address[] memory B) internal pure returns (address[] memory) {
        uint256 length = A.length;
        bool[] memory includeMap = new bool[](length);
        uint256 count = 0;
        // First count the new length because can't push for in-memory arrays
        for (uint256 i = 0; i < length; i++) {
            address e = A[i];
            if (!contains(B, e)) {
                includeMap[i] = true;
                count++;
            }
        }
        address[] memory newItems = new address[](count);
        uint256 j = 0;
        for (uint256 i = 0; i < length; i++) {
            if (includeMap[i]) {
                newItems[j] = A[i];
                j++;
            }
        }
        return newItems;
    }

    /**
     * Returns the intersection of two arrays. Arrays are treated as collections, so duplicates are kept.
     * @param A The first array
     * @param B The second array
     * @return The intersection of the two arrays
     */
    function intersect(address[] memory A, address[] memory B) internal pure returns (address[] memory) {
        uint256 length = A.length;
        bool[] memory includeMap = new bool[](length);
        uint256 newLength = 0;
        for (uint256 i = 0; i < length; i++) {
            if (contains(B, A[i])) {
                includeMap[i] = true;
                newLength++;
            }
        }
        address[] memory newArray = new address[](newLength);
        uint256 j = 0;
        for (uint256 i = 0; i < length; i++) {
            if (includeMap[i]) {
                newArray[j] = A[i];
                j++;
            }
        }
        return newArray;
    }

    /**
     * Returns the combination of two arrays
     * @param A The first array
     * @param B The second array
     * @return Returns A extended by B
     */
    function extend(address[] memory A, address[] memory B) internal pure returns (address[] memory) {
        uint256 aLength = A.length;
        uint256 bLength = B.length;
        address[] memory newArray = new address[](aLength + bLength);
        for (uint256 i = 0; i < aLength; i++) {
            newArray[i] = A[i];
        }
        for (uint256 i = 0; i < bLength; i++) {
            newArray[aLength + i] = B[i];
        }
        return newArray;
    }
}