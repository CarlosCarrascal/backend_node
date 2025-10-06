// scripts/initRoles.js
// Script para inicializar los roles en la base de datos

import dotenv from "dotenv";
dotenv.config();

import db from "../app/models/index.js";

const { role: Role } = db;

async function initRoles() {
  try {
    // Sincronizar la base de datos
    await db.sequelize.sync();

    // Verificar si ya existen roles
    const rolesCount = await Role.count();

    if (rolesCount > 0) {
      console.log("Los roles ya están inicializados.");
      process.exit(0);
    }

    // Crear los roles iniciales
    await Role.create({ id: 1, name: "user" });
    await Role.create({ id: 2, name: "moderator" });
    await Role.create({ id: 3, name: "admin" });

    console.log("Roles inicializados exitosamente:");
    console.log("- user (id: 1)");
    console.log("- moderator (id: 2)");
    console.log("- admin (id: 3)");

    process.exit(0);
  } catch (error) {
    console.error("Error al inicializar los roles:", error);
    process.exit(1);
  }
}

initRoles();

