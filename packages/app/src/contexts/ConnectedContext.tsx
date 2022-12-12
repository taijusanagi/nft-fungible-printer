/* eslint-disable camelcase */
import { ethers } from "ethers";
import { createContext, useEffect, useState } from "react";
import { useAccount, useNetwork, useSigner } from "wagmi";

import { ICA_ROUTER_ADDRESS, SAFE_FACTORY_ADDRESS, SAFE_IMPLEMENTATION_ADDRESS } from "../../../contracts/config";
import networkJsonFile from "../../../contracts/network.json";
import {
  IGnosisSafe,
  IGnosisSafe__factory,
  IGnosisSafeProxyFactory,
  IGnosisSafeProxyFactory__factory,
  IInterchainAccountRouter,
  IInterchainAccountRouter__factory,
} from "../../../contracts/typechain-types";
import { ChainId, isChainId, NetworkConfig } from "../../../contracts/types/network";

export interface ConnectedContextValue {
  chainId: ChainId;
  provider: ethers.providers.Provider;
  signer: ethers.Signer;
  signerAddress: string;
  networkConfig: NetworkConfig;
  interchainAccountRouter: IInterchainAccountRouter;
  gnosisSafeProxyFactory: IGnosisSafeProxyFactory;
  gnosisSafe: IGnosisSafe;
}

export interface ConnectedContext {
  connected?: ConnectedContextValue;
}

export const defaultConnectedContextValue = {};

export const ConnectedContext = createContext<ConnectedContext>(defaultConnectedContextValue);

export interface ConnectedContextProviderProps {
  children: React.ReactNode;
}

export const ConnectedContextProvider: React.FC<ConnectedContextProviderProps> = ({ children }) => {
  const { chain } = useNetwork();
  const { data: signer } = useSigner();
  const { address } = useAccount();
  const [connected, setConnected] = useState<ConnectedContextValue>();
  useEffect(() => {
    (async () => {
      if (!chain || !signer || !signer.provider || !address) {
        setConnected(undefined);
        return;
      }
      const chainId = String(chain.id);
      if (!isChainId(chainId)) {
        return;
      }
      const provider = signer.provider;
      const networkConfig = networkJsonFile[chainId];
      const signerAddress = address;
      const interchainAccountRouter = IInterchainAccountRouter__factory.connect(ICA_ROUTER_ADDRESS, signer);
      const gnosisSafeProxyFactory = IGnosisSafeProxyFactory__factory.connect(SAFE_FACTORY_ADDRESS, signer);
      const gnosisSafe = IGnosisSafe__factory.connect(SAFE_IMPLEMENTATION_ADDRESS, signer);

      setConnected({
        chainId,
        provider,
        signer,
        signerAddress,
        networkConfig,
        interchainAccountRouter,
        gnosisSafeProxyFactory,
        gnosisSafe,
      });
    })();
  }, [chain, signer, address]);
  return <ConnectedContext.Provider value={{ connected }}>{children}</ConnectedContext.Provider>;
};
