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
      "connect-src 'self' http://localhost:3978 https://699361c7573b.ngrok-free.app https://*.microsoft.com https://*.teams.microsoft.com https://*.office.com;",
      "frame-ancestors 'self' https://*.microsoft.com https://*.office.com https://*.teams.microsoft.com https://*.skype.com https://*.cloud.microsoft;",
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


app.get('/webview', (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html>
      <head>
        <title>Attach a file</title>
        <meta charset="UTF-8" />

        <style>
          body {
            font-family: Arial, sans-serif;
            padding: 40px;
            background: #f7f9fc;
            color: #333;
          }

          .container {
            max-width: 500px;
            margin: auto;
            background: #fff;
            padding: 30px;
            border-radius: 12px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.1);
          }

          h2 {
            margin-bottom: 8px;
          }

          .upload-box {
            margin-top: 20px;
            padding: 35px;
            border: 2px dashed #ccc;
            border-radius: 12px;
            background: #fafafa;
            text-align: center;
            cursor: pointer;
          }

          .upload-box img {
            width: 70px;
            opacity: 0.8;
          }

          .upload-box-text {
            margin-top: 10px;
            color: #777;
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
            color: #d00000;
            font-size: 20px;
            cursor: pointer;
          }

          .text-input {
            width: 100%;
            margin-top: 20px;
            padding: 12px;
            font-size: 15px;
            border-radius: 8px;
            border: 1px solid #bbb;
          }

          .button-row {
            display: flex;
            justify-content: flex-end;
            gap: 12px;
            margin-top: 25px;
          }

          .cancel-btn {
            background: transparent;
            border: none;
            color: #555;
            font-size: 16px;
            cursor: pointer;
          }

          .upload-btn {
            padding: 10px 20px;
            background: #000;
            color: #fff;
            border: none;
            border-radius: 10px;
            font-size: 16px;
            cursor: pointer;
            display: flex;
            align-items: center;
            gap: 6px;
          }

          .success-box {
            margin-top: 20px;
            padding: 15px;
            background: #d4edda;
            color: #155724;
            border-radius: 8px;
            border: 1px solid #c3e6cb;
            display: none;
            opacity: 0;
            transition: opacity 0.6s;
          }
        </style>
      </head>

      <body>
        <div class="container">
          <h2>Attach files</h2>
          <p style="color:#777; margin-top:-5px;">Select files to upload</p>

          <div class="upload-box" onclick="document.getElementById('fileInput').click()">
            <div class="upload-box-text">Drag and drop or attach a file</div>
          </div>

          <input id="fileInput" type="file" multiple />
          <div id="fileList"></div>

          <label style="margin-top:20px; display:block;">Optional message to this attachment</label>
          <textarea id="messageBox" class="text-input" placeholder="Add message here"></textarea>

          <div class="button-row">
            <button class="cancel-btn" onclick="cancelUpload()">Cancel</button>
            <button class="upload-btn" id="submitBtn" disabled>📤 Upload</button>
          </div>

          <div class="success-box" id="successBox">
            ✔️ Attachments uploaded successfully!<br>
            You can now close this window.
          </div>
        </div>

        <script>
          let selectedFiles = [];
          const fileInput = document.getElementById("fileInput");
          const fileList = document.getElementById("fileList");
          const submitBtn = document.getElementById("submitBtn");
          const successBox = document.getElementById("successBox");
          const messageBox = document.getElementById("messageBox");

          function updateSubmitButton() {
            submitBtn.disabled = selectedFiles.length === 0;
          }

          fileInput.addEventListener("change", () => {
            for (let file of fileInput.files) selectedFiles.push(file);
            renderFiles();
            updateSubmitButton();
          });

          function removeFile(name) {
            selectedFiles = selectedFiles.filter(f => f.name !== name);
            renderFiles();
            updateSubmitButton();
          }

          function renderFiles() {
            fileList.innerHTML = '';
            selectedFiles.forEach(file => {
              fileList.innerHTML += \`
                <div class="file-item">
                  <span>\${file.name}</span>
                  <button class="remove-btn" onclick="removeFile('\${file.name}')">❌</button>
                </div>
              \`;
            });
          }

          function cancelUpload() {
            selectedFiles = [];
            fileList.innerHTML = "";
            messageBox.value = "";
            updateSubmitButton();
          }

          submitBtn.addEventListener("click", () => {
            const urlParams = new URLSearchParams(window.location.search);
            const aadObjectId = urlParams.get("aadObjectId");
            const ticketId = urlParams.get("ticketId");
            const message = messageBox.value;

            const formData = new FormData();
            formData.append("message", message);
            formData.append("aadObjectId", aadObjectId);
            formData.append("ticketId", ticketId);

            selectedFiles.forEach(f => formData.append("attachments", f));

            submitBtn.innerText = "Uploading...";
            submitBtn.disabled = true;

            fetch("https://699361c7573b.ngrok-free.app/api/sendAttachments", { method: "POST", body: formData })
              .then(r => r.json())
              .then(() => {
                successBox.style.display = "block";
                setTimeout(() => successBox.style.opacity = "1", 50);

                selectedFiles = [];
                fileList.innerHTML = "";
                messageBox.value = "";
                updateSubmitButton();
                submitBtn.innerText = "📤 Upload";
              })
              .catch(() => {
                successBox.style.display = "block";
                setTimeout(() => successBox.style.opacity = "1", 50);
                selectedFiles = [];
                fileList.innerHTML = "";
                messageBox.value = "";
                updateSubmitButton();
                submitBtn.innerText = "📤 Upload";
              });
          });
        </script>
      </body>
    </html>
  `);
});

app.listen(PORT, () => {
  console.log(`Attachment backend running on http://localhost:${PORT}`);
});