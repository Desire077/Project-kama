// middlewares/fileUpload.js
const multer = require('multer');
const path = require('path');

// Configuration du stockage en mémoire pour multer
const storage = multer.memoryStorage();

// Filtre pour les types de fichiers acceptés
const fileFilter = (req, file, cb) => {
  // Images acceptées
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Seules les images sont acceptées'), false);
  }
};

// Configuration multer
const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB max par fichier
    files: 10 // Maximum 10 fichiers
  }
});

// Middleware pour gérer les erreurs de multer
const handleUploadError = (err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ message: 'Fichier trop volumineux. Taille maximale: 5MB.' });
    }
    if (err.code === 'LIMIT_FILE_COUNT') {
      return res.status(400).json({ message: 'Trop de fichiers. Maximum: 10 fichiers.' });
    }
    if (err.code === 'LIMIT_UNEXPECTED_FILE') {
      return res.status(400).json({ message: 'Champ de fichier inattendu.' });
    }
  }
  
  if (err.message === 'Seules les images sont acceptées') {
    return res.status(400).json({ message: 'Seules les images sont acceptées.' });
  }
  
  next(err);
};

module.exports = { upload, handleUploadError };
