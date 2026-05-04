const fs = require('fs');
const path = require('path');
const multer = require('multer');
const { devolucaoUploadDir } = require('../config/storage');

fs.mkdirSync(devolucaoUploadDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, devolucaoUploadDir);
  },
  filename: (req, file, cb) => {
    const extension = (path.extname(file.originalname) || '.jpg').toLowerCase();
    const sanitizedBaseName = path
      .basename(file.originalname, extension)
      .replace(/[^a-zA-Z0-9-_]/g, '_')
      .slice(0, 40);

    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    cb(null, `${sanitizedBaseName || 'devolucao'}-${uniqueSuffix}${extension}`);
  },
});

const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
    return;
  }

  cb(new Error('Apenas arquivos de imagem são permitidos'));
};

const uploadDevolucaoImagem = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 12 * 1024 * 1024,
  },
});

module.exports = uploadDevolucaoImagem;
