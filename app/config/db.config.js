// app/config/db.config.js
import dotenv from "dotenv";
dotenv.config();

let config;

// Si tenemos una URL de conexión completa, la usamos
if (process.env.DATABASE_URL) {
  const url = new URL(process.env.DATABASE_URL);

  config = {
    HOST: url.hostname,
    USER: url.username,
    PASSWORD: url.password,
    DB: url.pathname.slice(1), 
    PORT: url.port || 3306,
    dialect: "mysql",
    pool: {
      max: 5,
      min: 0,
      acquire: 30000,
      idle: 10000,
    },
    dialectOptions: {
      ssl:
        process.env.NODE_ENV === "production"
          ? {
              require: true,
              rejectUnauthorized: false,
            }
          : false,
    },
  };
} else {
  // Configuración por variables individuales
  config = {
    HOST: process.env.DB_HOST || "localhost",
    USER: process.env.DB_USER || "root",
    PASSWORD: process.env.DB_PASSWORD || "abcd123",
    DB: process.env.DB_NAME || "db",
    PORT: process.env.DB_PORT || 3306,
    dialect: process.env.DB_DIALECT || "mysql",
    pool: {
      max: 5,
      min: 0,
      acquire: 30000,
      idle: 10000,
    },
    dialectOptions: {
      ssl:
        process.env.NODE_ENV === "production"
          ? {
              require: true,
              rejectUnauthorized: false,
            }
          : false,
    },
  };
}

export default config;
