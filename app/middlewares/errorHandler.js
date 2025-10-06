// app/middlewares/errorHandler.js

/**
 * Middleware para manejar errores globales
 * Especialmente útil para errores de Multer (carga de archivos)
 */
export const errorHandler = (err, req, res, next) => {
  // Error de Multer - archivo muy grande
  if (err.code === "LIMIT_FILE_SIZE") {
    return res.status(400).json({
      success: false,
      message: "El archivo es demasiado grande. Tamaño máximo: 5MB",
    });
  }

  // Error de Multer - tipo de archivo no permitido
  if (err.message && err.message.includes("Solo se permiten archivos de imagen")) {
    return res.status(400).json({
      success: false,
      message: err.message,
    });
  }

  // Error de Multer - campo inesperado
  if (err.code === "LIMIT_UNEXPECTED_FILE") {
    return res.status(400).json({
      success: false,
      message: "Campo de archivo inesperado. Use 'portada' como nombre del campo",
    });
  }

  // Error genérico
  res.status(500).json({
    success: false,
    message: "Error interno del servidor",
    error: err.message,
  });
};

