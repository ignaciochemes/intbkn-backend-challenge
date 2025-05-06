# Backend Challenge - API NestJS

Este proyecto es una API REST construida con NestJS que proporciona endpoints para la gestión de empresas y transferencias, siguiendo los principios de la arquitectura hexagonal.

## Características Principales

- **API de Empresas**: Gestión de datos de empresas incluyendo adhesión (registro)
- **API de Transferencias**: Manejo de operaciones de transferencia entre cuentas
- **Arquitectura Hexagonal**: Clara separación de responsabilidades con capas de dominio, aplicación e infraestructura
- **Base de Datos PostgreSQL**: Almacenamiento en base de datos relacional con TypeORM
- **Pruebas Completas**: Pruebas unitarias y end-to-end
- **Documentación de API**: Documentación con Swagger
- **Soporte Docker**: Configuración sencilla con Docker Compose

## 🚀 Inicio Rápido

La forma más sencilla de ejecutar este proyecto es utilizando el script de inicio proporcionado, que configurará la base de datos y arrancará la aplicación:

```bash
# Hacer el script ejecutable
chmod +x start.sh

# Ejecutar el script
./start.sh
```

Esto realizará:
1. Iniciar PostgreSQL usando Docker Compose
2. Instalar dependencias
3. Configurar variables de entorno
4. Compilar la aplicación
5. Iniciar el servidor en modo de desarrollo local

## 📋 Endpoints Requeridos

Este challenge implementa tres endpoints principales:

1. **Obtener empresas que realizaron transferencias el último mes**:
   - `GET /api/v1/backend-challenge/transfers/companies/last-month`

2. **Obtener empresas que se adhirieron (registraron) el último mes**:
   - `GET /api/v1/backend-challenge/companies/adhering/last-month`

3. **Registrar una nueva empresa (adhesión)**:
   - `POST /api/v1/backend-challenge/companies`
   - Ejemplo de cuerpo de la solicitud:
     ```json
     {
       "cuit": "30-71659554-9",
       "businessName": "Nueva Empresa SRL",
       "address": "Av. Corrientes 1234, CABA",
       "contactEmail": "info@nuevaempresa.com",
       "contactPhone": "11-4567-8901"
     }
     ```

## 🏗️ Arquitectura

Este proyecto sigue los principios de la Arquitectura Hexagonal (también conocida como Puertos y Adaptadores):

- **Capa de Dominio**: Lógica de negocio central, entidades y servicios de dominio
- **Capa de Aplicación**: Casos de uso, DTOs y servicios de aplicación
- **Capa de Infraestructura**: Aspectos externos como controladores, repositorios, entidades de base de datos

### Estructura de Directorios

```
src/
├── Application/        # Capa de aplicación
│   ├── Dtos/           # Objetos de Transferencia de Datos
│   └── Services/       # Servicios de aplicación
├── Domain/             # Capa de dominio
│   ├── Entities/       # Entidades de dominio
│   ├── Ports/          # Interfaces para repositorios
│   └── Services/       # Interfaces de servicios de dominio
├── Infrastructure/     # Capa de infraestructura
│   ├── Config/         # Configuración
│   ├── Controllers/    # Controladores API
│   ├── Entities/       # Entidades TypeORM
│   ├── Exceptions/     # Excepciones HTTP
│   ├── Interceptors/   # Interceptores NestJS
│   ├── Mappers/        # Mapeadores de entidades
│   ├── Middlewares/    # Middlewares HTTP
│   ├── Modules/        # Módulos NestJS
│   └── Repositories/   # Implementaciones de repositorios
└── Shared/             # Recursos compartidos
    ├── Constants/      # Constantes y tokens
    └── Enums/          # Enumeraciones comunes
```

## 🧪 Pruebas

El proyecto incluye pruebas exhaustivas:

```bash
# Ejecutar pruebas unitarias
npm run test

# Ejecutar pruebas end-to-end
npm run test:e2e

# Generar informe de cobertura de pruebas
npm run test:cov
```

## 🐳 Docker

El proyecto incluye soporte para Docker:

```bash
# Iniciar la base de datos PostgreSQL
docker-compose up -d

# Construir el contenedor de la aplicación
docker build -t backend-challenge .

# Ejecutar el contenedor
docker run -p 33000:33000 --env-file .env.local backend-challenge
```

## 🧰 Tecnologías

- **NestJS**: Framework progresivo de Node.js
- **TypeScript**: JavaScript tipado
- **TypeORM**: ORM para interacciones con base de datos
- **PostgreSQL**: Base de datos relacional
- **Jest**: Framework de pruebas
- **Swagger**: Documentación de API
- **Docker**: Containerización

## 📊 Modelos de Datos

### Empresa (Company)

- **id**: ID numérico
- **uuid**: Identificador único
- **cuit**: ID fiscal (requerido)
- **businessName**: Nombre de la empresa (requerido)
- **adhesionDate**: Fecha de registro
- **address**: Dirección física (opcional)
- **contactEmail**: Dirección de correo electrónico (opcional)
- **contactPhone**: Número de teléfono (opcional)
- **isActive**: Estado activo

### Transferencia (Transfer)

- **id**: ID numérico
- **uuid**: Identificador único
- **amount**: Monto de la transferencia
- **companyId**: Referencia a la empresa
- **debitAccount**: Cuenta de origen
- **creditAccount**: Cuenta de destino
- **transferDate**: Fecha de la transferencia
- **status**: Estado de la transferencia (pendiente, completada, fallida, revertida)
- **description**: Descripción de la transferencia (opcional)
- **referenceId**: ID de referencia (opcional)
- **processedDate**: Fecha de procesamiento
- **currency**: Código de moneda

## 📝 Documentación de API

La documentación de la API está disponible a través de Swagger UI en:

```
http://localhost:33000/api
```

## 📦 Variables de Entorno

La aplicación utiliza variables de entorno para la configuración. Consulta `.env.example` para conocer las opciones disponibles.

## 👥 Contribuciones

¡Las contribuciones son bienvenidas! No dudes en enviar un Pull Request.

## 📄 Licencia

Este proyecto está licenciado bajo la Licencia Apache 2.0 - consulta el archivo LICENSE para más detalles.