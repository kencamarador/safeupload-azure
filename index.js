const express = require('express');
const multer = require('multer');
const azure = require('azure-storage');
const app = express();
const port = 3000;


 
//Retrieval of Secrets from Keyvault
const { DefaultAzureCredential } = require("@azure/identity");
const { SecretClient } = require("@azure/keyvault-secrets");
const credential = new DefaultAzureCredential();
const vaultName = "blob-nodejs";
const url = `https://blob-nodejs.vault.azure.net`;
const secretClient = new SecretClient(url, credential);
const storageAccountNameSecretName = "Storage-Account-Name";
const storageAccountKeySecretName = "storage-account-key";
const containerNameSecretName = "container";
let blobService; 

async function main() {
  try {
    const storageAccountName = (await secretClient.getSecret(storageAccountNameSecretName)).value;
    const storageAccountKey = (await secretClient.getSecret(storageAccountKeySecretName)).value;

    blobService = azure.createBlobService(storageAccountName, storageAccountKey);

  } catch (error) {
    console.error("Error retrieving secrets from Azure Key Vault:", error);
  }
}

main();

// Set up the storage for uploaded files
const storage = multer.memoryStorage(); // Store files in memory

const upload = multer({ storage });

// Set up a route for index.html
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/index.html');
});

// Handle file upload
app.post('/upload', upload.single('file'), async (req, res) => {
  if (!blobService) {
    res.status(500).send('Blob service not initialized');
    return;
  }

  try {
    const containerName = (await secretClient.getSecret(containerNameSecretName)).value;
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
  } catch (error) {
    console.error("Error retrieving container name from Azure Key Vault:", error);
    res.status(500).send('Error retrieving container name from Azure Key Vault');
  }
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});