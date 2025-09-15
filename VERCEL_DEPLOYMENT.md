# Vercel Deployment Guide for Vault Guard Cloak

This guide provides step-by-step instructions for deploying the Vault Guard Cloak application to Vercel.

## Prerequisites

- GitHub account with access to the repository
- Vercel account (free tier available)
- Environment variables ready

## Step-by-Step Deployment

### 1. Access Vercel Dashboard

1. Go to [vercel.com](https://vercel.com)
2. Sign in with your GitHub account
3. Click "New Project" on the dashboard

### 2. Import GitHub Repository

1. In the "Import Git Repository" section, search for `zhaomingjun512/vault-guard-cloak`
2. Click "Import" next to the repository
3. Vercel will automatically detect it as a Vite project

### 3. Configure Project Settings

1. **Project Name**: `vault-guard-cloak` (or your preferred name)
2. **Framework Preset**: Vite (should be auto-detected)
3. **Root Directory**: `./` (default)
4. **Build Command**: `npm run build` (default)
5. **Output Directory**: `dist` (default)
6. **Install Command**: `npm install` (default)

### 4. Environment Variables Configuration

Click "Environment Variables" and add the following variables:

```env
# Chain Configuration
NEXT_PUBLIC_CHAIN_ID=11155111
NEXT_PUBLIC_RPC_URL=https://sepolia.infura.io/v3/b18fb7e6ca7045ac83c41157ab93f990

# Wallet Connect Configuration
NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID=2ec9743d0d0cd7fb94dee1a7e6d33475

# Infura Configuration (Optional)
NEXT_PUBLIC_INFURA_API_KEY=b18fb7e6ca7045ac83c41157ab93f990
NEXT_PUBLIC_RPC_URL=https://1rpc.io/sepolia

# Contract Addresses (Update after deployment)
NEXT_PUBLIC_VAULT_CONTRACT_ADDRESS=
NEXT_PUBLIC_FHE_CONTRACT_ADDRESS=
```

**Important Notes:**
- Replace `NEXT_PUBLIC_VAULT_CONTRACT_ADDRESS` with the actual deployed contract address
- Replace `NEXT_PUBLIC_FHE_CONTRACT_ADDRESS` with the FHE contract address
- All environment variables must be prefixed with `NEXT_PUBLIC_` for Vite to access them

### 5. Advanced Configuration (Optional)

If you need custom build settings, click "Show Advanced" and configure:

- **Node.js Version**: 18.x (recommended)
- **Build Command**: `npm run build`
- **Development Command**: `npm run dev`
- **Install Command**: `npm install`

### 6. Deploy

1. Click "Deploy" button
2. Wait for the build process to complete (usually 2-5 minutes)
3. Vercel will provide you with a deployment URL

### 7. Custom Domain (Optional)

1. Go to your project dashboard
2. Click "Settings" → "Domains"
3. Add your custom domain
4. Follow the DNS configuration instructions

## Post-Deployment Configuration

### 1. Update Contract Addresses

After deploying your smart contracts:

1. Go to Vercel Dashboard → Your Project → Settings → Environment Variables
2. Update `NEXT_PUBLIC_VAULT_CONTRACT_ADDRESS` with the deployed contract address
3. Update `NEXT_PUBLIC_FHE_CONTRACT_ADDRESS` with the FHE contract address
4. Redeploy the application

### 2. Verify Deployment

1. Visit your deployment URL
2. Test wallet connection
3. Verify all features are working correctly
4. Check console for any errors

## Troubleshooting

### Common Issues

1. **Build Failures**
   - Check environment variables are correctly set
   - Ensure all dependencies are in package.json
   - Check build logs in Vercel dashboard

2. **Wallet Connection Issues**
   - Verify `NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID` is correct
   - Check RPC URL is accessible
   - Ensure chain ID matches your configuration

3. **Contract Interaction Issues**
   - Verify contract addresses are correct
   - Check if contracts are deployed on the correct network
   - Ensure user has sufficient permissions

### Build Logs

To view build logs:
1. Go to Vercel Dashboard → Your Project
2. Click on the latest deployment
3. Check "Build Logs" tab for detailed information

## Environment Variables Reference

| Variable | Description | Required | Example |
|----------|-------------|----------|---------|
| `NEXT_PUBLIC_CHAIN_ID` | Ethereum chain ID | Yes | `11155111` (Sepolia) |
| `NEXT_PUBLIC_RPC_URL` | RPC endpoint URL | Yes | `https://sepolia.infura.io/v3/...` |
| `NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID` | WalletConnect project ID | Yes | `2ec9743d0d0cd7fb94dee1a7e6d33475` |
| `NEXT_PUBLIC_INFURA_API_KEY` | Infura API key | Optional | `b18fb7e6ca7045ac83c41157ab93f990` |
| `NEXT_PUBLIC_VAULT_CONTRACT_ADDRESS` | Vault contract address | Yes (after deployment) | `0x...` |
| `NEXT_PUBLIC_FHE_CONTRACT_ADDRESS` | FHE contract address | Yes (after deployment) | `0x...` |

## Security Considerations

1. **Environment Variables**: Never commit sensitive keys to the repository
2. **API Keys**: Use environment variables for all API keys
3. **Contract Addresses**: Verify contract addresses before deployment
4. **Network Security**: Ensure RPC endpoints are secure and reliable

## Performance Optimization

1. **Build Optimization**: Vercel automatically optimizes builds
2. **CDN**: Vercel provides global CDN for fast loading
3. **Caching**: Static assets are automatically cached
4. **Image Optimization**: Use Vercel's image optimization features

## Monitoring and Analytics

1. **Vercel Analytics**: Enable in project settings
2. **Error Tracking**: Monitor deployment logs
3. **Performance**: Use Vercel's performance insights
4. **Uptime**: Monitor application availability

## Support

- **Vercel Documentation**: [vercel.com/docs](https://vercel.com/docs)
- **GitHub Issues**: Report issues in the repository
- **Community**: Join Vercel Discord for support

## Deployment Checklist

- [ ] Repository imported to Vercel
- [ ] Environment variables configured
- [ ] Build settings verified
- [ ] Initial deployment successful
- [ ] Contract addresses updated
- [ ] Custom domain configured (if needed)
- [ ] Application tested and verified
- [ ] Monitoring and analytics enabled

## Next Steps

After successful deployment:

1. Deploy smart contracts to Sepolia testnet
2. Update contract addresses in environment variables
3. Test all application features
4. Set up monitoring and alerts
5. Configure custom domain (if needed)
6. Set up CI/CD for automatic deployments

---

**Note**: This deployment guide assumes you have already deployed your smart contracts. If you haven't deployed the contracts yet, please do so first and then update the environment variables accordingly.
