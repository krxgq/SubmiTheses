require('dotenv').config();
const { S3Client, PutObjectCommand } = require('@aws-sdk/client-s3');
const { getSignedUrl } = require('@aws-sdk/s3-request-presigner');
const https = require('https');
const http = require('http');

const s3Client = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

async function testUpload() {
  try {
    // Step 1: Generate pre-signed URL
    console.log('Step 1: Generating pre-signed URL...');
    const command = new PutObjectCommand({
      Bucket: process.env.AWS_S3_BUCKET_ATTACHMENTS,
      Key: 'test/upload-test.txt',
      ContentType: 'text/plain',
    });
    
    const uploadUrl = await getSignedUrl(s3Client, command, { expiresIn: 300 });
    console.log('✓ Pre-signed URL generated\n');
    
    // Step 2: Try to upload using the pre-signed URL
    console.log('Step 2: Testing upload to S3...');
    const testData = 'Hello from backend test!';
    
    await new Promise((resolve, reject) => {
      const url = new URL(uploadUrl);
      const protocol = url.protocol === 'https:' ? https : http;
      
      const req = protocol.request(uploadUrl, {
        method: 'PUT',
        headers: {
          'Content-Type': 'text/plain',
          'Content-Length': Buffer.byteLength(testData),
        }
      }, (res) => {
        console.log('Response status:', res.statusCode);
        console.log('Response headers:', res.headers);
        
        if (res.statusCode === 200) {
          console.log('✓ SUCCESS! File uploaded to S3');
          resolve();
        } else {
          console.log('✗ FAILED! Status:', res.statusCode);
          res.on('data', (chunk) => console.log('Error response:', chunk.toString()));
          reject(new Error(`Upload failed with status ${res.statusCode}`));
        }
      });
      
      req.on('error', (error) => {
        console.error('✗ Request error:', error.message);
        reject(error);
      });
      
      req.write(testData);
      req.end();
    });
    
  } catch (error) {
    console.error('\n✗ ERROR:', error.message);
    if (error.code) console.error('Error code:', error.code);
  }
}

testUpload();
