# Deployment Guide for Daily Quest App

Since you mentioned you already have hosting, I'll assume you are using a **Virtual Private Server (VPS)** (like DigitalOcean, Linode, AWS EC2, or a private server) running Linux (Ubuntu/Debian).

If you are using **Shared Hosting** (cPanel, HostGator, etc.) without Node.js support, you will need to use the [Static Export](#option-2-static-export-for-shared-hosting) method.

---

## Option 1: Node.js Server (Recommended for VPS)

This method runs the full Next.js server, allowing for Server-Side Rendering (SSR) and API routes.

### 1. Prepare your Server
Connect to your server via SSH:
```bash
ssh user@your-server-ip
```

**Install Node.js (Version 18+ required):**
```bash
# Using NVM (Node Version Manager) is recommended
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.7/install.sh | bash
source ~/.bashrc
nvm install 20
nvm use 20
```

**Install PM2 (Process Manager):**
PM2 keeps your app running in the background and restarts it if it crashes.
```bash
npm install -g pm2
```

### 2. Get Your Code
Clone your repository to the server:
```bash
git clone https://github.com/yourusername/daily-quest-app.git
cd daily-quest-app
```
*(Or upload your files via FTP/SCP if you don't use Git on the server)*

### 3. Install & Build
```bash
npm install
npm run build
```

### 4. Start the Application
Start the app using PM2:
```bash
pm2 start npm --name "daily-quest" -- start
```

Save the PM2 list so it restarts on reboot:
```bash
pm2 save
pm2 startup
# Follow the command output by 'pm2 startup'
```

Your app is now running on `http://localhost:3000`.

### 5. Expose to the Web (Nginx Reverse Proxy)
You shouldn't expose port 3000 directly. Use Nginx to forward traffic from port 80.

**Install Nginx:**
```bash
sudo apt update
sudo apt install nginx
```

**Configure Nginx:**
Create a config file:
```bash
sudo nano /etc/nginx/sites-available/daily-quest
```

Paste this content (replace `your-domain.com` with your actual domain or IP):
```nginx
server {
    listen 80;
    server_name your-domain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

**Enable the site:**
```bash
sudo ln -s /etc/nginx/sites-available/daily-quest /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

---

## Option 2: Static Export (For Shared Hosting / Static Hosts)

If your hosting **does not support Node.js**, you can export the app as static HTML/CSS/JS files.

### 1. Update `next.config.ts`
Open `next.config.ts` and add `output: "export"`:

```typescript
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "export",
  // Optional: Disable image optimization if using 'next/image' component
  // images: { unoptimized: true } 
};

export default nextConfig;
```

### 2. Build
Run the build command locally:
```bash
npm run build
```

This will create an `out/` folder in your project.

### 3. Upload
Upload the contents of the `out/` folder to the `public_html` or `www` folder of your hosting provider.

**Note:** Dynamic features that require a server (like API routes or `getServerSideProps`) will not work in this mode. Since your app uses Firebase (client-side), this should work fine for the most part.
