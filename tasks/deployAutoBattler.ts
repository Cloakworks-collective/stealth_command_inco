import { task } from "hardhat/config";
import type { TaskArguments } from "hardhat/types";

import { getSigners } from "../test/signers";

task("task:AutoBattler").setAction(async function (taskArguments: TaskArguments, { ethers }) {
  const signers = await getSigners(ethers);
  const autoBattlerFactory = await ethers.getContractFactory("AutoBattler");
  const autobattler = await autoBattlerFactory.connect(signers.alice).deploy();
  await autobattler.waitForDeployment();
  console.log("AutoBattler deployed to: ", await autobattler.getAddress());
});