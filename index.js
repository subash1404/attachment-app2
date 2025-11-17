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

app.use(express.json());


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

app.post('/api/saveAttachmentNames', (req, res) => {
  console.log("Received attachment names:", req.body.attachments);

  res.json({ message: "Attachment names logged successfully", received: req.body.attachments });
});


// --- Simple HTML Page Endpoint ---
app.get('/webview', (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html>
      <head>
        <title>Upload Attachments</title>
        <meta charset="UTF-8" />
        <style>
          body {
            font-family: Arial, sans-serif;
            padding: 40px;
            background: #f7f9fc;
            color: #333;
          }

          .container {
            max-width: 460px;
            margin: auto;
            background: #fff;
            padding: 30px;
            border-radius: 12px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.1);
            text-align: center;
          }

          .file-box {
            margin-top: 20px;
            padding: 30px;
            border: 2px dashed #1a73e8;
            border-radius: 12px;
            background: #eef4ff;
            cursor: pointer;
          }

          #fileInput {
            display: none;
          }

          .file-item {
            padding: 10px;
            background: #f1f1f1;
            margin-top: 8px;
            border-radius: 6px;
            font-size: 15px;
            display: flex;
            justify-content: space-between;
            align-items: center;
          }

          .remove-btn {
            background: none;
            border: none;
            color: red;
            font-size: 18px;
            cursor: pointer;
          }

          .submit-btn {
            margin-top: 25px;
            padding: 12px;
            background: #1a73e8;
            color: #fff;
            border: none;
            border-radius: 8px;
            font-size: 16px;
            cursor: pointer;
            width: 100%;
          }
        </style>
      </head>

      <body>
        <div class="container">
          <h2>Upload Attachments</h2>
          <div class="file-box" onclick="document.getElementById('fileInput').click()">
            <span>Click to upload files</span>
          </div>

          <input id="fileInput" type="file" multiple />
          <div id="fileList"></div>

          <button class="submit-btn" id="submitBtn">Submit</button>
        </div>

        <script>
          let selectedFiles = [];
          const fileInput = document.getElementById("fileInput");
          const fileList = document.getElementById("fileList");
          const submitBtn = document.getElementById("submitBtn");

          // When user selects files
          fileInput.addEventListener("change", () => {
            for (let file of fileInput.files) {
              console.log("Selected file:", file.name);
              selectedFiles.push(file.name);
            }
            renderFiles();
          });

          // Remove file
          function removeFile(name) {
            selectedFiles = selectedFiles.filter(f => f !== name);
            renderFiles();
          }

          // Render file list
          function renderFiles() {
            fileList.innerHTML = "";
            selectedFiles.forEach(name => {
              const item = document.createElement("div");
              item.className = "file-item";
              item.innerHTML = \`
                <span>\${name}</span>
                <button class="remove-btn" onclick="removeFile('\${name}')">✕</button>
              \`;
              fileList.appendChild(item);
            });
          }

          // Handle submit
          submitBtn.addEventListener("click", () => {
            console.log("Submit clicked!");
            console.log("Files to send:", selectedFiles);

            fetch('/api/saveAttachmentNames', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ attachments: selectedFiles })
            })
            .catch(err => console.error("Error:", err));
          });

        </script>
      </body>
    </html>
  `);
});


// --- Start Server ---
app.listen(PORT, () => {
  console.log(`Attachment backend running on http://localhost:${PORT}`);
});
