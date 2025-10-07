// app/controllers/libro.controller.js

import db from "../models/index.js";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const { libro: Libro, autor: Autor } = db;

// Obtener __dirname en módulos ES6
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Listar todos los libros con información del autor
 */
export const listarLibros = async (req, res) => {
  try {
    const libros = await Libro.findAll({
      include: [
        {
          model: Autor,
          as: "autor",
          attributes: ["id_autor", "nombre", "pais"],
        },
      ],
      order: [["id_libro", "DESC"]],
    });

    res.status(200).json({
      success: true,
      data: libros,
      message: "Libros obtenidos exitosamente",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error al obtener los libros",
      error: error.message,
    });
  }
};

/**
 * Obtener un libro por ID con información del autor
 */
export const obtenerLibro = async (req, res) => {
  try {
    const { id } = req.params;

    const libro = await Libro.findByPk(id, {
      include: [
        {
          model: Autor,
          as: "autor",
          attributes: ["id_autor", "nombre", "pais"],
        },
      ],
    });

    if (!libro) {
      return res.status(404).json({
        success: false,
        message: "Libro no encontrado",
      });
    }

    res.status(200).json({
      success: true,
      data: libro,
      message: "Libro obtenido exitosamente",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error al obtener el libro",
      error: error.message,
    });
  }
};

/**
 * Crear un nuevo libro con imagen de portada opcional
 */
