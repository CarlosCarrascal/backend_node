// app/middlewares/validateFields.js

/**
 * Middleware para validar campos obligatorios en autores
 */
export const validateAutor = (req, res, next) => {
  const { nombre, pais } = req.body;

  const errores = [];

  if (!nombre || nombre.trim() === "") {
    errores.push("El campo 'nombre' es obligatorio");
  }

  if (!pais || pais.trim() === "") {
    errores.push("El campo 'pais' es obligatorio");
  }

  if (nombre && nombre.length < 2) {
    errores.push("El nombre debe tener al menos 2 caracteres");
  }

  if (nombre && nombre.length > 100) {
    errores.push("El nombre no puede tener más de 100 caracteres");
  }

  if (pais && pais.length < 2) {
    errores.push("El país debe tener al menos 2 caracteres");
  }

  if (pais && pais.length > 50) {
    errores.push("El país no puede tener más de 50 caracteres");
  }

  if (errores.length > 0) {
    return res.status(400).json({
      success: false,
      message: "Errores de validación",
      errores: errores,
    });
  }

  next();
};

/**
 * Middleware para validar campos obligatorios en libros
 */
export const validateLibro = (req, res, next) => {
  const { titulo, anio, id_autor } = req.body;

  const errores = [];

  if (!titulo || titulo.trim() === "") {
    errores.push("El campo 'titulo' es obligatorio");
  }

  if (!anio) {
    errores.push("El campo 'anio' es obligatorio");
  }

  if (!id_autor) {
    errores.push("El campo 'id_autor' es obligatorio");
  }

  if (titulo && titulo.length < 1) {
    errores.push("El título debe tener al menos 1 carácter");
  }

  if (titulo && titulo.length > 200) {
    errores.push("El título no puede tener más de 200 caracteres");
  }

  if (anio && (isNaN(anio) || parseInt(anio) < 1000)) {
    errores.push("El año debe ser un número mayor a 1000");
  }

  if (anio && parseInt(anio) > new Date().getFullYear() + 1) {
    errores.push("El año no puede ser mayor al año siguiente");
  }

  if (id_autor && isNaN(id_autor)) {
    errores.push("El id_autor debe ser un número");
  }

  if (errores.length > 0) {
    return res.status(400).json({
      success: false,
      message: "Errores de validación",
      errores: errores,
    });
  }

  next();
};

