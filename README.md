# INVENTARIO IT IMPULSO - Backend API

Backend principal del proyecto **INVENTARIO IT IMPULSO**, construido para migrar una solución grande de AppSheet a una arquitectura propia, escalable y mantenible.

## Objetivo del proyecto

Construir una plataforma propia para administración de:

- inventario de equipos IT
- inventario de consumibles
- movimientos de consumibles con stock central
- tickets
- bitácora y trazabilidad
- usuarios, roles y permisos
- exportaciones para operación

La meta es reemplazar AppSheet por una solución profesional con backend robusto, frontend web y aplicación móvil.

---

## Stack tecnológico

- **Node.js**
- **TypeScript**
- **NestJS**
- **Prisma 7**
- **PostgreSQL**
- **JWT Authentication**
- **ExcelJS**

---

## Estado actual del backend

### Módulos ya funcionales

- `auth`
- `users`
- `device-types`
- `brands`
- `warehouses`
- `departments`
- `devices`
- `device-assignments`
- `consumable-items`
- `consumable-movements`
- `prisma`

---

## Funcionalidad implementada

### Auth / Users
- login por `email` o `username`
- JWT
- validación por roles
- usuario admin y usuario estándar seed

### Equipos
- alta de equipos
- listado
- detalle
- edición
- historial de asignaciones
- asignaciones y retorno a `ALMACEN IT`
- consecutivo automático `IMP-0001`, `IMP-0002`, etc.

### Consumibles
- catálogo de consumibles
- alta manual
- listado y filtros
- detalle
- edición
- carga inicial por seed
- historial por artículo
- exportación a Excel

### Movimientos de consumibles
- entradas (`ENTRY`)
- salidas (`EXIT`)
- movimientos **multiartículo**
- validación de stock insuficiente
- folio automático `MOV-0001`, `MOV-0002`, etc.
- stock central actualizado automáticamente
- listado con filtros
- detalle por movimiento
- exportación a Excel

---

## Diseño funcional de consumibles

El módulo de consumibles fue diseñado con estas reglas:

- el **stock real** se maneja de forma central
- las bodegas/sucursales se guardan como dato informativo del movimiento
- los movimientos pueden incluir **varios artículos en un mismo registro**
- cada movimiento guarda snapshot del artículo:
  - código
  - nombre
  - unidad
  - cantidad
- se bloquean salidas que dejarían stock negativo

---

## Estructura base del proyecto

```txt
src/
  auth/
  brands/
  consumable-items/
  consumable-movements/
  departments/
  device-assignments/
  device-types/
  devices/
  prisma/
  users/
  warehouses/

  Requisitos

Node.js 22+

pnpm

PostgreSQL 15+

Prisma 7

Variables de entorno

Crea un archivo .env basado en .env.example.

.env.example
DATABASE_URL="postgresql://ivanorpineda@localhost:5432/inventario_it"

JWT_SECRET="change_this_in_production"
TZ=America/Ciudad_Juarez
PORT=3011
FRONTEND_ORIGIN="http://localhost:3002"

SEED_ADMIN_EMAIL="admin@impulso.local"
SEED_ADMIN_USERNAME="admin"
SEED_ADMIN_PASSWORD="change_this_local_password"
SEED_ADMIN_NAME="Administrador General"
Instalación
pnpm install
Generar cliente Prisma
pnpm run prisma:generate
Sincronizar base local
pnpm exec prisma db push
Seeds

Este proyecto ya incluye seed maestro.

Ejecutar todos los seeds
pnpm run seed

Esto carga o actualiza:

roles

usuarios base

tipos de equipo

marcas

branches

warehouses

departments

secuencias

catálogo inicial de consumibles

Levantar el backend
Desarrollo
pnpm run start:dev
Producción
pnpm run build
pnpm run start:prod
Endpoints principales
Auth

POST /auth/login

GET /auth/status

Users

GET /users

GET /users/me

POST /users

PATCH /users/:id/status

PATCH /users/:id/role

Catálogos

GET /device-types

GET /brands

GET /warehouses

GET /departments

Devices

POST /devices

GET /devices

GET /devices/:id

PATCH /devices/:id

GET /devices/:id/assignments

Device Assignments

POST /device-assignments

GET /device-assignments

PATCH /device-assignments/:id/return

Consumable Items

POST /consumable-items

GET /consumable-items

GET /consumable-items/export.xlsx

GET /consumable-items/:id

PATCH /consumable-items/:id

GET /consumable-items/:id/movements

Consumable Movements

POST /consumable-movements

GET /consumable-movements

GET /consumable-movements/export.xlsx

GET /consumable-movements/:id

Scripts útiles
pnpm run start:dev
pnpm run build
pnpm run start:prod
pnpm run prisma:generate
pnpm run prisma:db:push
pnpm run prisma:studio
pnpm run seed
Notas de desarrollo

Prisma 7 usa prisma.config.ts

la conexión principal está en .env

el cliente generado de Prisma se regenera localmente

src/generated/prisma no debe subirse al repo si está ignorado en .gitignore

el backend está siendo construido primero; después se desarrollará:

frontend web en Next.js

app móvil en Expo / React Native

Estado del roadmap
Ya implementado

auth

users

roles

devices

assignments

consumibles

movimientos

exports Excel

departments

seeds base

Pendiente

tickets

exportaciones PDF

frontend web

app móvil

despliegue final a servidor