export const crearLibro = async (req, res) => {
  try {
    const { titulo, anio, id_autor } = req.body;

    // Log para debugging
    console.log("📝 Creando libro:", { titulo, anio, id_autor, hasFile: !!req.file });

    // Validación de campos obligatorios
    if (!titulo || !anio || !id_autor) {
      // Si se subió un archivo pero hay error, eliminarlo
      if (req.file) {
        try {
          fs.unlinkSync(req.file.path);
        } catch (unlinkError) {
          console.error("Error al eliminar archivo:", unlinkError);
        }
      }

      return res.status(400).json({
        success: false,
        message: "Los campos título, año e id_autor son obligatorios",
      });
    }

    // Verificar que el autor existe
    const autor = await Autor.findByPk(id_autor);
    if (!autor) {
      // Si se subió un archivo pero el autor no existe, eliminarlo
      if (req.file) {
        try {
          fs.unlinkSync(req.file.path);
        } catch (unlinkError) {
          console.error("Error al eliminar archivo:", unlinkError);
        }
      }

      return res.status(404).json({
        success: false,
        message: "El autor especificado no existe",
      });
    }

    // Obtener el nombre del archivo si se subió una imagen
    const portada = req.file ? req.file.filename : null;
    
    if (req.file) {
      console.log("📷 Archivo subido:", {
        filename: req.file.filename,
        size: req.file.size,
        mimetype: req.file.mimetype,
        path: req.file.path
      });
    }

    const nuevoLibro = await Libro.create({
      titulo,
      anio: parseInt(anio),
      portada,
      id_autor: parseInt(id_autor),
    });

    // Obtener el libro completo con el autor
    const libroCompleto = await Libro.findByPk(nuevoLibro.id_libro, {
      include: [
        {
          model: Autor,
          as: "autor",
          attributes: ["id_autor", "nombre", "pais"],
        },
      ],
    });

    console.log("✅ Libro creado exitosamente:", nuevoLibro.id_libro);

    res.status(201).json({
      success: true,
      data: libroCompleto,
      message: "Libro creado exitosamente",
    });
  } catch (error) {
    console.error("❌ Error al crear libro:", error);
    
    // Si hay error y se subió un archivo, eliminarlo
    if (req.file) {
      try {
        fs.unlinkSync(req.file.path);
      } catch (unlinkError) {
        console.error("Error al eliminar archivo tras error:", unlinkError);
      }
    }

    // Si es un error de validación de Sequelize
    if (error.name === "SequelizeValidationError") {
      return res.status(400).json({
        success: false,
        message: "Error de validación",
        errors: error.errors.map((e) => e.message),
      });
    }

    res.status(500).json({
      success: false,
      message: "Error al crear el libro",
      error: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
};

/**
 * Editar un libro existente con opción de cambiar la imagen
 */
export const editarLibro = async (req, res) => {
  try {
    const { id } = req.params;
    const { titulo, anio, id_autor } = req.body;

    const libro = await Libro.findByPk(id);

    if (!libro) {
      // Si se subió un archivo pero el libro no existe, eliminarlo
      if (req.file) {
        fs.unlinkSync(req.file.path);
      }

      return res.status(404).json({
        success: false,
        message: "Libro no encontrado",
      });
    }

    // Validación de campos obligatorios
    if (!titulo || !anio || !id_autor) {
      // Si se subió un archivo pero hay error, eliminarlo
      if (req.file) {
        fs.unlinkSync(req.file.path);
      }

      return res.status(400).json({
        success: false,
        message: "Los campos título, año e id_autor son obligatorios",
      });
    }

    // Verificar que el autor existe
    const autor = await Autor.findByPk(id_autor);
    if (!autor) {
      // Si se subió un archivo pero el autor no existe, eliminarlo
      if (req.file) {
        fs.unlinkSync(req.file.path);
      }

      return res.status(404).json({
        success: false,
        message: "El autor especificado no existe",
      });
    }

    // Manejar la imagen
    let nuevaPortada = libro.portada; // Mantener la actual por defecto
    
    // Si se solicita eliminar la imagen (removeImage=true en body)
    if (req.body.removeImage === 'true' && libro.portada) {
      const oldImagePath = path.join(__dirname, "../../uploads/", libro.portada);
      if (fs.existsSync(oldImagePath)) {
        fs.unlinkSync(oldImagePath);
      }
      nuevaPortada = null;
    }
    
    // Si se sube una nueva imagen, eliminar la anterior y usar la nueva
    if (req.file) {
      if (libro.portada) {
        const oldImagePath = path.join(__dirname, "../../uploads/", libro.portada);
        if (fs.existsSync(oldImagePath)) {
          fs.unlinkSync(oldImagePath);
        }
      }
      nuevaPortada = req.file.filename;
    }

    // Actualizar el libro
    await libro.update({
      titulo,
      anio: parseInt(anio),
      portada: nuevaPortada,
      id_autor: parseInt(id_autor),
    });

    // Obtener el libro actualizado con el autor
    const libroActualizado = await Libro.findByPk(id, {
      include: [
        {
          model: Autor,
          as: "autor",
          attributes: ["id_autor", "nombre", "pais"],
        },
      ],
    });

    res.status(200).json({
      success: true,
      data: libroActualizado,
      message: "Libro actualizado exitosamente",
    });
  } catch (error) {
    // Si hay error y se subió un archivo, eliminarlo
    if (req.file) {
      fs.unlinkSync(req.file.path);
    }

    // Si es un error de validación de Sequelize
    if (error.name === "SequelizeValidationError") {
      return res.status(400).json({
        success: false,
        message: "Error de validación",
        errors: error.errors.map((e) => e.message),
      });
    }

    res.status(500).json({
      success: false,
      message: "Error al actualizar el libro",
      error: error.message,
    });
  }
};

/**
 * Eliminar un libro y su imagen de portada
 */
export const eliminarLibro = async (req, res) => {
  try {
    const { id } = req.params;

    const libro = await Libro.findByPk(id);

    if (!libro) {
      return res.status(404).json({
        success: false,
        message: "Libro no encontrado",
      });
    }

    // Eliminar la imagen de portada si existe
    if (libro.portada) {
      const imagePath = path.join(__dirname, "../../uploads/", libro.portada);
      if (fs.existsSync(imagePath)) {
        fs.unlinkSync(imagePath);
      }
    }

    await libro.destroy();

    res.status(200).json({
      success: true,
      message: "Libro eliminado exitosamente",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error al eliminar el libro",
      error: error.message,
    });
  }
};


