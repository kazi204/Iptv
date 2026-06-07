# 🚀 StreamZone — SPA & Proxy Server Deployment Guide

This guide details how to deploy the **StreamZone** frontend application and its supporting CORS bypass stream server onto **Vercel**'s free global edge network.

---

## 🗺️ Deployment Overview

```
                        ┌───────────────────────────────┐
                        │      Client Browser           │
                        └───────┬──────────────┬────────┘
                                │              │ (Proxied HLS Requests)
        (Renders SPA)           │              ▼
    ┌───────────────────────────▼───┐    ┌───────────────────────────────┐
    │  StreamZone Frontend (Vercel) │    │  CORS-Bypass Server / Proxy   │
    └───────────────────────────────┘    └──────────────┬────────────────┘
                                                        │ (Fetches Stream)
                                                        ▼
                                                 [ IPTV Live Feeds ]
```

---

## 1. Deploy Frontend SPA (Vercel)

The StreamZone frontend is a React application built with TypeScript, Vite, and Tailwind CSS.

### Step-by-by Guide:
1. **Push your code to GitHub**, GitLab, or Bitbucket.
2. Sign in to [Vercel](https://vercel.com/) and click **Add New Project**.
3. Import your StreamZone repository.
4. Set the build configurations:
   - **Framework Preset**: `Vite` or `Other`.
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
5. Click **Deploy**. Vercel will build your static SPA, compile assets, and provide a secure production domain (e.g. `streamzone.vercel.app`).

---

## 2. Deploy CORS-Bypass Proxy Server (Vercel Serverless)

Many IPTV source streams (`.m3u` contents & `.m3u8` streams) have strict **CORS** restrictions. This app contains dynamic latency testers & players. To avoid browser policy violations, you can route requests through a lightweight Node.js Serverless Proxy.

### Option A: Standard Node Proxy (Vercel Serverless Function)
You can define a simple backend function inside your project directory at `/api/proxy.js`:

```javascript
// api/proxy.js
import axios from 'axios';

export default async function handler(req, res) {
  // Allow all origins (CORS Headers)
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  const { url } = req.query;
  if (!url) {
    return res.status(400).json({ error: "Missing Target URL parameter" });
  }

  try {
    const response = await axios.get(url, { responseType: 'stream' });
    response.data.pipe(res);
  } catch (err) {
    res.status(500).json({ error: "Failed fetching stream resources", details: err.message });
  }
}
```

### Option B: Dedicated Express Server
Alternatively, host a standalone Express instance on Render or Vercel, which accepts queries in the format:  
`https://your-proxy.vercel.app/proxy?url=<Target_HLS_Stream>`

---

## 3. Link Frontend to Proxy Via Environment Variables

Once compile/deploy flows on the backend are complete:

1. Copy your proxy endpoint URL (e.g., `https://streamzone-proxy.vercel.app/`).
2. Navigate to your **Vercel Project Settings** on the **Frontend Project Dashboard**.
3. Go to the **Environment Variables** tab.
4. Configure the following variable:
   - **Key**: `VITE_PROXY_URL`
   - **Value**: `https://streamzone-proxy.vercel.app` (your backend base URL)
5. **Re-deploy** your frontend to apply the newly baked variable!

---

## ⚙️ Why is this configuration essential?
- **Routing Safety**: The included `/vercel.json` ensures that deep-linking routes (e.g., `https://streamzone.vercel.app/watch/some-id`) automatically fallback to `index.html`, letting React Router resolve views on the client side smoothly.
- **Mixed Content Protection**: Modern browsers block HTTP streams when running on an HTTPS site. Hosting a secure HTTPS proxy bypasses mixed-content warning parameters completely!
