// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "./IETSEnrichTarget.sol";
import "./IETSAccessControls.sol";

/**
 * @title IETSTarget
 * @author Ethereum Tag Service
 *
 * @notice This is the standard interface for ETS Targets. It includes both public and administration functions.
 */
interface IETSTargetType {
    /**
     * @notice Data structure for a Target Type Tagger. Target Type Tagger contracts are the interfaces through
     * which external partes may call the ETS Core tagTarget() function and thereby record a tagging record.
     * Put another way, ETS Core tagging records may only be recorded though a Target Type Tagger contract.
     *
     * Target Type Tagger contracts deployed by third-parties must be approved/activated by ETS Core dev team.
     * As it's name implies, a Target Type Tagger permits tagging of a specific target type. Target types are
     * any internet addressable artifact, entities or objects registered within ETS. See "setTargetType()" below
     * for more details.
     *
     */
    struct TargetTypeURI {
        mapping(bytes32 => bytes32) parts;
    }
}
