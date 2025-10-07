import db from "../models/index.js";

const { autor: Autor, libro: Libro } = db;

export const listarAutores = async (req, res) => {
  try {
    const autores = await Autor.findAll({
      include: [
        {
          model: Libro,
          as: "libros",
          attributes: ["id_libro", "titulo", "anio", "portada"],
        },
      ],
      order: [["id_autor", "DESC"]],
    });

    res.status(200).json({
      success: true,
      data: autores,
      message: "Autores obtenidos exitosamente",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error al obtener los autores",
      error: error.message,
    });
  }
};

export const obtenerAutor = async (req, res) => {
  try {
    const { id } = req.params;

    const autor = await Autor.findByPk(id, {
      include: [
        {
          model: Libro,
          as: "libros",
          attributes: ["id_libro", "titulo", "anio", "portada"],
        },
      ],
    });

    if (!autor) {
      return res.status(404).json({
        success: false,
        message: "Autor no encontrado",
      });
    }

    res.status(200).json({
      success: true,
      data: autor,
      message: "Autor obtenido exitosamente",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error al obtener el autor",
      error: error.message,
    });
  }
};

export const crearAutor = async (req, res) => {
  try {
    const { nombre, pais } = req.body;

    if (!nombre || !pais) {
      return res.status(400).json({
        success: false,
        message: "Los campos nombre y país son obligatorios",
      });
    }

    const nuevoAutor = await Autor.create({
      nombre,
      pais,
    });

    res.status(201).json({
      success: true,
      data: nuevoAutor,
      message: "Autor creado exitosamente",
    });
  } catch (error) {
    if (error.name === "SequelizeValidationError") {
      return res.status(400).json({
        success: false,
        message: "Error de validación",
        errors: error.errors.map((e) => e.message),
      });
    }

    res.status(500).json({
      success: false,
      message: "Error al crear el autor",
      error: error.message,
    });
  }
};

export const editarAutor = async (req, res) => {
  try {
    const { id } = req.params;
    const { nombre, pais } = req.body;

    const autor = await Autor.findByPk(id);

    if (!autor) {
      return res.status(404).json({
        success: false,
        message: "Autor no encontrado",
      });
    }

    if (!nombre || !pais) {
      return res.status(400).json({
        success: false,
        message: "Los campos nombre y país son obligatorios",
      });
    }

    await autor.update({
      nombre,
      pais,
    });

    res.status(200).json({
      success: true,
      data: autor,
      message: "Autor actualizado exitosamente",
    });
  } catch (error) {
    if (error.name === "SequelizeValidationError") {
      return res.status(400).json({
        success: false,
        message: "Error de validación",
        errors: error.errors.map((e) => e.message),
      });
    }

    res.status(500).json({
      success: false,
      message: "Error al actualizar el autor",
      error: error.message,
    });
  }
};

export const eliminarAutor = async (req, res) => {
  try {
    const { id } = req.params;

    const autor = await Autor.findByPk(id, {
      include: [{ model: Libro, as: "libros" }],
    });

    if (!autor) {
      return res.status(404).json({
        success: false,
        message: "Autor no encontrado",
      });
    }

    if (autor.libros && autor.libros.length > 0) {
      return res.status(400).json({
        success: false,
        message: `No se puede eliminar el autor porque tiene ${autor.libros.length} libro(s) asociado(s). Elimine primero los libros.`,
      });
    }

    await autor.destroy();

    res.status(200).json({
      success: true,
      message: "Autor eliminado exitosamente",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error al eliminar el autor",
      error: error.message,
    });
  }
};

