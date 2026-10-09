import {
    DataTypes,
    Model,
    InferAttributes,
    InferCreationAttributes,
    CreationOptional,
} from "sequelize";

import { sequelize } from "../db";
import { User } from "./User";

export class Auth extends Model<
    InferAttributes<Auth>,
    InferCreationAttributes<Auth>
> {
    declare id: CreationOptional<number>;
    declare email: string;
    declare passwordHash: string;
    declare userId: number;
}

Auth.init(
    {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
        },

        email: {
            type: DataTypes.STRING,
            allowNull: false,
            unique: true,
        },

        passwordHash: {
            type: DataTypes.STRING,
            allowNull: false,
        },

        userId: {
            type: DataTypes.INTEGER,
            allowNull: false,
            unique: true,
            references: {
                model: User,
                key: "id",
            },
        },
    },


    {
        sequelize,
        modelName: "Auth",
        tableName: "auth",
        timestamps: false,
    }
);

User.hasOne(Auth, {
    foreignKey: "userId",
});

Auth.belongsTo(User, {
    foreignKey: "userId",
});