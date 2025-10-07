
import dotenv from "dotenv";
dotenv.config();

import express from "express";
import cors from "cors";
import db from "./app/models/index.js";
import authRoutes from "./app/routes/auth.routes.js";
import autorRoutes from "./app/routes/autor.routes.js";
import libroRoutes from "./app/routes/libro.routes.js";
import path from "path";
import { fileURLToPath } from "url";
import { errorHandler } from "./app/middlewares/errorHandler.js";

const app = express();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const allowedOrigins = [
  "http://localhost:5173",
  "http://localhost:8080",
  "https://carloscarrascal.github.io",
  process.env.FRONTEND_URL,
].filter(Boolean);

const corsOptions = {
  origin: function (origin, callback) {
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      console.log(`CORS blocked origin: ${origin}`);
      callback(new Error('No permitido por CORS'));
    }
  },
  credentials: true,
};

app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

app.get("/", (req, res) => {
  res.json({ 
    message: "Bienvenido a la API de Gestión de Libros y Autores",
    endpoints: {
      autenticacion: "/api/auth",
      autores: "/api/autores",
      libros: "/api/libros"
    }
  });
});

// Endpoint de keep-alive para evitar que el servidor se duerma
app.get("/api/health", (req, res) => {
  res.status(200).json({ 
    status: "OK",
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

app.use("/api/auth", authRoutes);
app.use("/api/autores", autorRoutes);
app.use("/api/libros", libroRoutes);
app.use(errorHandler);

const PORT = process.env.PORT || 3000;

db.sequelize.sync({ force: false }).then(() => {
  console.log("Database synchronized");
  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}.`);
  });
});