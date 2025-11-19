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
            max-width: 500px;
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

          .text-input {
            width: 100%;
            margin-top: 20px;
            padding: 12px;
            font-size: 15px;
            border-radius: 8px;
            border: 1px solid #bbb;
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
            opacity: 0.6;
            cursor: not-allowed;
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
          <h2>Upload Attachments</h2>

          <!-- Text Input -->
          <textarea id="messageBox" class="text-input" placeholder="Enter message here..."></textarea>

          <!-- File Upload Box -->
          <div class="file-box" onclick="document.getElementById('fileInput').click()">
            <span>Click to upload files</span>
          </div>

          <input id="fileInput" type="file" multiple />
          <div id="fileList"></div>

          <button class="submit-btn" id="submitBtn" disabled>Submit</button>

          <div class="success-box" id="successBox">
            ✔️ Attachments uploaded successfully!<br>
            You can now close this window.
          </div>
        </div>

        <script>
          let selectedFiles = []; // Actual File objects
          const fileInput = document.getElementById("fileInput");
          const fileList = document.getElementById("fileList");
          const submitBtn = document.getElementById("submitBtn");
          const messageBox = document.getElementById("messageBox");
          const successBox = document.getElementById("successBox");

          // Enable/disable submit button depending on attachments
          function updateSubmitButton() {
            if (selectedFiles.length > 0) {
              submitBtn.disabled = false;
              submitBtn.style.opacity = "1";
              submitBtn.style.cursor = "pointer";
            } else {
              submitBtn.disabled = true;
              submitBtn.style.opacity = "0.6";
              submitBtn.style.cursor = "not-allowed";
            }
          }

          // User selects files
          fileInput.addEventListener("change", () => {
            for (let file of fileInput.files) {
              selectedFiles.push(file);
            }
            renderFiles();
            updateSubmitButton();
          });

          // Remove file
          function removeFile(name) {
            selectedFiles = selectedFiles.filter(f => f.name !== name);
            renderFiles();
            updateSubmitButton();
          }

          // Render UI file list
          function renderFiles() {
            fileList.innerHTML = "";
            selectedFiles.forEach(file => {
              const item = document.createElement("div");
              item.className = "file-item";
              item.innerHTML = \`
                <span>\${file.name}</span>
                <button class="remove-btn" onclick="removeFile('\${file.name}')">✕</button>
              \`;
              fileList.appendChild(item);
            });
          }

          // Submit handler
          submitBtn.addEventListener("click", () => {
            const message = messageBox.value;
            const urlParams = new URLSearchParams(window.location.search);
            const aadObjectId = urlParams.get("aadObjectId");
            const ticketId = urlParams.get("ticketId");

            const formData = new FormData();
            formData.append("message", message);

            selectedFiles.forEach((file) => formData.append("attachments", file));
            formData.append("aadObjectId", aadObjectId);
            formData.append("ticketId", ticketId);

            // Disable button during upload
            submitBtn.disabled = true;
            submitBtn.style.opacity = "0.6";
            submitBtn.style.cursor = "not-allowed";
            submitBtn.innerText = "Uploading...";

            fetch("https://699361c7573b.ngrok-free.app/api/sendAttachments", {
              method: "POST",
              body: formData
            })
              .then(res => {
                return res.json();
              })
              .then(data => {
                console.log("Response:", data);

                // Show success box
                successBox.style.display = "block";
                setTimeout(() => {
                  successBox.style.opacity = "1";
                }, 50);

                // Reset inputs
                messageBox.value = "";
                selectedFiles = [];
                fileList.innerHTML = "";

                // Disable button again
                updateSubmitButton();

                submitBtn.innerText = "Submit";
              })
              .catch(err => {
                console.error(err);
                // Show success box
                successBox.style.display = "block";
                setTimeout(() => {
                  successBox.style.opacity = "1";
                }, 50);

                // Reset inputs
                messageBox.value = "";
                selectedFiles = [];
                fileList.innerHTML = "";

                // Disable button again
                updateSubmitButton();

                submitBtn.innerText = "Submit";
              });
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
