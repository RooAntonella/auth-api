# Auth API

API de autenticación desarrollada con Express, TypeScript, PostgreSQL y Sequelize.

El proyecto implementa registro de usuarios, login con contraseña hasheada, generación de JWT y protección de rutas mediante middleware.

## Tecnologías

- Node.js
- Express
- TypeScript
- PostgreSQL
- Neon
- Sequelize
- Argon2
- JSON Web Token

## Funcionalidades

- Registro de usuarios
- Hash seguro de contraseñas con Argon2id
- Login con email y password
- Generación de access token JWT
- Middleware de autenticación
- Rutas protegidas
- Manejo de errores HTTP
- Relación entre tablas `users` y `auth`

## Modelo de datos

### users

- id
- fullName
- birthDate

### auth

- id
- email
- passwordHash
- userId

Relación:

users 1 ↔ 1 auth

`auth.userId` referencia a `users.id`.

## Endpoints

### POST /auth/register

Crea un nuevo usuario.

```json
{
  "email": "user@email.com",
  "password": "Password123!",
  "fullName": "Nombre Apellido",
  "birthDate": "1992-07-26"
}
