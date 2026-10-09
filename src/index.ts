import express from "express";
import argon2 from "argon2";

import { sequelize } from "./db";
import { User } from "./models/User";
import { Auth } from "./models/Auth";
import jwt from "jsonwebtoken";
import { requireAuth } from "./middleware/requireAuth";

const app = express();
const PORT = 3000;

app.use(express.json());
app.post("/auth/register", async (req, res) => {
    try {
        const { email, password, fullName, birthDate } = req.body;

        if (!email || !password || !fullName || !birthDate) {
            return res.status(400).json({
                message: "Faltan datos obligatorios",
            });
        }

        const normalizedEmail = email.trim().toLowerCase();

        const existingAuth = await Auth.findOne({
            where: {
                email: normalizedEmail,
            },
        });

        if (existingAuth) {
            return res.status(409).json({
                message: "El email ya está registrado",
            });
        }


        const passwordHash = await argon2.hash(password, {
            type: argon2.argon2id,
        });

        const result = await sequelize.transaction(async (transaction) => {
            const user = await User.create(
                {
                    fullName: fullName.trim(),
                    birthDate,
                },
                { transaction }
            );

            const auth = await Auth.create(
                {
                    email: normalizedEmail,
                    passwordHash,
                    userId: user.id,
                },
                { transaction }
            );

            return {
                user,
                auth,
            };
        });


        return res.status(201).json({
            id: result.user.id,
            fullName: result.user.fullName,
            birthDate: result.user.birthDate,
            email: result.auth.email,
        });
    } catch (error) {
        console.error(error);

        return res.status(500).json({
            message: "Error al registrar usuario",
        });
    }
});
app.post("/auth/login", async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({
                message: "Email y password son obligatorios",
            });
        }

        const normalizedEmail = email.trim().toLowerCase();

        const auth = await Auth.findOne({
            where: {
                email: normalizedEmail,
            },
        });

        if (!auth) {
            return res.status(401).json({
                message: "Credenciales inválidas",
            });
        }

        const passwordIsValid = await argon2.verify(
            auth.passwordHash,
            password
        );

        if (!passwordIsValid) {
            return res.status(401).json({
                message: "Credenciales inválidas",
            });
        }

        const jwtSecret = process.env.JWT_SECRET;

        if (!jwtSecret) {
            throw new Error("Falta JWT_SECRET en .env");
        }

        const token = jwt.sign(
            {
                sub: auth.userId.toString(),
            },
            jwtSecret,
            {
                expiresIn: "15m",
            }
        );

        return res.json({
            accessToken: token,
        });
    } catch (error) {
        console.error(error);

        return res.status(500).json({
            message: "Error al iniciar sesión",
        });
    }
});
app.get("/", (req, res) => {
    res.json({
        message: "Auth API funcionando",
    });
});
app.get("/me", requireAuth, async (req, res) => {
    try {
        const userId = res.locals.userId;

        const user = await User.findByPk(userId);

        if (!user) {
            return res.status(404).json({
                message: "Usuario no encontrado",
            });
        }

        const auth = await Auth.findOne({
            where: {
                userId,
            },
        });

        return res.json({
            id: user.id,
            fullName: user.fullName,
            birthDate: user.birthDate,
            email: auth?.email,
        });
    } catch (error) {
        console.error(error);

        return res.status(500).json({
            message: "Error al obtener usuario",
        });
    }
});

async function startServer() {
    try {
        await sequelize.authenticate();
        console.log("Conexión a PostgreSQL exitosa ✅");
        await sequelize.sync({ alter: true });
        console.log("Tablas sincronizadas ✅");
        app.listen(PORT, () => {
            console.log(`Servidor corriendo en http://localhost:${PORT}`);
        });
    } catch (error) {
        console.error("Error conectando a PostgreSQL:", error);
    }

}

startServer();