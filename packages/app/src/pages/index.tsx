import { Button, FormControl, FormLabel, HStack, Image, Input, Stack, Text, useDisclosure } from "@chakra-ui/react";
import { useSDK } from "@thirdweb-dev/react/solana";
// import { useSDK } from "@thirdweb-dev/react";
import { NextPage } from "next";
import { useState } from "react";

import { Layout } from "@/components/Layout";
import { Modal } from "@/components/Modal";
import { Step, useStep } from "@/components/Step";
import { Unit } from "@/components/Unit";
import { useErrorHandler } from "@/hooks/useErrorHandler";

import configFileJson from "../../config.json";

export interface Creator {
  address: string;
  share: number;
}

export interface Metadata {
  image: string;
  name: string;
  symbol: string;
}

const HomePage: NextPage = () => {
  const [contractAddress, setContractAddress] = useState("9pndRKmnm4w1VrVuayN6ZYKvC6oex6riyU9i2KRht6HW");
  const [tokenId, setTokenId] = useState("3AZdsgg2cx5DL5SBTLPg3ToB8CBKVTrSuPBySKW78fx6");
  const [creators, setCreators] = useState<Creator[]>([]);
  const [metadata, setMetadata] = useState<Metadata>();
  const [share, setShare] = useState(20);
  const [amount, setAmount] = useState(10);
  const [userAddress, setUserAddress] = useState("");

  const [modalMode, setModalMode] = useState<"preview" | "step">("preview");
  const modalDisclosure = useDisclosure();

  const [isLoadingPreview, setIsLoadingPreview] = useState(false);

  const sdk = useSDK();

  const steps = [
    {
      title: "Create collection",
      description: "Creating fundible copy collections",
    },
    {
      title: "Mint NFT",
      description: "Mint NFT in created collection",
    },
    {
      title: "Mint additional supply",
      description: "Mint additional supply for minted NFT",
    },
    {
      title: "Check in thirdweb dashboard",
      description: "Minted NFT can be checked in thirdweb dashboard",
    },
  ];

  const [currentStep, isTxProcessing, { setStep, setIsProcessing }] = useStep({
    maxStep: steps.length,
    initialStep: 0,
  });

  const { handle } = useErrorHandler();

  const clear = () => {
    modalDisclosure.onClose();
    setIsLoadingPreview(false);
    setIsProcessing(false);
    setCreators([]);
    setMetadata(undefined);
    setModalMode("preview");
    setStep(0);
  };

  return (
    <Layout>
      <Unit header="Create NFT Fundible Copy">
        <Stack>
          <FormControl>
            <FormLabel color={configFileJson.style.color.black.text.secondary}>Contract Address</FormLabel>
            <Input fontSize="xs" value={contractAddress} onChange={(e) => setContractAddress(e.target.value)} />
          </FormControl>
          <FormControl>
            <FormLabel color={configFileJson.style.color.black.text.secondary}>Token ID</FormLabel>
            <Input fontSize="xs" value={tokenId} onChange={(e) => setTokenId(e.target.value)} />
          </FormControl>
          <FormControl>
            <FormLabel color={configFileJson.style.color.black.text.secondary}>Your Share (%)</FormLabel>
            <Input fontSize="xs" value={share} onChange={(e) => setShare(Number(e.target.value))} />
          </FormControl>
          <FormControl>
            <FormLabel color={configFileJson.style.color.black.text.secondary}>Amount</FormLabel>
            <Input fontSize="xs" value={amount} onChange={(e) => setAmount(Number(e.target.value))} />
          </FormControl>
          <Button
            w="full"
            disabled={!sdk}
            isLoading={isLoadingPreview}
            onClick={async () => {
              try {
                if (!sdk) {
                  return;
                }
                setIsLoadingPreview(true);
                console.log("contractAddress", contractAddress);
                const program = await sdk.getProgram(contractAddress, "nft-collection");

                const userAddress = sdk.wallet.getAddress();
                if (!userAddress) {
                  throw new Error("User address not defined");
                }
                console.log("userAddress", userAddress);
                setUserAddress(userAddress);

                const { owner, metadata } = await program.get(tokenId);
                if (!metadata) {
                  throw new Error("Metadata not defined in original NFT");
                }
                if (owner !== userAddress) {
                  throw new Error("You don't own the NFT");
                }
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                setMetadata(metadata as any);
                console.log("Fetched NFT metadata", metadata);

                const creators = await program.getCreators();
                if (creators.length > 1) {
                  throw new Error("Multiple creator is not supported yet");
                }
                setCreators(creators);
                console.log("Fetched NFT creators", creators);

                console.log("Open modal");
                modalDisclosure.onOpen();
              } catch (e) {
                handle(e);
                clear();
              } finally {
                setIsLoadingPreview(false);
              }
            }}
          >
            Preview
          </Button>
          <Modal header="Preview" isOpen={modalDisclosure.isOpen} onClose={clear}>
            {sdk && metadata && creators.length > 0 && (
              <>
                {modalMode === "preview" && (
                  <Stack spacing="4">
                    <Stack>
                      <Stack spacing="1">
                        <Text fontSize="sm" fontWeight={"bold"} color={configFileJson.style.color.black.text.secondary}>
                          Name
                        </Text>
                        <Text fontSize="sm" color={configFileJson.style.color.black.text.secondary}>
                          {metadata.name}
                        </Text>
                      </Stack>
                      <Stack spacing="1">
                        <Text fontSize="sm" fontWeight={"bold"} color={configFileJson.style.color.black.text.secondary}>
                          Image
                        </Text>
                        <HStack justify={"center"}>
                          <Image src={metadata.image} alt={"image"} w="40" />
                        </HStack>
                      </Stack>
                    </Stack>
                    <Stack>
                      <Text fontSize="sm" fontWeight={"bold"} color={configFileJson.style.color.black.text.secondary}>
                        Royalty Share
                      </Text>
                      <Stack spacing="1">
                        <Text fontSize="x-small">Share: {creators[0].share - share} %</Text>
                        <Text fontSize="x-small">Address: {creators[0].address}</Text>
                      </Stack>
                      <Stack spacing="1">
                        <Text fontSize="x-small">Share: {share} %</Text>
                        <Text fontSize="x-small">Address: {userAddress}</Text>
                      </Stack>
                    </Stack>
                    <Stack spacing="1">
                      <Text fontSize="sm" fontWeight={"bold"} color={configFileJson.style.color.black.text.secondary}>
                        Amount
                      </Text>
                      <Text fontSize="sm" color={configFileJson.style.color.black.text.secondary}>
                        {amount}
                      </Text>
                    </Stack>
                    <Button
                      w="full"
                      onClick={async () => {
                        try {
                          setModalMode("step");
                          setIsProcessing(true);
                          setStep(0);
                          setIsProcessing(true);
                          const createdCollection = await sdk.deployer.createNftCollection({
                            name: `Fungible Copy of ${metadata.name}`,
                            symbol: "FC",
                            image: metadata.image,
                            creators: [
                              { address: creators[0].address, share: creators[0].share - share },
                              { address: userAddress, share },
                            ],
                          });
                          setIsProcessing(false);
                          console.log("createdCollection", createdCollection);

                          const program = await sdk.getProgram(createdCollection, "nft-collection");
                          setStep(1);
                          setIsProcessing(true);
                          const nftAddress = await program.mint({
                            ...metadata,
                            name: `Fungible Copy of ${metadata.name}`,
                          });
                          setIsProcessing(false);
                          console.log("nftAddress", nftAddress);
                          setStep(2);
                          setIsProcessing(true);
                          await program.mintAdditionalSupply(nftAddress, amount);
                          setStep(3);
                          setIsProcessing(false);
                          console.log("done");
                        } catch (e) {
                          handle(e);
                          clear();
                        }
                      }}
                    >
                      Create Fungible Copy
                    </Button>
                  </Stack>
                )}
                {modalMode === "step" && (
                  <>
                    {steps.map((step, id) => (
                      <Step
                        key={id}
                        cursor="pointer"
                        onClick={() => setStep(id)}
                        title={step.title}
                        description={step.description}
                        isActive={currentStep === id}
                        isCompleted={currentStep > id}
                        isProcessing={isTxProcessing}
                        isLastStep={steps.length === id + 1}
                      />
                    ))}
                  </>
                )}
              </>
            )}
          </Modal>
        </Stack>
      </Unit>
    </Layout>
  );
};

export default HomePage;
