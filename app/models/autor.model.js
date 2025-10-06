// app/models/autor.model.js

/**
 * Modelo de Autor
 * Tabla: autores
 * Campos: id_autor (PK), nombre, país
 */
export default (sequelize, Sequelize) => {
  const Autor = sequelize.define("autores", {
    id_autor: {
      type: Sequelize.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    nombre: {
      type: Sequelize.STRING(100),
      allowNull: false,
      validate: {
        notEmpty: {
          msg: "El nombre del autor es obligatorio",
        },
        len: {
          args: [2, 100],
          msg: "El nombre debe tener entre 2 y 100 caracteres",
        },
      },
    },
    pais: {
      type: Sequelize.STRING(50),
      allowNull: false,
      validate: {
        notEmpty: {
          msg: "El país es obligatorio",
        },
        len: {
          args: [2, 50],
          msg: "El país debe tener entre 2 y 50 caracteres",
        },
      },
    },
  }, {
    timestamps: true, // Agrega createdAt y updatedAt automáticamente
  });

  return Autor;
};

