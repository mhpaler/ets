// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "./IETSAccessControls.sol";

interface IETSTarget {
    /**
     * @dev Data structure for an ETS Target. In ETS a "Target" is anything on the internet that
     * is uniquely identifiable. Fundimentally, ETS records connections between CTAGs and Targets.
     * Every Target in ETS has a unique, uint256 ID that is a composite key of targetType and targetURI.
     * @param targetType Identifier for type of target being tagged
     * @param targetURI Unique resource identifier for tagging target
     * @param created timestamp of when target was created in ETS.
     * @param lastEnsured timestamp of when target was last ensured. Defaults to 0
     * @param status https status of last response from ensure target api eg. "404", "200". defaults to 0.
     * @param ipfsHash ipfsHash of additional metadata surrounding target provided by ETS Ensure target API.
     */
    struct Target {
        string targetType;
        string targetURI;
        uint256 created;
        uint256 lastEnsured;
        uint256 status;
        string ipfsHash;
    }

    event TargetTypeAdded(address smartContract);

    event TargetTypeRemoved(address smartContract);

    event TargetTypePauseToggled(address targetType, bool newValue);

    event TargetCreated(uint256 targetId);

    event TargetUpdated(uint256 targetId);
}
