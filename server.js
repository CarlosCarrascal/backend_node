
import dotenv from "dotenv";
dotenv.config();

import express from "express";
import cors from "cors";
import db from "./app/models/index.js";
import authRoutes from "./app/routes/auth.routes.js";

// Importamos las rutas de autores y libros (CRUD)
import autorRoutes from "./app/routes/autor.routes.js";
import libroRoutes from "./app/routes/libro.routes.js";

import path from "path";
import { fileURLToPath } from "url";

// Importamos el middleware de manejo de errores
import { errorHandler } from "./app/middlewares/errorHandler.js";

// Creamos una instancia de la aplicación Express
const app = express();

// Obtener __dirname en módulos ES6
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configuramos las opciones de CORS para permitir acceso desde el frontend en el puerto 5173 y 8080
const corsOptions = {
  origin: ["http://localhost:5173", "http://localhost:8080"],
};

// Middlewares
app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Servir archivos estáticos desde la carpeta 'uploads' para las imágenes de portadas
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Ruta simple para probar que el servidor está funcionando
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

app.use("/api/auth", authRoutes);
app.use("/api/autores", autorRoutes);
app.use("/api/libros", libroRoutes);

// Middleware de manejo de errores
app.use(errorHandler);

// Puerto en el que se ejecutará el servidor
const PORT = process.env.PORT || 3000;

// Iniciamos el servidor y escucha en el puerto definido
db.sequelize.sync({ force: false }).then(() => {
  console.log("Database synchronized");

  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}.`);
  });
});