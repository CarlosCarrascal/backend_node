// scripts/initUsers.js
// Script para crear usuarios por defecto con diferentes roles

import dotenv from "dotenv";
dotenv.config();

import db from "../app/models/index.js";
import bcrypt from "bcryptjs";

const { user: User, role: Role } = db;

async function initUsers() {
  try {
    // Sincronizar la base de datos
    await db.sequelize.sync();

    // Verificar si ya existen usuarios
    const usersCount = await User.count();

    if (usersCount > 0) {
      console.log("Los usuarios ya están inicializados.");
      process.exit(0);
    }

    // Buscar los roles
    const userRole = await Role.findOne({ where: { name: "user" } });
    const moderatorRole = await Role.findOne({ where: { name: "moderator" } });
    const adminRole = await Role.findOne({ where: { name: "admin" } });

    if (!userRole || !moderatorRole || !adminRole) {
      console.log("Error: Los roles no están inicializados. Ejecuta primero 'npm run init-roles'");
      process.exit(1);
    }

    // Crear usuarios por defecto
    const defaultPassword = await bcrypt.hash("123456", 8);

    // Usuario normal
    const user1 = await User.create({
      username: "user",
      email: "user@example.com",
      password: defaultPassword
    });
    await user1.setRoles([userRole]);

    // Usuario moderador
    const user2 = await User.create({
      username: "moderator",
      email: "moderator@example.com",
      password: defaultPassword
    });
    await user2.setRoles([moderatorRole]);

    // Usuario administrador
    const user3 = await User.create({
      username: "admin",
      email: "admin@example.com",
      password: defaultPassword
    });
    await user3.setRoles([adminRole]);

    console.log("Usuarios inicializados exitosamente:");
    console.log("- user / user@example.com / 123456 (rol: user)");
    console.log("- moderator / moderator@example.com / 123456 (rol: moderator)");
    console.log("- admin / admin@example.com / 123456 (rol: admin)");
    console.log("\n⚠️  IMPORTANTE: Cambia estas contraseñas en producción!");

    process.exit(0);
  } catch (error) {
    console.error("Error al inicializar los usuarios:", error);
    process.exit(1);
  }
}

initUsers();