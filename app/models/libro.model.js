// app/models/libro.model.js

/**
 * Modelo de Libro
 * Tabla: libros
 * Campos: id_libro (PK), titulo, año, portada, id_autor (FK)
 */
export default (sequelize, Sequelize) => {
  const Libro = sequelize.define("libros", {
    id_libro: {
      type: Sequelize.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    titulo: {
      type: Sequelize.STRING(200),
      allowNull: false,
      validate: {
        notEmpty: {
          msg: "El título del libro es obligatorio",
        },
        len: {
          args: [1, 200],
          msg: "El título debe tener entre 1 y 200 caracteres",
        },
      },
    },
    anio: {
      type: Sequelize.INTEGER,
      allowNull: false,
      validate: {
        notEmpty: {
          msg: "El año de publicación es obligatorio",
        },
        isInt: {
          msg: "El año debe ser un número entero",
        },
        min: {
          args: [1000],
          msg: "El año debe ser mayor a 1000",
        },
        max: {
          args: [new Date().getFullYear() + 1],
          msg: "El año no puede ser mayor al año siguiente",
        },
      },
    },
    portada: {
      type: Sequelize.STRING(255),
      allowNull: true, // Puede ser null si no se sube imagen
      defaultValue: null,
    },
    id_autor: {
      type: Sequelize.INTEGER,
      allowNull: false,
      references: {
        model: "autores", // Nombre de la tabla referenciada
        key: "id_autor",
      },
      validate: {
        notEmpty: {
          msg: "El autor es obligatorio",
        },
      },
    },
  }, {
    timestamps: true, // Agrega createdAt y updatedAt automáticamente
  });

  return Libro;
};

