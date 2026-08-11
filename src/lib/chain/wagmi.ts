import { http, createConfig } from "wagmi";
import { injected } from "wagmi/connectors";
import { robinhoodChain } from "./networks";

export { robinhoodChain } from "./networks";

export const wagmiConfig = createConfig({
  chains: [robinhoodChain],
  connectors: [injected()],
  transports: {
    [robinhoodChain.id]: http(),
  },
  ssr: true,
});
