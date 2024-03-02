import { ethers } from "hardhat";

import type { AutoBattler } from "../../types";
import { getSigners } from "../signers";

export async function deployAutoBattlerFixture(): Promise<AutoBattler> {
  const signers = await getSigners(ethers);

  const contractFactory = await ethers.getContractFactory("AutoBattler");
  const contract = await contractFactory.connect(signers.alice).deploy();
  await contract.waitForDeployment();

  return contract;
}
