const path = require('path');

const defaultUploadRoot = path.join(__dirname, '..', 'public', 'uploads');
const uploadRoot = path.resolve(process.env.UPLOAD_ROOT || defaultUploadRoot);
const devolucaoUploadDir = path.join(uploadRoot, 'devolucoes');

function getDevolucaoPublicPath(filename) {
  return `/uploads/devolucoes/${filename}`;
}

module.exports = {
  uploadRoot,
  devolucaoUploadDir,
  getDevolucaoPublicPath,
};
