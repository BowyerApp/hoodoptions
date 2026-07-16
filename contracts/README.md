# HoodOptions contracts

Solidity protocol for defined-risk options on Robinhood Chain stock tokens.

| Contract | Role |
|---|---|
| `HoodVault.sol` | USDG liquidity vault. ERC4626-style shares, 80% utilization cap, engine-only reserve/payout. |
| `HoodOptionsEngine.sol` | Options engine. Premium in → collateral reserved → oracle settlement → payout. Max loss = premium. |
| `USDGMock.sol` | Testnet USDG with a daily faucet. Mainnet uses canonical USDG. |

## Deploy (Robinhood Chain testnet)

```bash
curl -L https://foundry.paradigm.xyz | bash && foundryup   # once
cd contracts
export DEPLOYER_KEY=0x...   # funded with testnet ETH from the RH faucet
forge script script/Deploy.s.sol --rpc-url robinhood_testnet \
  --private-key $DEPLOYER_KEY --broadcast
```

Networks (from official Robinhood docs):

| | Chain ID | RPC | Explorer |
|---|---|---|---|
| Mainnet | 4663 | rpc.mainnet.chain.robinhood.com | robinhoodchain.blockscout.com |
| Testnet | 46630 | rpc.testnet.chain.robinhood.com | explorer.testnet.chain.robinhood.com |

## Mainnet checklist (before real money)

1. Replace deployer-as-oracle with a Chainlink-compatible price adapter.
2. Third-party audit of vault + engine (payout math, utilization cap, reentrancy).
3. Timelock + multisig on `owner`.
4. Canonical USDG address instead of the mock.
