import db from "../models/index.js";
import cloudinary from "../config/cloudinary.config.js";

const { libro: Libro, autor: Autor } = db;

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
      // Si hay un archivo subido a Cloudinary, eliminarlo
      if (req.file?.filename) {
        try {
          await cloudinary.uploader.destroy(req.file.filename);
        } catch (unlinkError) {}
      }
      return res.status(400).json({
        success: false,
        message: "Los campos título, año e id_autor son obligatorios",
      });
    }

    const autor = await Autor.findByPk(id_autor);
    if (!autor) {
      // Si hay un archivo subido a Cloudinary, eliminarlo
      if (req.file?.filename) {
        try {
          await cloudinary.uploader.destroy(req.file.filename);
        } catch (unlinkError) {}
      }
      return res.status(404).json({
        success: false,
        message: "El autor especificado no existe",
      });
    }

    // Cloudinary devuelve la URL completa en req.file.path
    const portada = req.file ? req.file.path : null;

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
    // Si hay un archivo subido a Cloudinary, eliminarlo
    if (req.file?.filename) {
      try {
        await cloudinary.uploader.destroy(req.file.filename);
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
      if (req.file?.filename) {
        try {
          await cloudinary.uploader.destroy(req.file.filename);
        } catch (unlinkError) {}
      }
      return res.status(404).json({
        success: false,
        message: "Libro no encontrado",
      });
    }

    if (!titulo || !anio || !id_autor) {
      if (req.file?.filename) {
        try {
          await cloudinary.uploader.destroy(req.file.filename);
        } catch (unlinkError) {}
      }
      return res.status(400).json({
        success: false,
        message: "Los campos título, año e id_autor son obligatorios",
      });
    }

    const autor = await Autor.findByPk(id_autor);
    if (!autor) {
      if (req.file?.filename) {
        try {
          await cloudinary.uploader.destroy(req.file.filename);
        } catch (unlinkError) {}
      }
      return res.status(404).json({
        success: false,
        message: "El autor especificado no existe",
      });
    }

    let nuevaPortada = libro.portada;
    
    // Si se solicita eliminar la imagen
    if (req.body.removeImage === 'true' && libro.portada) {
      // Extraer public_id de la URL de Cloudinary
      const publicId = extractPublicIdFromUrl(libro.portada);
      if (publicId) {
        try {
          await cloudinary.uploader.destroy(publicId);
        } catch (error) {
          console.error("Error al eliminar imagen de Cloudinary:", error);
        }
      }
      nuevaPortada = null;
    }
    
    // Si se sube una nueva imagen
    if (req.file) {
      // Eliminar la imagen anterior de Cloudinary si existe
      if (libro.portada) {
        const publicId = extractPublicIdFromUrl(libro.portada);
        if (publicId) {
          try {
            await cloudinary.uploader.destroy(publicId);
          } catch (error) {
            console.error("Error al eliminar imagen anterior de Cloudinary:", error);
          }
        }
      }
      nuevaPortada = req.file.path; // URL de Cloudinary
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
    if (req.file?.filename) {
      try {
        await cloudinary.uploader.destroy(req.file.filename);
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

    // Eliminar imagen de Cloudinary si existe
    if (libro.portada) {
      const publicId = extractPublicIdFromUrl(libro.portada);
      if (publicId) {
        try {
          await cloudinary.uploader.destroy(publicId);
        } catch (error) {
          console.error("Error al eliminar imagen de Cloudinary:", error);
        }
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

// Función auxiliar para extraer el public_id de una URL de Cloudinary
function extractPublicIdFromUrl(url) {
  try {
    // Ejemplo de URL: https://res.cloudinary.com/CLOUD_NAME/image/upload/v1234567890/biblioteca-libros/abc123.jpg
    // Necesitamos extraer: biblioteca-libros/abc123
    const match = url.match(/\/upload\/(?:v\d+\/)?(.+)\.\w+$/);
    return match ? match[1] : null;
  } catch (error) {
    console.error("Error al extraer public_id:", error);
    return null;
  }
}


