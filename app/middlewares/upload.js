// app/middlewares/upload.js

import multer from "multer";
import path from "path";
import { fileURLToPath } from "url";

// Obtener __dirname en módulos ES6
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configuración de almacenamiento para multer
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    // Carpeta donde se guardarán las imágenes
    cb(null, path.join(__dirname, "../../uploads/"));
  },
  filename: function (req, file, cb) {
    // Generar un nombre único para cada archivo
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    const extension = path.extname(file.originalname);
    cb(null, "portada-" + uniqueSuffix + extension);
  },
});

// Filtro para validar que solo se suban imágenes
const fileFilter = (req, file, cb) => {
  // Tipos de archivos permitidos
  const allowedTypes = /jpeg|jpg|png|gif|webp/;
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = allowedTypes.test(file.mimetype);

  if (mimetype && extname) {
    return cb(null, true);
  } else {
    cb(new Error("Solo se permiten archivos de imagen (jpeg, jpg, png, gif, webp)"));
  }
};

// Crear instancia de multer con la configuración
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // Límite de 5MB
  },
  fileFilter: fileFilter,
});

export default upload;

