const errorHandler = (err, req, res, next) => {
  let error = { ...err };
  error.message = err.message;

  // Log error (toujours côté serveur)
  console.error(err);

  // Mongoose bad ObjectId
  if (err.name === 'CastError') {
    const message = 'Ressource non trouvée';
    error = { message, statusCode: 404 };
  }

  // Mongoose duplicate key
  if (err.code === 11000) {
    const message = 'Ressource dupliquée';
    error = { message, statusCode: 400 };
  }

  // Mongoose validation error
  if (err.name === 'ValidationError') {
    const message = Object.values(err.errors).map(val => val.message);
    error = { message, statusCode: 400 };
  }

  const statusCode = error.statusCode || 500;

  // En production, on ne renvoie pas les détails techniques
  const isProd = process.env.NODE_ENV === 'production';

  const payload = {
    success: false,
    error: error.message || 'Erreur serveur'
  };

  if (!isProd) {
    // En dev / test, on expose un peu plus d'infos pour aider au debug
    payload.stack = err.stack;
    payload.type = err.name;
  }

  res.status(statusCode).json(payload);
};

module.exports = errorHandler;
