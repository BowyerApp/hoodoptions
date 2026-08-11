# HoodOptions Testnet Launch

This activates the wallet-signed, on-chain test environment. It is not a
mainnet or real-money deployment.

## 1. Deploy locally from a disposable testnet wallet

Fund a new wallet with Robinhood Chain Testnet ETH, then run locally:

```bash
cd contracts
forge test -vvv
forge script script/Deploy.s.sol \
  --rpc-url https://rpc.testnet.chain.robinhood.com \
  --private-key "$DEPLOYER_KEY" \
  --broadcast -vvvv
```

Never provide `DEPLOYER_KEY` to a website, chat, GitHub, or Vercel. The deploy
output prints the USDG mock, vault, and engine addresses.

## 2. Configure Vercel

In Vercel → HoodOptions → Settings → Environment Variables, add these to
**Production** and **Preview**, then redeploy:

```text
NEXT_PUBLIC_TESTNET_USDG_ADDRESS=0x...
NEXT_PUBLIC_TESTNET_VAULT_ADDRESS=0x...
NEXT_PUBLIC_TESTNET_ENGINE_ADDRESS=0x...
TESTNET_ORACLE_PRIVATE_KEY=0x...
CRON_SECRET=<32+ random characters>
```

`TESTNET_ORACLE_PRIVATE_KEY` must be the temporary oracle wallet configured by
the deployment. It only needs testnet ETH and must never be exposed with
`NEXT_PUBLIC_`.

## 3. Start protected price publishing

Schedule this authenticated request every minute during public market hours:

```bash
curl -H "Authorization: Bearer $CRON_SECRET" \
  https://hoodoptions.xyz/api/oracle/publish
```

After the first successful response, the app can fetch on-chain contract
quotes. The faucet, vault, trade opening, collateral reserve, and settlement
are all wallet-signed testnet transactions.

## 4. Verify

1. Switch MetaMask to Robinhood Chain Testnet (`46630`).
2. Connect at `https://hoodoptions.xyz`.
3. Claim testnet USDG.
4. Deposit USDG to seed/expand the vault.
5. Open a public-stock option.
6. Confirm the transaction in the testnet Blockscout explorer.

## Explicit non-goals

- No mainnet funds.
- No private-market asset without a verifiable oracle.
- No real-money launch before independent audit, multisig/timelock governance,
  and a production oracle.
