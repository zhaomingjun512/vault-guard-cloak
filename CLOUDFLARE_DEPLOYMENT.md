# Cloudflare Pages Deployment Guide for Vault Guard Cloak

This guide provides step-by-step instructions for deploying the Vault Guard Cloak application to Cloudflare Pages.

## Prerequisites

- GitHub account with access to the repository
- Cloudflare account (free tier available)
- Environment variables ready

## Why Choose Cloudflare Pages?

- **Global CDN**: 200+ data centers worldwide
- **Excellent Performance**: Fast loading times globally
- **Free Tier**: Generous limits (500 builds/month, unlimited bandwidth)
- **Security**: Built-in DDoS protection and security features
- **Edge Functions**: Serverless functions at the edge
- **Analytics**: Built-in web analytics

## Step-by-Step Deployment

### 1. Access Cloudflare Dashboard

1. Go to [dash.cloudflare.com](https://dash.cloudflare.com)
2. Sign in to your Cloudflare account
3. Navigate to "Pages" in the left sidebar
4. Click "Create a project"

### 2. Connect GitHub Repository

1. Choose "Connect to Git"
2. Select "GitHub" as your Git provider
3. Authorize Cloudflare to access your GitHub repositories
4. Search for `zhaomingjun512/vault-guard-cloak`
5. Click "Begin setup"

### 3. Configure Build Settings

1. **Project name**: `vault-guard-cloak` (or your preferred name)
2. **Production branch**: `main`
3. **Framework preset**: `Vite`
4. **Build command**: `npm run build`
5. **Build output directory**: `dist`
6. **Root directory**: Leave empty (default)

### 4. Environment Variables Configuration

Click "Environment variables" and add the following variables:

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
- You can add variables for both Production and Preview environments

### 5. Deploy

1. Click "Save and Deploy"
2. Wait for the build process to complete (usually 2-5 minutes)
3. Cloudflare will provide you with a deployment URL

### 6. Custom Domain (Optional)

1. Go to your project dashboard
2. Click "Custom domains" tab
3. Click "Set up a custom domain"
4. Enter your domain name
5. Follow the DNS configuration instructions

## Advanced Configuration

### 1. Build Settings Optimization

Create a `_redirects` file in your `public` directory:

```
/*    /index.html   200
```

This ensures proper SPA routing.

### 2. Cloudflare Pages Functions (Optional)

Create a `functions` directory in your project root for serverless functions:

```
functions/
├── api/
│   └── hello.js
└── _middleware.js
```

Example middleware for security headers:

```javascript
// functions/_middleware.js
export async function onRequest(context) {
  const response = await context.next();
  
  // Add security headers
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('X-XSS-Protection', '1; mode=block');
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  
  return response;
}
```

### 3. Wrangler Configuration

Create a `wrangler.toml` file for advanced configuration:

```toml
name = "vault-guard-cloak"
compatibility_date = "2024-01-01"

[env.production]
name = "vault-guard-cloak"

[env.preview]
name = "vault-guard-cloak-preview"

# Environment variables
[vars]
NEXT_PUBLIC_CHAIN_ID = "11155111"
NEXT_PUBLIC_RPC_URL = "https://sepolia.infura.io/v3/b18fb7e6ca7045ac83c41157ab93f990"
```

## Post-Deployment Configuration

### 1. Update Contract Addresses

After deploying your smart contracts:

1. Go to Pages → Your Project → Settings → Environment variables
2. Update `NEXT_PUBLIC_VAULT_CONTRACT_ADDRESS`
3. Update `NEXT_PUBLIC_FHE_CONTRACT_ADDRESS`
4. Trigger a new deployment

### 2. Configure Security Headers

1. Go to Pages → Your Project → Settings → Functions
2. Add middleware for security headers
3. Configure CSP (Content Security Policy) for Web3 apps

### 3. Verify Deployment

1. Visit your Cloudflare Pages URL
2. Test wallet connection
3. Verify all features work correctly
4. Check browser console for errors

## Performance Optimization

### 1. Caching Configuration

Cloudflare Pages automatically optimizes caching, but you can customize:

1. Go to Pages → Your Project → Settings → Functions
2. Add caching headers in middleware
3. Configure cache rules for different file types

### 2. Image Optimization

```javascript
// functions/_middleware.js
export async function onRequest(context) {
  const response = await context.next();
  
  // Optimize images
  if (response.headers.get('content-type')?.startsWith('image/')) {
    response.headers.set('Cache-Control', 'public, max-age=31536000, immutable');
  }
  
  return response;
}
```

### 3. Compression

Cloudflare automatically provides:
- Gzip compression
- Brotli compression
- Image optimization
- Minification

## Security Configuration

### 1. Security Headers

Add to your middleware:

```javascript
// functions/_middleware.js
export async function onRequest(context) {
  const response = await context.next();
  
  // Security headers
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('X-XSS-Protection', '1; mode=block');
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  
  // CSP for Web3 applications
  response.headers.set('Content-Security-Policy', 
    "default-src 'self'; " +
    "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://*.walletconnect.com https://*.walletconnect.org; " +
    "style-src 'self' 'unsafe-inline'; " +
    "img-src 'self' data: https:; " +
    "connect-src 'self' https://*.infura.io https://*.walletconnect.com wss://*.walletconnect.com;"
  );
  
  return response;
}
```

### 2. DDoS Protection

Cloudflare automatically provides:
- DDoS protection
- Bot management
- Rate limiting
- SSL/TLS encryption

## Monitoring and Analytics

### 1. Cloudflare Analytics

1. Go to Pages → Your Project → Analytics
2. View traffic, performance, and error metrics
3. Monitor Core Web Vitals

### 2. Web Analytics

1. Go to Pages → Your Project → Settings → Analytics
2. Enable Web Analytics
3. Get detailed insights about your users

### 3. Error Tracking

1. Go to Pages → Your Project → Functions
2. Add error tracking in your middleware
3. Monitor function errors and performance

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

- [ ] Repository connected to Cloudflare Pages
- [ ] Build settings configured
- [ ] Environment variables set
- [ ] Initial deployment successful
- [ ] Custom domain configured (if needed)
- [ ] Security headers configured
- [ ] Performance optimizations applied
- [ ] Analytics enabled
- [ ] Application tested and verified

## Comparison with Other Platforms

| Feature | Cloudflare Pages | Vercel | Netlify |
|---------|------------------|--------|---------|
| Free Tier | 500 builds/month | 6000 minutes/month | 300 minutes/month |
| Bandwidth | Unlimited | 100GB/month | 100GB/month |
| Global CDN | 200+ locations | 100+ locations | 100+ locations |
| Edge Functions | Yes | Yes | Yes |
| DDoS Protection | Built-in | No | No |
| Bot Management | Yes | No | No |
| Analytics | Built-in | Paid | Paid |
| Custom Domains | Free | Free | Free |

## Troubleshooting

### Common Issues

1. **Build Failures**
   - Check environment variables are set correctly
   - Verify Node.js version (use 18.x)
   - Check build logs in Cloudflare dashboard

2. **Routing Issues**
   - Add `_redirects` file for SPA routing
   - Ensure proper redirect rules

3. **Environment Variables Not Working**
   - Verify variables start with `NEXT_PUBLIC_`
   - Check variable names match exactly
   - Redeploy after adding variables

4. **CORS Issues**
   - Configure proper CORS headers in middleware
   - Check CSP settings for Web3 connections

### Build Logs

To view build logs:
1. Go to Pages → Your Project → Deployments
2. Click on the latest deployment
3. View build log for detailed information

## Support

- **Cloudflare Documentation**: [developers.cloudflare.com/pages](https://developers.cloudflare.com/pages)
- **Community Forum**: [community.cloudflare.com](https://community.cloudflare.com)
- **GitHub Issues**: Report issues in the repository

## Next Steps

After successful deployment:

1. Deploy smart contracts to Sepolia testnet
2. Update contract addresses in environment variables
3. Test all application features
4. Configure custom domain (if needed)
5. Set up monitoring and analytics
6. Optimize performance settings
7. Configure security headers

## Advanced Features

### 1. Edge Functions

```javascript
// functions/api/hello.js
export async function onRequest() {
  return new Response(JSON.stringify({ message: "Hello from Cloudflare Pages!" }), {
    headers: { "Content-Type": "application/json" },
  });
}
```

### 2. KV Storage

```javascript
// functions/api/data.js
export async function onRequest(context) {
  const { env } = context;
  
  // Store data in KV
  await env.MY_KV_NAMESPACE.put("key", "value");
  
  // Retrieve data from KV
  const value = await env.MY_KV_NAMESPACE.get("key");
  
  return new Response(value);
}
```

### 3. Durable Objects

For stateful applications, you can use Durable Objects:

```javascript
// functions/api/state.js
export class State {
  constructor(state, env) {
    this.state = state;
    this.env = env;
  }

  async fetch(request) {
    // Handle stateful operations
    return new Response("Stateful response");
  }
}

export default {
  async fetch(request, env) {
    const id = env.STATE.idFromName("vault-state");
    const obj = env.STATE.get(id);
    return obj.fetch(request);
  },
};
```

---

**Note**: Cloudflare Pages offers excellent performance with its global CDN and built-in security features, making it an ideal choice for Web3 applications that need fast loading times worldwide.
