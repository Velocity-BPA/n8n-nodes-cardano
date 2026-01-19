# n8n-nodes-cardano

> [Velocity BPA Licensing Notice]
>
> This n8n node is licensed under the Business Source License 1.1 (BSL 1.1).
>
> Use of this node by for-profit organizations in production environments requires a commercial license from Velocity BPA.
>
> For licensing information, visit https://velobpa.com/licensing or contact licensing@velobpa.com.

A comprehensive n8n community node for Cardano blockchain providing 13 resources and 100+ operations for accounts, transactions, native tokens, NFTs, staking, smart contracts, and governance. Includes real-time event triggers and full support for CIP standards.

![Cardano](https://img.shields.io/badge/Cardano-0033AD?style=for-the-badge&logo=cardano&logoColor=white)
![n8n](https://img.shields.io/badge/n8n-EA4B71?style=for-the-badge&logo=n8n&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)
![License](https://img.shields.io/badge/license-BSL--1.1-blue?style=for-the-badge)

## Features

### Credentials
- **Cardano Network API**: Connect to Mainnet, Preprod, Preview, or custom networks via Blockfrost, Koios, Cardano GraphQL, or Ogmios
- **Cardano Wallet**: Support for mnemonic phrases (15/24 words), extended signing keys, separate payment/stake keys

### Cardano Node (13 Resources, 100+ Operations)

| Resource | Operations |
|----------|------------|
| **Account/Address** | Get Info, Balance, UTXOs, Transactions, Assets, Validate, Check Type, Get Stake Address |
| **Transaction** | Get, UTXOs, Metadata, Redeemers, Status, Estimate Fee |
| **UTXO** | Get, Get by Reference, Select (coin selection), Check Spent, Get Collateral, Get Datum |
| **Native Token** | Get Info, History, Transactions, Addresses, Metadata, Policy Assets, Supply |
| **NFT** | Get Metadata, By Owner, Collection, Image URL, Verify Standard |
| **Stake Pool** | List, Get Info, Metadata, Delegators, History, Blocks, Relays, Calculate APY, Retiring |
| **Staking** | Stake Info, Delegation History, Rewards History, Available Rewards, Calculate Rewards |
| **Epoch** | Current, Info, Parameters, Latest Params, Blocks, Network Supply, Network Tip |
| **Block** | Get, Latest, Transactions, Next, Previous |
| **Smart Contract** | Get Info, CBOR, JSON, Redeemers, Datum, Datum By Hash, UTXOs |
| **Governance** | DReps, DRep Info, Delegators, Actions, Votes, Constitution, Committee |
| **Metadata** | By Tx Hash, By Label, Parse CIP-25, Parse CIP-68 |
| **Utility** | Lovelace/ADA conversion, Calculate Min UTXO, Calculate Fingerprint |

### Cardano Trigger Node (11 Event Types)

Real-time blockchain event monitoring with polling:

- **Block/Transaction**: New Block, Address Transaction, Large Transaction
- **Asset**: Token Transfer, Token Minted, NFT Transfer
- **Staking**: Delegation Changed, Rewards Available, Pool Retirement
- **Smart Contract**: Script Execution
- **Account**: Balance Change

## Installation

### Community Nodes (Recommended)

1. Open n8n
2. Go to **Settings** → **Community Nodes**
3. Click **Install a community node**
4. Enter `n8n-nodes-cardano`
5. Click **Install**

### Manual Installation

```bash
# Clone repository
git clone https://github.com/Velocity-BPA/n8n-nodes-cardano.git
cd n8n-nodes-cardano

# Install dependencies
npm install

# Build
npm run build

# Link to n8n
cd ~/.n8n/custom
ln -s /path/to/n8n-nodes-cardano .
```

### Development Installation

```bash
# Extract the zip file
unzip n8n-nodes-cardano.zip
cd n8n-nodes-cardano

# Install dependencies
npm install

# Build the project
npm run build

# Create symlink to n8n custom nodes directory
mkdir -p ~/.n8n/custom
ln -s $(pwd) ~/.n8n/custom/n8n-nodes-cardano

# Restart n8n
n8n start
```

## Credentials Setup

### Cardano Network API

| Field | Description |
|-------|-------------|
| Network | Mainnet, Preprod, Preview, or Custom |
| API Provider | Blockfrost, Koios, GraphQL, Ogmios, or Custom |
| API Key | Required for Blockfrost (get free at [blockfrost.io](https://blockfrost.io)) |
| Custom Endpoint | URL for custom/self-hosted providers |

### Cardano Wallet (Optional)

| Field | Description |
|-------|-------------|
| Auth Method | Mnemonic, Extended Key, Separate Keys, or Read-Only |
| Mnemonic | 15 or 24-word recovery phrase |
| Account Index | HD wallet account index (default: 0) |

## Usage Examples

### Get Address Balance

```json
{
  "resource": "account",
  "operation": "getBalance",
  "address": "addr1qx2fxv2umyhttkxyxp8x0dlpdt3k6cwng5pxj3jhsydzer..."
}
```

### Monitor Large Transactions

Use the Cardano Trigger node with:
- **Trigger Type**: Large Transaction
- **Threshold**: 10000 (ADA)
- **Poll Interval**: 60 seconds

### Get NFT Collection

```json
{
  "resource": "nft",
  "operation": "getCollection",
  "policyId": "d5e6bf0500378d4f0da4e8dde6becec7621cd8cbf5cbb9b87013d4cc"
}
```

### Check Staking Rewards

```json
{
  "resource": "staking",
  "operation": "getAvailableRewards",
  "stakeAddress": "stake1uxpdrerp9wrxunfh6ukyv5267j70fzxgw0fr3z8zeac5vyqhf9jhy"
}
```

## Cardano Concepts

### Address Types
- **Base Address** (addr1q...): Payment + stake credentials
- **Enterprise Address** (addr1v...): Payment only, no staking
- **Stake Address** (stake1...): Rewards/delegation address

### Units
- **1 ADA = 1,000,000 Lovelace**
- All API amounts are in Lovelace

### CIP Standards Supported
- **CIP-2**: Coin Selection Algorithms
- **CIP-14**: Asset Fingerprints
- **CIP-25**: NFT Metadata Standard
- **CIP-68**: Datum-based Token Metadata
- **CIP-1694**: Voltaire Governance

## Networks

| Network | Description | Use Case |
|---------|-------------|----------|
| Mainnet | Production network | Real transactions |
| Preprod | Pre-production testnet | Testing before mainnet |
| Preview | Cutting-edge testnet | New feature testing |

## Error Handling

Common errors and solutions:

| Error | Cause | Solution |
|-------|-------|----------|
| Invalid API key | Wrong Blockfrost project ID | Verify key matches network |
| Address not found | Invalid address format | Use Bech32 format (addr1...) |
| Rate limit exceeded | Too many requests | Reduce poll frequency or upgrade tier |
| UTXO not found | UTXO already spent | Refresh UTXO set |

## Security Best Practices

1. **Never expose mnemonics** - Use environment variables
2. **Use read-only mode** for monitoring-only workflows
3. **Encrypt credentials** - Use n8n's built-in encryption
4. **Test on testnet first** - Use Preprod or Preview networks

## Development

```bash
# Install dependencies
npm install

# Build
npm run build

# Run tests
npm test

# Run linting
npm run lint

# Fix linting issues
npm run lint:fix
```

## Author

**Velocity BPA**
- Website: [velobpa.com](https://velobpa.com)
- GitHub: [Velocity-BPA](https://github.com/Velocity-BPA)

## Licensing

This n8n community node is licensed under the **Business Source License 1.1**.

### Free Use
Permitted for personal, educational, research, and internal business use.

### Commercial Use
Use of this node within any SaaS, PaaS, hosted platform, managed service,
or paid automation offering requires a commercial license.

For licensing inquiries:
**licensing@velobpa.com**

See [LICENSE](LICENSE), [COMMERCIAL_LICENSE.md](COMMERCIAL_LICENSE.md), and [LICENSING_FAQ.md](LICENSING_FAQ.md) for details.

## Contributing

Contributions are welcome! Please:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Make your changes
4. Run linting and tests (`npm run lint && npm test`)
5. Commit your changes (`git commit -m 'Add amazing feature'`)
6. Push to the branch (`git push origin feature/amazing-feature`)
7. Open a Pull Request

## Support

- **Issues**: [GitHub Issues](https://github.com/Velocity-BPA/n8n-nodes-cardano/issues)
- **Discussions**: [GitHub Discussions](https://github.com/Velocity-BPA/n8n-nodes-cardano/discussions)
- **Email**: licensing@velobpa.com

## Acknowledgments

- [Blockfrost](https://blockfrost.io) for their excellent Cardano API
- [Koios](https://koios.rest) for free API access
- [n8n](https://n8n.io) for the workflow automation platform
- [Cardano Foundation](https://cardanofoundation.org) for blockchain infrastructure
- [IOG](https://iohk.io) for Cardano development
