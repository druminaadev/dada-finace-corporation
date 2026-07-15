import multer from 'multer';
import { randomUUID } from 'crypto';
import path from 'path';
import config from '../config/env.js';

const storage = multer.memoryStorage();

const fileFilter = (_req, file, cb) => {
  if (config.upload.allowedMimeTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error(`File type ${file.mimetype} not allowed`), false);
  }
};

export const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: config.upload.maxFileSizeMb * 1024 * 1024, files: 10 },
});

export const generateFileName = (originalName) => {
  const ext = path.extname(originalName).toLowerCase();
  return `${randomUUID()}${ext}`;
};
