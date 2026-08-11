# HoodOptions contracts

Defined-risk options and a USDG liquidity vault for **Robinhood Chain testnet**.

| Contract | Role |
|---|---|
| `HoodVault.sol` | 6-decimal USDG vault with share accounting, full payout reservations, 80% utilization cap, and reentrancy protection. |
| `HoodOptionsEngine.sol` | Contract-derived premium/strike/payout, oracle-priced markets, and post-expiry settlement. The trader cannot submit their own quote. |
| `USDGMock.sol` | Testnet-only USDG plus a 10,000 USDG / day faucet. |

## Verified testnet deployment

> Do not enter a private key into a chat, Vercel, or GitHub. Use a disposable
> testnet-only wallet locally. This deployment intentionally cannot move mainnet funds.

```bash
curl -L https://foundry.paradigm.xyz | bash && foundryup # once
cd contracts
export DEPLOYER_KEY=0x... # testnet wallet with test ETH
forge test -vvv
forge script script/Deploy.s.sol --rpc-url robinhood_testnet \
  --private-key "$DEPLOYER_KEY" --broadcast -vvvv
```

The script emits three `NEXT_PUBLIC_TESTNET_*_ADDRESS` lines. Add them to
`.env.local` and your Vercel production environment, then redeploy the web app.
It also seeds the vault with 10,000 testnet USDG and posts initial prices.

## Live price publisher

The web app includes `GET /api/oracle/publish`, which fetches public market
quotes and posts them to the testnet engine. Configure these **server-only**
Vercel environment variables:

```bash
TESTNET_ORACLE_PRIVATE_KEY=0x... # testnet wallet; must equal deployment oracle
CRON_SECRET=<long random secret>
```

Call the endpoint once per minute from an authenticated scheduler:

```bash
curl -H "Authorization: Bearer $CRON_SECRET" \
  https://hoodoptions.xyz/api/oracle/publish
```

The endpoint never exposes the oracle key to browsers. Private-market markets
without a verifiable price oracle (for example SPCX) are intentionally not
deployed or tradeable on testnet.

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
