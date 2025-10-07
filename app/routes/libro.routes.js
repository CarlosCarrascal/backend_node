import express from "express";
import multer from "multer";
import {
  listarLibros,
  obtenerLibro,
  crearLibro,
  editarLibro,
  eliminarLibro,
} from "../controllers/libro.controller.js";
import { verifyToken, isAdmin } from "../middlewares/authJwt.js";
import upload from "../middlewares/upload.js";
import { validateLibro } from "../middlewares/validateFields.js";

const router = express.Router();

router.get("/", listarLibros);
router.get("/:id", obtenerLibro);

const handleMulterError = (err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        success: false,
        message: "El archivo es demasiado grande. Tamaño máximo: 5MB",
        error: err.message
      });
    }
    return res.status(400).json({
      success: false,
      message: "Error al subir el archivo",
      error: err.message
    });
  } else if (err) {
    return res.status(400).json({
      success: false,
      message: err.message || "Error al procesar el archivo",
    });
  }
  next();
};

router.post("/", [verifyToken, upload.single("portada"), handleMulterError, validateLibro], crearLibro);
router.put("/:id", [verifyToken, upload.single("portada"), handleMulterError, validateLibro], editarLibro);
router.delete("/:id", [verifyToken, isAdmin], eliminarLibro);

export default router;

