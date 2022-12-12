/* eslint-disable camelcase */
import fs from "fs";
import { ethers, network } from "hardhat";
import path from "path";

import networkJsonFile from "../network.json";
import { InterchainSafeDeployer__factory } from "../typechain-types/factories/contracts/InterchainSafeDeployer__factory";
import { ChainId } from "../types/network";

async function main() {
  const signer = await ethers.provider.getSigner();
  const signerAddress = await signer.getAddress();
  console.log("signerAddress", signerAddress);
  const chainId = String(network.config.chainId) as ChainId;
  const InterchainSafeDeployer = new InterchainSafeDeployer__factory(signer);
  const interchainSafeDeployer = await InterchainSafeDeployer.deploy();
  await interchainSafeDeployer.deployed();
  const deployments = {
    interchainSafeDeployer: interchainSafeDeployer.address,
  };
  console.log("deployements", deployments);
  networkJsonFile[chainId].deployments = deployments;
  fs.writeFileSync(path.join(__dirname, `../network.json`), JSON.stringify(networkJsonFile));
  console.log("chainId", chainId);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
