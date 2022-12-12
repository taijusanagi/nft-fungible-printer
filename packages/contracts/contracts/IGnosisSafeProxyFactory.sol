// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

interface IGnosisSafeProxyFactory {
  function createProxyWithNonce(
    address _singleton,
    bytes memory initializer,
    uint256 saltNonce
  ) external returns (address proxy);

  function calculateCreateProxyWithNonceAddress(
    address _singleton,
    bytes calldata initializer,
    uint256 saltNonce
  ) external returns (address proxy);
}
