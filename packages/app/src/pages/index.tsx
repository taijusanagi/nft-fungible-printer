import { Button, FormControl, FormLabel, Input, Link, Select, Stack, Text, useDisclosure } from "@chakra-ui/react";
import { useConnectModal } from "@rainbow-me/rainbowkit";
import crypto from "crypto";
import { ethers } from "ethers";
import { NextPage } from "next";
import { useMemo, useState } from "react";

import { Layout } from "@/components/Layout";
import { Modal } from "@/components/Modal";
import { Unit } from "@/components/Unit";
import { useConnected } from "@/hooks/useConnected";
import { useErrorHandler } from "@/hooks/useErrorHandler";

import {
  HYPERLANE_EXPROLER_URI_BASE,
  SAFE_FACTORY_ADDRESS,
  SAFE_IMPLEMENTATION_ADDRESS,
} from "../../../contracts/config";
import networkJsonFile from "../../../contracts/network.json";
import { ChainId } from "../../../contracts/types/network";
import configJsonFile from "../../config.json";

const IssuePage: NextPage = () => {
  const { connected } = useConnected();
  const { openConnectModal } = useConnectModal();
  const confirmModalDisclosure = useDisclosure();

  const [destinationChainId, setDestinationChainId] = useState<ChainId>();
  const [isProcessing, setIsProcessing] = useState(false);
  const [txHash, setTxHash] = useState("");

  const { handle } = useErrorHandler();

  const clear = () => {
    confirmModalDisclosure.onClose();
    setIsProcessing(false);
    setTxHash("");
  };

  const filteredDestinationNetwork = useMemo(() => {
    if (!connected) {
      return [];
    }
    return Object.entries(networkJsonFile).filter(([chainId]) => chainId !== connected.chainId);
  }, [connected]);

  return (
    <Layout>
      <Unit header="Deploy SAFE with Hyperlane">
        {!connected && (
          <Button w="full" onClick={openConnectModal}>
            Connect Wallet
          </Button>
        )}
        {connected && (
          <Stack>
            <FormControl>
              <FormLabel>Source Chain</FormLabel>
              <Input disabled value={connected.networkConfig.name} fontSize="sm" />
            </FormControl>
            <FormControl>
              <FormLabel>Destination Chain</FormLabel>
              <Select fontSize="sm" onChange={(e) => setDestinationChainId(e.target.value as ChainId)}>
                {filteredDestinationNetwork.map(([chainId, { name }]) => {
                  return (
                    <option key={chainId} value={chainId}>
                      {name}
                    </option>
                  );
                })}
              </Select>
            </FormControl>
            <FormControl>
              <FormLabel>Owner</FormLabel>
              <Input disabled value={connected.signerAddress} fontSize="xs" />
            </FormControl>
            <Button
              w="full"
              isLoading={isProcessing}
              onClick={async () => {
                try {
                  setIsProcessing(true);
                  let destinationDomainId;
                  if (!destinationChainId) {
                    destinationDomainId = filteredDestinationNetwork[0][1].domainId;
                  } else {
                    destinationDomainId = networkJsonFile[destinationChainId].domainId;
                  }
                  const initializer = connected.gnosisSafe.interface.encodeFunctionData("setup", [
                    [connected.signerAddress],
                    1,
                    ethers.constants.AddressZero,
                    "0x",
                    ethers.constants.AddressZero,
                    ethers.constants.AddressZero,
                    0,
                    ethers.constants.AddressZero,
                  ]);
                  const nonce = crypto.randomBytes(32); // just rondom bytes to avoid conflict
                  const data = connected.gnosisSafeProxyFactory.interface.encodeFunctionData("createProxyWithNonce", [
                    SAFE_IMPLEMENTATION_ADDRESS,
                    initializer,
                    nonce,
                  ]);
                  const tx = await connected.interchainAccountRouter.dispatch(
                    destinationDomainId,
                    SAFE_FACTORY_ADDRESS,
                    data
                  );
                  setTxHash(`${tx.hash}`);
                  confirmModalDisclosure.onOpen();
                } catch (e) {
                  handle(e);
                } finally {
                  setIsProcessing(false);
                }
              }}
            >
              Deploy
            </Button>
            <Modal header="Deployment Detail" onClose={clear} isOpen={confirmModalDisclosure.isOpen}>
              <Stack spacing="4">
                <Stack spacing="1">
                  <Text fontSize="sm" fontWeight={"bold"} color={configJsonFile.style.color.black.text.secondary}>
                    Track Tx on Exproler
                  </Text>
                  <Text fontSize="sm">
                    <Link
                      href={`${connected.networkConfig.explorer.url}/tx/${txHash}`}
                      color={configJsonFile.style.color.link}
                      target="_blank"
                    >
                      {`${connected.networkConfig.explorer.url}/tx/${txHash}`}
                    </Link>
                  </Text>
                </Stack>
                <Stack spacing="1">
                  <Text fontSize="sm" fontWeight={"bold"} color={configJsonFile.style.color.black.text.secondary}>
                    Track Tx on Hyperlane
                  </Text>
                  <Text fontSize="sm">
                    <Link
                      href={`${HYPERLANE_EXPROLER_URI_BASE}/?search=${txHash}`}
                      color={configJsonFile.style.color.link}
                      target="_blank"
                    >
                      {`${HYPERLANE_EXPROLER_URI_BASE}/?search=${txHash}`}
                    </Link>
                  </Text>
                </Stack>
              </Stack>
            </Modal>
          </Stack>
        )}
      </Unit>
    </Layout>
  );
};

export default IssuePage;
