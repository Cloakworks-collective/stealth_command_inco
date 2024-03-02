//SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "fhevm/lib/TFHE.sol";

/**
 * Abstraction for Zero-Knowledge AutoBattler Game
 */
abstract contract IAutoBattler {
    /// EVENTS ///

    event CityBuilt(address _by, uint256 _nonce);
    event DefenseSet(address _defender);
    event Battle(address _winner, uint256 _nonce);

    /// ENUMS ///

    enum CityStatus {
        NoStatus,
        NoDefenseSet,
        DefenseSet,
        Destroyed,
        Defended
    }

    /// STRUCTS ///

    /* 
    * uint32 is the max value that can be encrypted with FHE
    */
    struct Army {
        uint32 infantry; 
        uint32 artillery;
        uint32 tanks;
    }


    struct EncryptedArmy {
        euint32 infantry;
        euint32 artillery;
        euint32 tanks;
    }

    struct City {
        string name;
        EncryptedArmy defense;
        CityStatus cityStatus;
        uint256 points;
        uint256 lastAttackedAt; 
        uint256 lastDefendedAt;
    }

    struct GameRecord {
        uint256 numberOfBattles;
        uint256 numberOfCities;
        mapping(address => City) players;
    }

    /// VARIABLES ///
    GameRecord public gameRecord;

    /// MODIFIERS ///

    modifier isPlayer() {
        require(gameRecord.players[msg.sender].cityStatus != CityStatus.NoStatus, "Player not found");
        _;
        
    }

    modifier isNotPlayer() {
        require(gameRecord.players[msg.sender].cityStatus == CityStatus.NoStatus, "Player already exists");
        _;
    }

    modifier canBeAttacked(address _defender) {
        require(gameRecord.players[_defender].cityStatus == CityStatus.DefenseSet, "Player cannot be attacked");
        _;
        
    }

    /// FUNCTIONS ///

    function buildCity(
        string calldata _name,
        bytes calldata _encryptedInfantry,
        bytes calldata _encryptedTanks,
        bytes calldata _encryptedArtillery
    ) 
    public virtual;

    function setDefense(
        bytes calldata _encryptedInfantry,
        bytes calldata _encryptedTanks,
        bytes calldata _encryptedArtillery
        ) 
    public virtual;

    function attack(
        address _defender, 
        uint32 _infantry,
        uint32 _tanks,
        uint32 _artillery
    ) public virtual;

    function playerState(address _player) 
    public view virtual returns (
        CityStatus cityStatus,
        uint256 points,
        uint256 lastAttackedAt,
        uint256 lastDefendedAt
    );

}    