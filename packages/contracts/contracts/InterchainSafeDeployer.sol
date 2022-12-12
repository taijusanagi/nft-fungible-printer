// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

contract InterchainSafeDeployer {
  // this allows calling other contracts than SAFE
  // we keep contract as simple as possible for simple development and demo for this hackathon
  // recipientAddress = should be SAFE deployer at destination chain
  // messageBody = should be owners of deployed SAFE
  function deploy(uint32 destinationDomain, address recipientAddress, bytes memory messageBody) public {}
}
