# GitHub Pages Deployment Guide for Vault Guard Cloak

This guide provides step-by-step instructions for deploying the Vault Guard Cloak application to GitHub Pages.

## 📋 Prerequisites

- GitHub account
- Repository with the Vault Guard Cloak code
- Git installed locally
- Node.js and npm installed

## 🚀 Deployment Steps

### Step 1: Prepare Your Repository

1. **Ensure your code is in a GitHub repository**
   ```bash
   # If not already done, initialize and push to GitHub
   git init
   git add .
   git commit -m "Initial commit"
   git branch -M main
   git remote add origin https://github.com/yourusername/vault-guard-cloak.git
   git push -u origin main
   ```

### Step 2: Configure GitHub Pages

1. **Go to your repository on GitHub**
   - Navigate to `https://github.com/yourusername/vault-guard-cloak`

2. **Access Settings**
   - Click on the "Settings" tab in your repository

3. **Navigate to Pages**
   - Scroll down to the "Pages" section in the left sidebar
   - Click on "Pages"

4. **Configure Source**
   - Under "Source", select "GitHub Actions"
   - This will allow you to use custom build workflows

### Step 3: Create GitHub Actions Workflow

1. **Create workflow directory**
   ```bash
   mkdir -p .github/workflows
   ```

2. **Create deployment workflow file**
   ```bash
   touch .github/workflows/deploy.yml
   ```

3. **Add the following content to `.github/workflows/deploy.yml`**
   ```yaml
   name: Deploy to GitHub Pages

   on:
     push:
       branches: [ main ]
     pull_request:
       branches: [ main ]

   permissions:
     contents: read
     pages: write
     id-token: write

   concurrency:
     group: "pages"
     cancel-in-progress: false

   jobs:
     build:
       runs-on: ubuntu-latest
       steps:
         - name: Checkout
           uses: actions/checkout@v4

         - name: Setup Node.js
           uses: actions/setup-node@v4
           with:
             node-version: '18'
             cache: 'npm'

         - name: Install dependencies
           run: npm ci

         - name: Build
           run: npm run build
           env:
             NODE_ENV: production

         - name: Setup Pages
           uses: actions/configure-pages@v4

         - name: Upload artifact
           uses: actions/upload-pages-artifact@v3
           with:
             path: './dist'

     deploy:
       environment:
         name: github-pages
         url: ${{ steps.deployment.outputs.page_url }}
       runs-on: ubuntu-latest
       needs: build
       steps:
         - name: Deploy to GitHub Pages
           id: deployment
           uses: actions/deploy-pages@v4
   ```

### Step 4: Configure Vite for GitHub Pages

1. **Update `vite.config.ts`**
   ```typescript
   import { defineConfig } from "vite";
   import react from "@vitejs/plugin-react-swc";
   import path from "path";

   // https://vitejs.dev/config/
   export default defineConfig({
     base: '/vault-guard-cloak/', // Replace with your repository name
     server: {
       host: "::",
       port: 8080,
     },
     plugins: [react()],
     resolve: {
       alias: {
         "@": path.resolve(__dirname, "./src"),
       },
     },
     build: {
       outDir: 'dist',
       assetsDir: 'assets',
       sourcemap: false,
       minify: 'terser',
       rollupOptions: {
         output: {
           manualChunks: {
             vendor: ['react', 'react-dom'],
             wallet: ['@rainbow-me/rainbowkit', 'wagmi', 'viem'],
           },
         },
       },
     },
   });
   ```

2. **Update `package.json` scripts**
   ```json
   {
     "scripts": {
       "dev": "vite",
       "build": "tsc && vite build",
       "preview": "vite preview",
       "deploy": "npm run build && gh-pages -d dist"
     }
   }
   ```

### Step 5: Environment Variables

1. **Create `.env.production` file**
   ```env
   VITE_CHAIN_ID=11155111
   VITE_RPC_URL=https://sepolia.infura.io/v3/b18fb7e6ca7045ac83c41157ab93f990
   VITE_WALLET_CONNECT_PROJECT_ID=2ec9743d0d0cd7fb94dee1a7e6d33475
   VITE_INFURA_API_KEY=b18fb7e6ca7045ac83c41157ab93f990
   VITE_VAULT_CONTRACT_ADDRESS=<DEPLOYED_CONTRACT_ADDRESS>
   VITE_FHE_CONTRACT_ADDRESS=<FHE_CONTRACT_ADDRESS>
   ```

2. **Update GitHub Actions workflow to use environment variables**
   ```yaml
   - name: Build
     run: npm run build
     env:
       NODE_ENV: production
       VITE_CHAIN_ID: 11155111
       VITE_RPC_URL: https://sepolia.infura.io/v3/b18fb7e6ca7045ac83c41157ab93f990
       VITE_WALLET_CONNECT_PROJECT_ID: 2ec9743d0d0cd7fb94dee1a7e6d33475
       VITE_INFURA_API_KEY: b18fb7e6ca7045ac83c41157ab93f990
   ```

### Step 6: Deploy

1. **Commit and push your changes**
   ```bash
   git add .
   git commit -m "Add GitHub Pages deployment configuration"
   git push origin main
   ```

2. **Monitor deployment**
   - Go to your repository on GitHub
   - Click on the "Actions" tab
   - Watch the deployment workflow run

