import { Box, Button, FormControl, FormLabel, Input, Select, Stack } from "@chakra-ui/react";
import { useChainModal, useConnectModal } from "@rainbow-me/rainbowkit";
import { NextPage } from "next";

import { Layout } from "@/components/Layout";
import { Unit } from "@/components/Unit";
import { useConnected } from "@/hooks/useConnected";

import networkConfigJson from "../../../contracts/network.json";

const IssuePage: NextPage = () => {
  const { connected } = useConnected();
  const { openConnectModal } = useConnectModal();

  return (
    <Layout>
      <Unit header="Deploy SAFE with Hyperlane">
        {!connected && (
          <Box pt="2">
            <Button w="full" onClick={openConnectModal}>
              Connect Wallet
            </Button>
          </Box>
        )}
        {connected && (
          <Stack>
            <FormControl>
              <FormLabel>Source Chain</FormLabel>
              <Input disabled value={connected.networkConfig.name} fontSize="sm" />
            </FormControl>
            <FormControl>
              <FormLabel>Destination Chain</FormLabel>
              <Select fontSize="sm">
                {Object.entries(networkConfigJson)
                  .filter(([chainId]) => chainId !== connected.chainId)
                  .map(([chainId, { name }]) => {
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
            <Box pt="2">
              <Button
                w="full"
                onClick={async () => {
                  await connected.interchainSafeDeployer.deploy("", "", "");
                }}
              >
                Deploy
              </Button>
            </Box>
          </Stack>
        )}
      </Unit>
    </Layout>
  );
};

export default IssuePage;
