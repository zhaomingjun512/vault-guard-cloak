# Netlify Deployment Guide for Vault Guard Cloak

This guide provides step-by-step instructions for deploying the Vault Guard Cloak application to Netlify.

## Prerequisites

- GitHub account with access to the repository
- Netlify account (free tier available)
- Environment variables ready

## Step-by-Step Deployment

### 1. Access Netlify Dashboard

1. Go to [netlify.com](https://netlify.com)
2. Sign in with your GitHub account
3. Click "New site from Git" on the dashboard

### 2. Connect GitHub Repository

1. Choose "GitHub" as your Git provider
2. Authorize Netlify to access your GitHub repositories
3. Search for `zhaomingjun512/vault-guard-cloak`
4. Click "Select" next to the repository

### 3. Configure Build Settings

1. **Branch to deploy**: `main`
2. **Build command**: `npm run build`
3. **Publish directory**: `dist`
4. **Base directory**: Leave empty (default)

### 4. Environment Variables Configuration

Click "Show advanced" and then "New variable" to add:

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
- All environment variables must be prefixed with `NEXT_PUBLIC_` for Vite to access them
- Replace contract addresses after deploying smart contracts

### 5. Deploy

1. Click "Deploy site"
2. Wait for the build process to complete (usually 2-5 minutes)
3. Netlify will provide you with a deployment URL

### 6. Custom Domain (Optional)

1. Go to Site settings → Domain management
2. Click "Add custom domain"
3. Follow the DNS configuration instructions

## Advanced Configuration

### 1. Build Settings Optimization

Create a `netlify.toml` file in your project root:

```toml
[build]
  command = "npm run build"
  publish = "dist"

[build.environment]
  NODE_VERSION = "18"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200

[[headers]]
  for = "/*"
  [headers.values]
    X-Frame-Options = "DENY"
    X-XSS-Protection = "1; mode=block"
    X-Content-Type-Options = "nosniff"
    Referrer-Policy = "strict-origin-when-cross-origin"

[[headers]]
  for = "/assets/*"
  [headers.values]
    Cache-Control = "public, max-age=31536000, immutable"
```

### 2. Form Handling (Optional)

If you need form handling, add to `netlify.toml`:

```toml
[build.processing]
  skip_processing = false

[build.processing.css]
  bundle = true
  minify = true

[build.processing.js]
  bundle = true
  minify = true

[build.processing.html]
  pretty_urls = true
```

## Post-Deployment Configuration

### 1. Update Contract Addresses

After deploying your smart contracts:

1. Go to Site settings → Environment variables
2. Update `NEXT_PUBLIC_VAULT_CONTRACT_ADDRESS`
3. Update `NEXT_PUBLIC_FHE_CONTRACT_ADDRESS`
4. Trigger a new deployment

### 2. Verify Deployment

1. Visit your Netlify URL
2. Test wallet connection
3. Verify all features work correctly
4. Check browser console for errors

## Troubleshooting

### Common Issues

1. **Build Failures**
   - Check environment variables are set correctly
   - Verify Node.js version (use 18.x)
   - Check build logs in Netlify dashboard

2. **Routing Issues**
   - Add redirect rules in `netlify.toml`
   - Ensure SPA routing is configured

3. **Environment Variables Not Working**
   - Verify variables start with `NEXT_PUBLIC_`
   - Check variable names match exactly
   - Redeploy after adding variables

### Build Logs

To view build logs:
1. Go to Deploys tab in Netlify dashboard
2. Click on the latest deployment
3. View build log for detailed information

## Performance Optimization

### 1. Asset Optimization

```toml
[build.processing]
  skip_processing = false

[build.processing.css]
  bundle = true
  minify = true

[build.processing.js]
  bundle = true
  minify = true
```

### 2. Caching Headers

```toml
[[headers]]
  for = "/assets/*"
  [headers.values]
    Cache-Control = "public, max-age=31536000, immutable"

[[headers]]
  for = "/*.js"
  [headers.values]
    Cache-Control = "public, max-age=31536000, immutable"

[[headers]]
  for = "/*.css"
  [headers.values]
    Cache-Control = "public, max-age=31536000, immutable"
```

## Security Configuration

### 1. Security Headers

```toml
[[headers]]
  for = "/*"
  [headers.values]
    X-Frame-Options = "DENY"
    X-XSS-Protection = "1; mode=block"
    X-Content-Type-Options = "nosniff"
    Referrer-Policy = "strict-origin-when-cross-origin"
    Content-Security-Policy = "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://*.walletconnect.com https://*.walletconnect.org; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; connect-src 'self' https://*.infura.io https://*.walletconnect.com wss://*.walletconnect.com;"
```

### 2. HTTPS Configuration

- Netlify automatically provides SSL certificates
- Force HTTPS redirects are enabled by default
- Custom certificates can be uploaded if needed

## Monitoring and Analytics

### 1. Netlify Analytics

1. Go to Site settings → Analytics
2. Enable Netlify Analytics
3. View traffic and performance metrics

### 2. Error Tracking

1. Go to Deploys tab
2. Monitor deployment status
3. Check build logs for errors

## Environment Variables Reference

| Variable | Description | Required | Example |
|----------|-------------|----------|---------|
| `NEXT_PUBLIC_CHAIN_ID` | Ethereum chain ID | Yes | `11155111` (Sepolia) |
| `NEXT_PUBLIC_RPC_URL` | RPC endpoint URL | Yes | `https://sepolia.infura.io/v3/...` |
| `NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID` | WalletConnect project ID | Yes | `2ec9743d0d0cd7fb94dee1a7e6d33475` |
| `NEXT_PUBLIC_INFURA_API_KEY` | Infura API key | Optional | `b18fb7e6ca7045ac83c41157ab93f990` |
| `NEXT_PUBLIC_VAULT_CONTRACT_ADDRESS` | Vault contract address | Yes (after deployment) | `0x...` |
| `NEXT_PUBLIC_FHE_CONTRACT_ADDRESS` | FHE contract address | Yes (after deployment) | `0x...` |

## Deployment Checklist

- [ ] Repository connected to Netlify
- [ ] Build settings configured
- [ ] Environment variables set
- [ ] Initial deployment successful
- [ ] Custom domain configured (if needed)
- [ ] Security headers configured
- [ ] Performance optimizations applied
- [ ] Application tested and verified

## Comparison with Vercel

| Feature | Netlify | Vercel |
|---------|---------|--------|
| Free Tier | 100GB bandwidth/month | 100GB bandwidth/month |
| Build Time | 300 minutes/month | 6000 minutes/month |
| Form Handling | Built-in | Requires external service |
| Edge Functions | Available | Available |
| Git Integration | Excellent | Excellent |
| Custom Domains | Free | Free |
| SSL Certificates | Automatic | Automatic |

## Support

- **Netlify Documentation**: [docs.netlify.com](https://docs.netlify.com)
- **Community Forum**: [community.netlify.com](https://community.netlify.com)
- **GitHub Issues**: Report issues in the repository

## Next Steps

After successful deployment:

1. Deploy smart contracts to Sepolia testnet
2. Update contract addresses in environment variables
3. Test all application features
4. Configure custom domain (if needed)
5. Set up monitoring and analytics
6. Optimize performance settings

---

**Note**: Netlify is an excellent alternative to Vercel with similar features and often better free tier limits for bandwidth and build time.
