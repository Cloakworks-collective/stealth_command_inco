import { expect } from "chai";
import { ethers } from "hardhat";

import { createInstances } from "../instance";
import { getSigners } from "../signers";
import { createTransaction } from "../utils";
import { deployAutoBattlerFixture } from "./AutoBattler.fixture";

describe("AutoBattler", function () {
  before(async function () {
    this.signers = await getSigners(ethers);
  });

  beforeEach(async function () {
    const contract = await deployAutoBattlerFixture();
    this.contractAddress = await contract.getAddress();
    this.autobattler = contract;
    this.instances = await createInstances(this.contractAddress, ethers, this.signers);
  });

  it("can build a city", async function () {

    const encryptedInfantry = this.instances.alice.encrypt32(10);
    const encryptedTanks = this.instances.alice.encrypt32(10);
    const encryptedArtillery = this.instances.alice.encrypt32(10);


    await this.autobattler.connect(this.signers.alice).buildCity(
        "Avalon", 
        encryptedInfantry, 
        encryptedTanks, 
        encryptedArtillery
    );

    //  Check if the city was built
    const gameRecord = await this.autobattler.gameRecord();
    expect(gameRecord.numberOfCities === BigInt(1));
    expect(gameRecord.numberOfBattles === BigInt(0));

    const playerState = await this.autobattler.playerState(this.signers.alice);
    expect(playerState.points === BigInt(0));
    expect(playerState.cityStatus === BigInt(1));
  });

  it("should compute correct winner in battles", async function () {

    // build defender (alice) city with 10 units of each type
    let encryptedInfantry = this.instances.alice.encrypt32(10);
    let encryptedTanks = this.instances.alice.encrypt32(10);
    let encryptedArtillery = this.instances.alice.encrypt32(10);


    await this.autobattler.connect(this.signers.alice).buildCity(
        "Avalon", 
        encryptedInfantry, 
        encryptedTanks, 
        encryptedArtillery
    );

     // build attacker (bob) city with 10 units of each type
    encryptedInfantry = this.instances.bob.encrypt32(10);
    encryptedTanks = this.instances.bob.encrypt32(10);
    encryptedArtillery = this.instances.bob.encrypt32(10);
 
 
     await this.autobattler.connect(this.signers.bob).buildCity(
         "Thebes", 
         encryptedInfantry, 
         encryptedTanks, 
         encryptedArtillery
     );
     
     // we have 2 cities now
     const gameRecord = await this.autobattler.gameRecord();
    expect(gameRecord.numberOfCities === BigInt(2));

    // bob attacks alice - bob should win
    const attackingInfantry = 20;
    const attackingTanks = 20;
    const attackingArtillery = 20;

    await this.autobattler.connect(this.signers.bob).attack(
        this.signers.alice,
        attackingInfantry,
        attackingTanks,
        attackingArtillery
    );

    // check if the battle was recorded
    expect(gameRecord.numberOfBattles === BigInt(1));

    // check if bob won
    const bobState = await this.autobattler.playerState(this.signers.bob);
    expect(bobState.points === BigInt(1));

    // check if alice lost
    const aliceState = await this.autobattler.playerState(this.signers.alice);
    expect(aliceState.points === BigInt(0));
  });
});
