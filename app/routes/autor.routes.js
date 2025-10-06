// app/routes/autor.routes.js

import express from "express";
import {
  listarAutores,
  obtenerAutor,
  crearAutor,
  editarAutor,
  eliminarAutor,
} from "../controllers/autor.controller.js";
import { verifyToken, isAdmin } from "../middlewares/authJwt.js";
import { validateAutor } from "../middlewares/validateFields.js";

const router = express.Router();

/**
 * Rutas públicas (sin autenticación)
 */

// GET /api/autores - Listar todos los autores
router.get("/", listarAutores);

// GET /api/autores/:id - Obtener un autor por ID
router.get("/:id", obtenerAutor);

/**
 * Rutas protegidas (requieren autenticación)
 */

// POST /api/autores - Crear un nuevo autor (requiere autenticación)
router.post("/", [verifyToken, validateAutor], crearAutor);

// PUT /api/autores/:id - Editar un autor (requiere autenticación)
router.put("/:id", [verifyToken, validateAutor], editarAutor);

// DELETE /api/autores/:id - Eliminar un autor (requiere rol admin)
router.delete("/:id", [verifyToken, isAdmin], eliminarAutor);

export default router;

