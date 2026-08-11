import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  output: "standalone",
  outputFileTracingRoot: path.join(__dirname),
  images: {
    unoptimized: true,
  },
  webpack: (config) => {
    // wagmi's optional "tempo" connector references packages that are not
    // installed; stub them so webpack doesn't fail the build.
    config.resolve.alias = {
      ...config.resolve.alias,
      accounts: false,
      tempo: false,
      "porto": false,
      "porto/internal": false,
      "@base-org/account": false,
      "@coinbase/wallet-sdk": false,
      "@metamask/connect-evm": false,
      "@safe-global/safe-apps-sdk": false,
      "@safe-global/safe-apps-provider": false,
      "@walletconnect/ethereum-provider": false,
    };
    return config;
  },
};

export default nextConfig;
