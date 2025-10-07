import db from "../models/index.js";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const { libro: Libro, autor: Autor } = db;
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

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

export const crearLibro = async (req, res) => {
  try {
    const { titulo, anio, id_autor } = req.body;

    if (!titulo || !anio || !id_autor) {
      if (req.file) {
        try {
          fs.unlinkSync(req.file.path);
        } catch (unlinkError) {}
      }
      return res.status(400).json({
        success: false,
        message: "Los campos título, año e id_autor son obligatorios",
      });
    }

    const autor = await Autor.findByPk(id_autor);
    if (!autor) {
      if (req.file) {
        try {
          fs.unlinkSync(req.file.path);
        } catch (unlinkError) {}
      }
      return res.status(404).json({
        success: false,
        message: "El autor especificado no existe",
      });
    }

    const portada = req.file ? req.file.filename : null;

    const nuevoLibro = await Libro.create({
      titulo,
      anio: parseInt(anio),
      portada,
      id_autor: parseInt(id_autor),
    });

    const libroCompleto = await Libro.findByPk(nuevoLibro.id_libro, {
      include: [
        {
          model: Autor,
          as: "autor",
          attributes: ["id_autor", "nombre", "pais"],
        },
      ],
    });

    res.status(201).json({
      success: true,
      data: libroCompleto,
      message: "Libro creado exitosamente",
    });
  } catch (error) {
    if (req.file) {
      try {
        fs.unlinkSync(req.file.path);
      } catch (unlinkError) {}
    }

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

export const editarLibro = async (req, res) => {
  try {
    const { id } = req.params;
    const { titulo, anio, id_autor } = req.body;

    const libro = await Libro.findByPk(id);

    if (!libro) {
      if (req.file) fs.unlinkSync(req.file.path);
      return res.status(404).json({
        success: false,
        message: "Libro no encontrado",
      });
    }

    if (!titulo || !anio || !id_autor) {
      if (req.file) fs.unlinkSync(req.file.path);
      return res.status(400).json({
        success: false,
        message: "Los campos título, año e id_autor son obligatorios",
      });
    }

    const autor = await Autor.findByPk(id_autor);
    if (!autor) {
      if (req.file) fs.unlinkSync(req.file.path);
      return res.status(404).json({
        success: false,
        message: "El autor especificado no existe",
      });
    }

    let nuevaPortada = libro.portada;
    
    if (req.body.removeImage === 'true' && libro.portada) {
      const oldImagePath = path.join(__dirname, "../../uploads/", libro.portada);
      if (fs.existsSync(oldImagePath)) {
        fs.unlinkSync(oldImagePath);
      }
      nuevaPortada = null;
    }
    
    if (req.file) {
      if (libro.portada) {
        const oldImagePath = path.join(__dirname, "../../uploads/", libro.portada);
        if (fs.existsSync(oldImagePath)) {
          fs.unlinkSync(oldImagePath);
        }
      }
      nuevaPortada = req.file.filename;
    }

    await libro.update({
      titulo,
      anio: parseInt(anio),
      portada: nuevaPortada,
      id_autor: parseInt(id_autor),
    });

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
    if (req.file) fs.unlinkSync(req.file.path);

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


