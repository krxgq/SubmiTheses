// Quick test to verify S3 configuration
require('dotenv').config();
const { S3Client } = require('@aws-sdk/client-s3');
const { getSignedUrl } = require('@aws-sdk/s3-request-presigner');
const { PutObjectCommand } = require('@aws-sdk/client-s3');

console.log('Testing S3 configuration...\n');

console.log('Environment variables:');
console.log('AWS_REGION:', process.env.AWS_REGION);
console.log('AWS_ACCESS_KEY_ID:', process.env.AWS_ACCESS_KEY_ID ? '✓ Set' : '✗ Missing');
console.log('AWS_SECRET_ACCESS_KEY:', process.env.AWS_SECRET_ACCESS_KEY ? '✓ Set' : '✗ Missing');
console.log('AWS_S3_BUCKET_ATTACHMENTS:', process.env.AWS_S3_BUCKET_ATTACHMENTS);
console.log('');

const s3Client = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

async function test() {
  try {
    console.log('Creating test pre-signed URL...');
    
    const command = new PutObjectCommand({
      Bucket: process.env.AWS_S3_BUCKET_ATTACHMENTS,
      Key: 'test/test-file.txt',
      ContentType: 'text/plain',
    });
    
    const uploadUrl = await getSignedUrl(s3Client, command, {
      expiresIn: 300,
    });
    
    console.log('✓ SUCCESS! Generated pre-signed URL:');
    console.log(uploadUrl.substring(0, 100) + '...');
    console.log('\nRegion in URL:', uploadUrl.includes('eu-central-1') ? '✓ eu-central-1' : '✗ Wrong region');
    
  } catch (error) {
    console.error('✗ ERROR:', error.message);
    console.error('\nFull error:', error);
  }
}

test();
