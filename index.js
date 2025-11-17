// server.js
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 4000;

// --- CORS ---
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:3000'
}));

app.use((req, res, next) => {
  res.setHeader(
    "Content-Security-Policy",
    [
      "default-src 'self';",
      "script-src 'self' 'unsafe-inline';",
      "style-src 'self' 'unsafe-inline';",
      "img-src 'self' data: blob:;",
      "connect-src 'self';",

      // REQUIRED FOR TEAMS / M365
      "frame-ancestors 'self' https://*.microsoft.com https://*.office.com https://*.teams.microsoft.com https://*.skype.com https://*.cloud.microsoft;",

      // Allow iframe content
      "frame-src 'self' https:;",
      "object-src 'none';",
      "base-uri 'self';",
    ].join(" ")
  );
  next();
});


// --- Health Check ---
app.get('/api/health', (req, res) => res.json({ ok: true }));

// --- Simple HTML Page Endpoint ---
app.get('/webview', (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html>
      <head>
        <title>Attachment Web View</title>
        <meta charset="UTF-8" />
        <style>
          body {
            font-family: Arial;
            padding: 20px;
          }
        </style>
      </head>
      <body>
        <h2>Adaptive Card WebView Loaded!</h2>
        <p>This page is served from your Node backend.</p>
      </body>
    </html>
  `);
});

// --- Start Server ---
app.listen(PORT, () => {
  console.log(`Attachment backend running on http://localhost:${PORT}`);
});
