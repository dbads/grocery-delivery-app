import fs from 'fs';
import { S3 } from 'aws-sdk';
import multer from 'multer';

const bucketName = process.env.AWS_BUCKET_NAME;
const region = process.env.AWS_BUCKET_REGION;
const accessKeyId = process.env.AWS_ACCESS_KEY;
const secretAccessKey = process.env.AWS_SECRET_KEY;

const s3 = new S3({
  region,
  accessKeyId,
  secretAccessKey
});

async function uploadFile(file: any) {
  const fileStream = fs.createReadStream(file.path);

  let uploadResult;
  if (bucketName) {
    const uploadParams: S3.PutObjectRequest = {
      Bucket: bucketName,
      Body: fileStream,
      Key: file.filename,
    };
    uploadResult = await s3.upload(uploadParams).promise();
  }

  // delete file after uploading to s3
  fs.unlink(file.path, (err) => {
    if (err) throw new Error(err.message);
    console.log('file deleted');
  });

  return uploadResult;
}

// Function to generate a custom filename (example function)
function generateCustomFilename(originalFilename: string) {
  // Your logic to generate a custom filename here
  const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
  const extension = originalFilename.split('.').pop();
  return `${uniqueSuffix}.${extension}`;
}

const upload = multer({ 
  dest: './uploads', 
  fileFilter: (req, file, cb) => {
  // The function should call `cb` with a boolean
  // to indicate if the file should be accepted

    // To reject this file pass `false`, like so:
    const fileMimeType = file.mimetype;
    if (fileMimeType && 
      !['image/png', 'image/jpeg', 'image/jpg'].includes(fileMimeType)) {
    // throw new Error('Invalid file type');  
      cb(null, false);
    }

    // To accept the file pass `true`, like so:
    cb(null, true);

    // You can always pass an error if something goes wrong:
    // cb(new Error('I don\'t have a clue!'));

  },
  limits: {
    fileSize: 1024 * 1024 // im bytes
  },
 
});


export {
  uploadFile,
  generateCustomFilename,
  upload
};