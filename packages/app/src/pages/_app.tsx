import "@fontsource/inter/variable.css";
import "@solana/wallet-adapter-react-ui/styles.css";

import { ChakraProvider } from "@chakra-ui/react";
import { WalletModalProvider } from "@solana/wallet-adapter-react-ui";
import { ThirdwebProvider } from "@thirdweb-dev/react/solana";
import { Network } from "@thirdweb-dev/sdk/solana";
import { AppProps } from "next/app";

import { myChakraUITheme } from "@/lib/theme";

const network: Network = "devnet";

const MyApp = ({ Component, pageProps }: AppProps) => {
  return (
    <ThirdwebProvider network={network}>
      <WalletModalProvider>
        <ChakraProvider resetCSS theme={myChakraUITheme}>
          <Component {...pageProps} />
        </ChakraProvider>
      </WalletModalProvider>
    </ThirdwebProvider>
  );
};

export default MyApp;
