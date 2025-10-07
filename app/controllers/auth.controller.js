
import db from "../models/index.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import authConfig from "../config/auth.config.js";

// Extrae los modelos User y Role desde el objeto db
const { user: User, role: Role } = db;

// Controlador para el registro de usuarios
export const signup = async (req, res) => {
  try {
    const { username, email, password, roles } = req.body;

    // Encripta la contraseña antes de guardarla en la base de datos
    const hashedPassword = await bcrypt.hash(password, 8);
    const userRole = await Role.findOne({ where: { name: "user" } });

    // Crea un nuevo usuario con los datos proporcionados y la contraseña encriptada
    const user = await User.create({
      username,
      email,
      password: hashedPassword,
    });

    await user.setRoles([userRole]);

    // Devuelve respuesta exitosa
    res.status(201).json({ message: "User registered successfully!" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Controlador para el inicio de sesión
export const signin = async (req, res) => {
  try {
    const { username, password } = req.body;
    const user = await User.findOne({
      where: { username },
      include: [{ model: Role, as: "roles" }],
    });
    if (!user) {
      return res.status(404).json({ message: "User Not found." });
    }

    // Compara la contraseña proporcionada con la almacenada (ya encriptada)
    const passwordIsValid = await bcrypt.compare(password, user.password);

    // Si la contraseña no es válida, responde con error 401
    if (!passwordIsValid) {
      return res.status(401).json({
        accessToken: null,
        message: "Invalid Password!",
      });
    }

    // Si la contraseña es válida, genera un token JWT que expira en 24 horas
    const token = jwt.sign({ id: user.id }, authConfig.secret, {
      expiresIn: 86400,
    });

    // Crea un array con los roles del usuario en el formato 'ROLE_ADMIN', 'ROLE_USER', etc.
    const authorities = user.roles.map((role) => `ROLE_${role.name.toUpperCase()}`);

    // Responde con la información del usuario y el token de acceso
    res.status(200).json({
      id: user.id,
      username: user.username,
      email: user.email,
      roles: authorities,
      accessToken: token,
    });
  } catch (error) {
    // Si ocurre un error en el proceso, responde con código 500 y el mensaje del error
    res.status(500).json({ message: error.message });
  }
};