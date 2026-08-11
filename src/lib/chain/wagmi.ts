import { http, createConfig } from "wagmi";
import { injected } from "wagmi/connectors";
import { robinhoodChain, robinhoodTestnet } from "./networks";

export { robinhoodChain, robinhoodTestnet } from "./networks";

export const wagmiConfig = createConfig({
  chains: [robinhoodChain, robinhoodTestnet],
  connectors: [injected()],
  transports: {
    [robinhoodChain.id]: http(),
    [robinhoodTestnet.id]: http(),
  },
  ssr: true,
});
