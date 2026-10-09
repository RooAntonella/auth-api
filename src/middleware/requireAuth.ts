import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";

export function requireAuth(
    req: Request,
    res: Response,
    next: NextFunction
) {
    const authHeader = req.get("Authorization");

    if (!authHeader) {
        return res.status(401).json({
            message: "Falta token de autenticación",
        });
    }


    const [type, token] = authHeader.split(" ");

    if (type !== "Bearer" || !token) {
        return res.status(401).json({
            message: "Token inválido",
        });
    }

    const jwtSecret = process.env.JWT_SECRET;

    if (!jwtSecret) {
        throw new Error("Falta JWT_SECRET en .env");
    }

    try {
        const decoded = jwt.verify(token, jwtSecret);

        if (typeof decoded === "string" || !decoded.sub) {
            return res.status(401).json({
                message: "Token inválido",
            });
        }

        const userId = Number(decoded.sub);

        if (!Number.isInteger(userId)) {
            return res.status(401).json({
                message: "Token inválido",
            });
        }


        res.locals.userId = userId;

        next();
    } catch {
        return res.status(401).json({
            message: "Token inválido o expirado",
        });
    }
}