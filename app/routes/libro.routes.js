// app/routes/libro.routes.js

import express from "express";
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

/**
 * Rutas públicas
 */

// GET /api/libros - Listar todos los libros
router.get("/", listarLibros);

// GET /api/libros/:id - Obtener un libro por ID
router.get("/:id", obtenerLibro);

/**
 * Rutas protegidas (requieren autenticación)
 */

// POST /api/libros - Crear un nuevo libro con imagen opcional (requiere autenticación)
// El campo 'portada' es el nombre del campo del formulario para la imagen
router.post("/", [verifyToken, upload.single("portada"), validateLibro], crearLibro);

// PUT /api/libros/:id - Editar un libro con opción de cambiar imagen (requiere autenticación)
router.put("/:id", [verifyToken, upload.single("portada"), validateLibro], editarLibro);

// DELETE /api/libros/:id - Eliminar un libro (requiere rol admin)
router.delete("/:id", [verifyToken, isAdmin], eliminarLibro);

export default router;