3. **Access your deployed site**
   - Once deployment is complete, your site will be available at:
   - `https://yourusername.github.io/vault-guard-cloak/`

## 🔧 Advanced Configuration

### Custom Domain (Optional)

1. **Add a `CNAME` file to your repository**
   ```bash
   echo "yourdomain.com" > public/CNAME
   ```

2. **Configure DNS**
   - Add a CNAME record pointing to `yourusername.github.io`

3. **Update GitHub Pages settings**
   - In repository settings > Pages
   - Add your custom domain

### Performance Optimization

1. **Enable GitHub Pages caching**
   ```yaml
   - name: Cache dependencies
     uses: actions/cache@v3
     with:
       path: ~/.npm
       key: ${{ runner.os }}-node-${{ hashFiles('**/package-lock.json') }}
       restore-keys: |
         ${{ runner.os }}-node-
   ```

2. **Optimize build output**
   ```typescript
   // vite.config.ts
   export default defineConfig({
     build: {
       rollupOptions: {
         output: {
           manualChunks: {
             vendor: ['react', 'react-dom'],
             wallet: ['@rainbow-me/rainbowkit', 'wagmi', 'viem'],
             ui: ['@radix-ui/react-dialog', '@radix-ui/react-select'],
           },
         },
       },
     },
   });
   ```

## 🚨 Troubleshooting

### Common Issues

1. **Build fails with "base" path error**
   - Ensure the `base` path in `vite.config.ts` matches your repository name
   - Repository name should be lowercase and match exactly

2. **Assets not loading**
   - Check that all asset paths are relative
   - Verify the `base` configuration in Vite

3. **Environment variables not working**
   - Ensure variables are prefixed with `VITE_`
   - Check that they're properly set in the GitHub Actions workflow

4. **Deployment stuck**
   - Check the Actions tab for error messages
   - Ensure all dependencies are properly installed

### Debug Steps

1. **Check build locally**
   ```bash
   npm run build
   npm run preview
   ```

2. **Verify file structure**
   ```bash
   ls -la dist/
   ```

3. **Check GitHub Actions logs**
   - Go to Actions tab in your repository
   - Click on the failed workflow
   - Review the error messages

## 📊 Performance Monitoring

### GitHub Pages Analytics

1. **Enable GitHub Pages analytics**
   - Go to repository Settings > Pages
   - Enable "GitHub Pages analytics"

2. **Monitor performance**
   - Check the Insights tab for traffic data
   - Monitor build times in Actions

### External Analytics

1. **Google Analytics**
   ```typescript
   // Add to index.html
   <script async src="https://www.googletagmanager.com/gtag/js?id=GA_MEASUREMENT_ID"></script>
   <script>
     window.dataLayer = window.dataLayer || [];
     function gtag(){dataLayer.push(arguments);}
     gtag('js', new Date());
     gtag('config', 'GA_MEASUREMENT_ID');
   </script>
   ```

2. **Vercel Analytics**
   ```bash
   npm install @vercel/analytics
   ```

## 🔒 Security Considerations

### Content Security Policy

1. **Add CSP headers**
   ```html
   <meta http-equiv="Content-Security-Policy" content="default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://www.googletagmanager.com; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; connect-src 'self' https://sepolia.infura.io https://1rpc.io;">
   ```

### HTTPS Enforcement

1. **GitHub Pages automatically provides HTTPS**
   - All GitHub Pages sites are served over HTTPS
   - No additional configuration needed

## 📈 Scaling Considerations

### GitHub Pages Limitations

- **Repository size**: 1GB limit
- **Bandwidth**: 100GB/month for private repos, unlimited for public
- **Build time**: 10 minutes per build
- **Concurrent builds**: 20 per repository

### Optimization Strategies

1. **Reduce bundle size**
   ```bash
   npm install --save-dev rollup-plugin-visualizer
   ```

2. **Enable compression**
   ```typescript
   // vite.config.ts
   export default defineConfig({
     build: {
       rollupOptions: {
         output: {
           manualChunks: {
             vendor: ['react', 'react-dom'],
             wallet: ['@rainbow-me/rainbowkit', 'wagmi', 'viem'],
           },
         },
       },
     },
   });
   ```

## 🎯 Best Practices

### Repository Management

1. **Keep repository clean**
   - Use `.gitignore` to exclude unnecessary files
   - Regular cleanup of old branches

2. **Documentation**
   - Keep README.md updated
   - Document deployment process
   - Include troubleshooting guides

### Performance

1. **Optimize images**
   - Use WebP format when possible
   - Compress images before adding to repository

2. **Minimize dependencies**
   - Regular audit of package.json
   - Remove unused dependencies

## 🚀 Next Steps

After successful deployment:

1. **Test all functionality**
   - Wallet connection
   - Contract interactions
   - FHE operations

2. **Monitor performance**
   - Check loading times
   - Monitor error rates

3. **Update documentation**
   - Add deployment link to README
   - Document any custom configurations

## 📞 Support

If you encounter issues:

1. **Check GitHub Actions logs**
2. **Review this guide**
3. **Search GitHub Pages documentation**
4. **Check Vite documentation for build issues**

---

**Deployment URL**: `https://yourusername.github.io/vault-guard-cloak/`

**Repository**: `https://github.com/yourusername/vault-guard-cloak`

**Actions**: `https://github.com/yourusername/vault-guard-cloak/actions`
