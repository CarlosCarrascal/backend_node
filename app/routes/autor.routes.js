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

router.get("/", listarAutores);
router.get("/:id", obtenerAutor);
router.post("/", [verifyToken, validateAutor], crearAutor);
router.put("/:id", [verifyToken, validateAutor], editarAutor);
router.delete("/:id", [verifyToken, isAdmin], eliminarAutor);

export default router;

