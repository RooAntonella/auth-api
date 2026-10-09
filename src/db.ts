import { Sequelize } from "sequelize";
import dotenv from "dotenv";

dotenv.config();

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
    throw new Error("Falta DATABASE_URL en el archivo .env");
}

export const sequelize = new Sequelize(databaseUrl, {
    dialect: "postgres",
    logging: false,
});