import { Box, Container, Flex, HStack, Icon, Image, Link, Text, VStack } from "@chakra-ui/react";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import { FaGithub } from "react-icons/fa";

import { Head } from "@/components/Head";
import { useIsMounted } from "@/hooks/useIsMounted";

import configJsonFile from "../../../config.json";

export interface LayoutProps {
  children: React.ReactNode;
}

export const Layout: React.FC<LayoutProps> = ({ children }) => {
  const { isMounted } = useIsMounted();
  return (
    <Flex minHeight={"100vh"} direction={"column"} bgGradient="linear(to-b, gray.800, purple.800)">
      <Head />
      <Container as="section" maxW="8xl">
        <Box as="nav" py="4">
          <HStack justify="space-between" alignItems={"center"} h="12">
            <Link href="/">
              <Image src={"/assets/icon.png"} alt="logo" h="8" />
            </Link>
            <HStack spacing="4">{isMounted && <WalletMultiButton />}</HStack>
          </HStack>
        </Box>
      </Container>
      <VStack py="6" spacing={"4"}>
        <Image src={"/assets/icon.png"} w="24" alt="hero" />
        <Text color={configJsonFile.style.color.accent} fontWeight={"bold"} fontSize="xl">
          NFT Fungible Printer
        </Text>
      </VStack>
      <Container maxW="lg" flex={1}>
        {children}
      </Container>
      <Container maxW="8xl">
        <Box as="nav" py="4">
          <HStack justify={"right"}>
            <HStack spacing={"4"}>
              <Link href={configJsonFile.url.github} target={"_blank"}>
                <Icon
                  as={FaGithub}
                  aria-label="github"
                  color={configJsonFile.style.color.black.text.secondary}
                  w={6}
                  h={6}
                />
              </Link>
            </HStack>
          </HStack>
        </Box>
      </Container>
    </Flex>
  );
};
