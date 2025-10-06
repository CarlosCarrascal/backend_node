// scripts/deploy.js
// Script para inicializar la base de datos en producción

import dotenv from "dotenv";
dotenv.config();

import db from "../app/models/index.js";
import bcrypt from "bcryptjs";

const { user: User, role: Role } = db;

async function deployDatabase() {
  try {
    console.log("🚀 Iniciando configuración de base de datos...");

    // Sincronizar la base de datos
    console.log("📊 Sincronizando base de datos...");
    await db.sequelize.sync({ force: false });
    console.log("✅ Base de datos sincronizada correctamente");

    // Inicializar roles
    console.log("👥 Verificando roles...");
    const rolesCount = await Role.count();

    if (rolesCount === 0) {
      console.log("📝 Creando roles por defecto...");
      await Role.create({ id: 1, name: "user" });
      await Role.create({ id: 2, name: "moderator" });
      await Role.create({ id: 3, name: "admin" });
      console.log("✅ Roles creados: user, moderator, admin");
    } else {
      console.log("✅ Roles ya existen");
    }

    // Inicializar usuarios por defecto (solo en desarrollo)
    if (process.env.NODE_ENV !== "production") {
      console.log("👤 Verificando usuarios por defecto...");
      const usersCount = await User.count();

      if (usersCount === 0) {
        console.log("📝 Creando usuarios por defecto...");

        const userRole = await Role.findOne({ where: { name: "user" } });
        const moderatorRole = await Role.findOne({
          where: { name: "moderator" },
        });
        const adminRole = await Role.findOne({ where: { name: "admin" } });

        const defaultPassword = await bcrypt.hash("123456", 8);

        const user1 = await User.create({
          username: "user",
          email: "user@example.com",
          password: defaultPassword,
        });
        await user1.setRoles([userRole]);

        const user2 = await User.create({
          username: "moderator",
          email: "moderator@example.com",
          password: defaultPassword,
        });
        await user2.setRoles([moderatorRole]);

        const user3 = await User.create({
          username: "admin",
          email: "admin@example.com",
          password: defaultPassword,
        });
        await user3.setRoles([adminRole]);

        console.log("✅ Usuarios por defecto creados");
        console.log("⚠️  IMPORTANTE: Cambia estas contraseñas!");
      } else {
        console.log("✅ Usuarios ya existen");
      }
    }

    console.log("🎉 Configuración de base de datos completada");
    process.exit(0);
  } catch (error) {
    console.error("❌ Error durante la configuración:", error);
    process.exit(1);
  }
}

deployDatabase();
