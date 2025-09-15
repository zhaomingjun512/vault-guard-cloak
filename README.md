# Vault Guard Cloak

A revolutionary confidential multisig treasury system with encrypted votes until quorum threshold is reached, ensuring unbiased governance decisions and maximum security.

## Features

- **Confidential Voting**: Votes are encrypted using FHE (Fully Homomorphic Encryption) until quorum is reached
- **Multisig Security**: Enterprise-grade security for treasury management
- **Real-time Governance**: Advanced multisig voting system with transparent results
- **Wallet Integration**: Seamless connection with popular Web3 wallets
- **FHE Protection**: Core data encrypted using Zama's FHE technology

## Technology Stack

- **Frontend**: React 18, TypeScript, Vite
- **UI Components**: shadcn/ui, Radix UI, Tailwind CSS
- **Web3**: RainbowKit, Wagmi, Viem
- **Blockchain**: Ethereum Sepolia Testnet
- **Encryption**: Zama FHE (Fully Homomorphic Encryption)
- **Smart Contracts**: Solidity with FHE integration

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- Git

### Installation

1. Clone the repository:
```bash
git clone https://github.com/zhaomingjun512/vault-guard-cloak.git
cd vault-guard-cloak
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env.local
```

4. Configure your environment variables in `.env.local`:
```env
NEXT_PUBLIC_CHAIN_ID=11155111
NEXT_PUBLIC_RPC_URL=https://sepolia.infura.io/v3/b18fb7e6ca7045ac83c41157ab93f990
NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID=2ec9743d0d0cd7fb94dee1a7e6d33475
NEXT_PUBLIC_INFURA_API_KEY=b18fb7e6ca7045ac83c41157ab93f990
```

5. Start the development server:
```bash
npm run dev
```

The application will be available at `http://localhost:8080`.

## Smart Contract

The project includes a Solidity smart contract that implements:

- FHE-encrypted voting mechanisms
- Multisig treasury management
- Confidential proposal handling
- Secure fund management

### Contract Features

- **Encrypted Votes**: All votes are encrypted using FHE until quorum is reached
- **Treasury Management**: Secure fund storage and withdrawal mechanisms
- **Proposal System**: Create and manage governance proposals
- **Reputation System**: Track participant reputation and voting history

## Deployment

### Vercel Deployment

1. Connect your GitHub repository to Vercel
2. Configure environment variables in Vercel dashboard
3. Deploy automatically on push to main branch

### Manual Deployment

1. Build the project:
```bash
npm run build
```

2. Deploy the `dist` folder to your preferred hosting service

## Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit your changes: `git commit -m 'Add amazing feature'`
4. Push to the branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

## Security

This project implements enterprise-grade security measures:

- FHE encryption for sensitive data
- Multisig wallet integration
- Secure smart contract patterns
- Regular security audits

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Support

For support and questions, please open an issue in the GitHub repository.

## Acknowledgments

- Zama for FHE technology
- RainbowKit for wallet integration
- shadcn/ui for component library