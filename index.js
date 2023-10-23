const express = require('express');
const multer = require('multer');
const azure = require('azure-storage');
const app = express();
const port = process.env.PORT || 3000;
require('dotenv').config(); // Load the .env file

// Configure Azure Blob Storage using environment variables
const storageAccountName = process.env.STORAGE_ACCOUNT_NAME;
const storageAccountKey = process.env.STORAGE_ACCOUNT_KEY;

const blobService = azure.createBlobService(storageAccountName, storageAccountKey);

// Set up the storage for uploaded files
const storage = multer.memoryStorage(); // Store files in memory

const upload = multer({ storage });

// Set up a route to display an HTML form for file upload
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/index.html');
});

// Handle file upload
app.post('/upload', upload.single('file'), (req, res) => {
  const containerName = process.env.CONTAINER_NAME;
  const blobName = req.file.originalname;
  const blobStream = blobService.createWriteStreamToBlockBlob(containerName, blobName);

  blobStream.on('error', (error) => {
    console.error(error);
    res.status(500).send('Error uploading the file to Azure Blob Storage');
  });

  blobStream.on('finish', () => {
    res.send('File uploaded successfully to Azure Blob Storage');
  });

  blobStream.end(req.file.buffer);
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
