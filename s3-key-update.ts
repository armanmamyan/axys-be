const { S3Client, PutObjectCommand } = require('@aws-sdk/client-s3');
const dotenv = require('dotenv');
dotenv.config();

const fs = require('fs');

const s3 = new S3Client({
  region: process.env.BUCKETEER_AWS_REGION,
  credentials: {
    accessKeyId: process.env.BUCKETEER_AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.BUCKETEER_AWS_SECRET_ACCESS_KEY,
  },
});

const uploadFolder = async () => {
  const fileContent = fs.readFileSync('key.tar.gz');

  const params = {
    Bucket: process.env.BUCKETEER_BUCKET_NAME,
    Key: 'key/key.tar.gz',
    Body: fileContent,
  };

  try {
    const command = new PutObjectCommand(params);
    const response = await s3.send(command);
    console.log('Folder uploaded successfully:', response);
  } catch (err) {
    console.error('Error uploading folder:', err);
  }
};

uploadFolder();
