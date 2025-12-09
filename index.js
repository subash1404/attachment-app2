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
            <svg xmlns="http://www.w3.org/2000/svg" width="74" height="69" viewBox="0 0 74 69" fill="none">
            <g opacity="0.5">
            <path d="M12.5898 52.4152V39.238L61.1749 38.9355V46.9546V49.2591V52.7866L60.6105 54.9736L59.1483 57.2073L54.7583 59.7621L45.7428 64.3414L40.6364 67.1851C40.6364 67.1851 37.9645 67.9823 37.7459 67.9133C37.5709 67.858 33.8916 67.4229 33.251 67.1851L32.3403 66.7485L22.2431 61.3984L17.063 58.6871L14.7989 57.2073C14.7989 57.2073 12.7984 54.7729 12.5898 53.4262V52.4152Z" fill="#D1DAFC"/>
            <path d="M12.5234 39.7923V48.5555V50.8933C12.5234 51.5074 12.592 52.1196 12.7279 52.7184L12.7574 52.8487C12.8889 53.4283 13.0934 53.9924 13.3632 54.5219C13.6844 55.1524 14.0995 55.7351 14.5912 56.2438C15.098 56.7681 15.6823 57.2115 16.3237 57.5586L19.1364 59.0805L23.7194 61.5662L30.5035 65.1395L33.1231 66.4993C33.6369 66.766 34.1742 66.985 34.728 67.1536L34.9674 67.2265C35.4425 67.3711 35.9316 67.4654 36.4265 67.5078C37.1345 67.5685 37.8518 67.5215 38.5462 67.3701C39.186 67.2307 39.8074 67.0031 40.3855 66.6955L42.725 65.4502L48.1626 62.5502L54.0404 59.4948L57.2252 57.7858L57.8999 57.3668C58.1905 57.1863 58.467 56.9841 58.727 56.7618C59.0324 56.5007 59.314 56.2129 59.5683 55.9018L59.6181 55.8409C59.8917 55.5063 60.1364 55.1491 60.3496 54.7732L60.5221 54.469L60.6964 54.0347C60.8609 53.6247 60.9864 53.2002 61.0714 52.7668C61.159 52.3202 61.2031 51.8662 61.2031 51.4111V50.3377V48.8136L61.242 46.3167V42.5263L60.9809 38.9758C60.9809 38.7301 60.7932 38.5252 60.5485 38.5036L60.0483 38.4596L12.5234 39.0603" stroke="black" stroke-linecap="round" stroke-linejoin="round"/>
            <path d="M6.12598 15.8789C3.60461 17.3765 3.65461 20.0459 6.23004 21.4213L46.3658 42.8546C48.2928 43.8837 51.0388 43.8386 52.9598 42.7459L67.2749 34.6027C69.8944 33.1126 69.8674 30.3737 67.2196 28.9878L26.3798 7.61264C24.4192 6.5866 21.6429 6.66191 19.7379 7.79328L6.12598 15.8789Z" fill="#D1DAFC" stroke="black"/>
            <path d="M67.6987 16.109C70.42 17.5422 70.5222 20.3103 67.9071 21.7545L26.4564 44.6419C24.3388 45.8111 21.225 45.6442 19.3178 44.259L5.05777 33.9008C2.85125 32.298 3.17604 29.7626 5.74762 28.5186L47.1881 8.475C49.0508 7.57407 51.5829 7.62284 53.4293 8.59514L67.6987 16.109Z" fill="#F2F5FF" stroke="black"/>
            <mask id="path-5-inside-1_2774_162745" fill="white">
            <path d="M60.5726 25.456C60.9256 25.6408 60.9313 26.1441 60.5825 26.3367L37.7436 38.9483C37.5953 39.0302 37.4157 39.0315 37.2663 38.9517L12.4717 25.7107C12.111 25.5181 12.1214 24.9975 12.4895 24.8195L36.6201 13.1482C36.7626 13.0792 36.9294 13.0819 37.0697 13.1553L60.5726 25.456Z"/>
            </mask>
            <path d="M60.5726 25.456C60.9256 25.6408 60.9313 26.1441 60.5825 26.3367L37.7436 38.9483C37.5953 39.0302 37.4157 39.0315 37.2663 38.9517L12.4717 25.7107C12.111 25.5181 12.1214 24.9975 12.4895 24.8195L36.6201 13.1482C36.7626 13.0792 36.9294 13.0819 37.0697 13.1553L60.5726 25.456Z" fill="#D1DAFC"/>
            <path d="M36.6201 13.1482L36.1847 12.2479L36.6201 13.1482ZM37.0697 13.1553L36.606 14.0413L37.0697 13.1553ZM12.4895 24.8195L12.0541 23.9193L12.4895 24.8195ZM37.7436 38.9483L38.227 39.8237L37.7436 38.9483ZM37.2663 38.9517L36.7953 39.8338L37.2663 38.9517ZM60.5825 26.3367L60.0991 25.4613L60.5825 26.3367ZM60.5726 25.456L61.0363 24.57L60.5726 25.456ZM60.5825 26.3367L60.0991 25.4613L37.2602 38.0729L37.7436 38.9483L38.227 39.8237L61.0659 27.2121L60.5825 26.3367ZM37.2663 38.9517L37.7374 38.0696L12.9427 24.8286L12.4717 25.7107L12.0006 26.5928L36.7953 39.8338L37.2663 38.9517ZM12.4895 24.8195L12.9249 25.7197L37.0555 14.0484L36.6201 13.1482L36.1847 12.2479L12.0541 23.9193L12.4895 24.8195ZM37.0697 13.1553L36.606 14.0413L60.1089 26.342L60.5726 25.456L61.0363 24.57L37.5334 12.2693L37.0697 13.1553ZM36.6201 13.1482L37.0555 14.0484C36.913 14.1173 36.7462 14.1147 36.606 14.0413L37.0697 13.1553L37.5334 12.2693C37.1125 12.049 36.6123 12.0411 36.1847 12.2479L36.6201 13.1482ZM12.4717 25.7107L12.9427 24.8286C13.3034 25.0212 13.293 25.5417 12.9249 25.7197L12.4895 24.8195L12.0541 23.9193C10.9499 24.4534 10.9186 26.0149 12.0006 26.5928L12.4717 25.7107ZM37.7436 38.9483L37.2602 38.0729C37.4084 37.9911 37.588 37.9898 37.7374 38.0696L37.2663 38.9517L36.7953 39.8338C37.2434 40.0731 37.7822 40.0693 38.227 39.8237L37.7436 38.9483ZM60.5825 26.3367L61.0659 27.2121C62.1123 26.6343 62.0954 25.1243 61.0363 24.57L60.5726 25.456L60.1089 26.342C59.7559 26.1572 59.7503 25.6539 60.0991 25.4613L60.5825 26.3367Z" fill="black" mask="url(#path-5-inside-1_2774_162745)"/>
            <path d="M37.1523 38.9355V66.8223" stroke="black" stroke-linecap="round" stroke-linejoin="round"/>
            </g>
            </svg>
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
                  <button class="remove-btn" onclick="removeFile('\${file.name}')"><svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20" fill="none">
<path d="M15.25 4.9165V15.5415C15.25 16.5773 14.3942 17.4165 13.3592 17.4165H7.10917C6.07333 17.4165 5.25 16.5773 5.25 15.5415V4.9165" stroke="#333333" stroke-linecap="round" stroke-linejoin="round"/>
<path d="M16.5 4.91667H4" stroke="#333333" stroke-linecap="round" stroke-linejoin="round"/>
<path d="M8.58398 2.41667H11.9173" stroke="#333333" stroke-linecap="round" stroke-linejoin="round"/>
<path d="M11.9167 8.25V14.0833" stroke="#333333" stroke-linecap="round" stroke-linejoin="round"/>
<path d="M8.58268 14.0833V8.25" stroke="#333333" stroke-linecap="round" stroke-linejoin="round"/>
</svg></button>
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