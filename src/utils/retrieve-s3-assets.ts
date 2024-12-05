import { S3Client, GetObjectCommand } from '@aws-sdk/client-s3';
import { extract } from 'tar';
import * as dotenv from 'dotenv';
import * as path from 'path';
import * as fs from 'fs';

dotenv.config();

const s3 = new S3Client({
  region: process.env.BUCKETEER_AWS_REGION,
  credentials: {
    accessKeyId: process.env.BUCKETEER_AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.BUCKETEER_AWS_SECRET_ACCESS_KEY,
  },
});

export const downloadAndExtractFolder = async (): Promise<{ signer: string; viewer: string }> => {
  const params = {
    Bucket: process.env.BUCKETEER_BUCKET_NAME,
    Key: process.env.KEY_FILENAME,
  };

  const tempDir = path.join('/tmp', 'key-temp');
  const tempFilePath = path.join(tempDir, 'key.tar.gz');
  const extractDir = path.join(tempDir, 'extracted');

  try {
    await fs.mkdirSync(tempDir, { recursive: true });
    await fs.mkdirSync(extractDir, { recursive: true });


    const command = new GetObjectCommand(params);
    const data = await s3.send(command);
    
    if (!data.Body) {
      throw new Error('Failed to retrieve file from S3');
    }

    const fileBuffer = await data.Body.transformToByteArray();
    fs.writeFileSync(tempFilePath, Buffer.from(fileBuffer));

    await extract({ file: tempFilePath, cwd: extractDir });

    const file1Path = path.join(extractDir, 'key', 'fireblocks_secret.key');
    const file2Path = path.join(extractDir, 'key', 'fireblocks-viewer_secret.key');

    return {
      signer: fs.readFileSync(file1Path, 'utf8'),
      viewer: fs.readFileSync(file2Path, 'utf8'),
    };
  } catch (err) {
    throw new Error(`Error downloading folder: ${err}`);
  } finally {
    fs.rmSync(tempDir, { recursive: true, force: true });
  }
};
