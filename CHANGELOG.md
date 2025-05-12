## CHANGELOG

### 1.1.0 (Mayo 2025)

#### Fixes
- **Corrección de errores**:
  - Unico dto para la paginación de transferencias y empresas
  - Corrección de Company (Controller, Services y Repository)
  - Mejora en la gestión de errores para operaciones CRUD
  - Corrección en los tests unitarios

#### Mejoras en Rendimiento

- **Optimización de filtrado por fecha**: Delegación completa de las operaciones de filtrado "último mes" a la capa de persistencia (PostgreSQL)
  - Implementación de consultas SQL optimizadas utilizando funciones nativas (`date_trunc`, `interval`) para cálculos de fecha
  - Eliminación del cálculo de fechas en el código de la aplicación para mejorar rendimiento
  - Uso de índices compuestos específicos para optimizar consultas frecuentes

- **Mejoras en consultas**:
  - Implementación de caché para consultas frecuentes (60 segundos)
  - Optimización de consultas JOIN para evitar carga innecesaria de datos

#### Refuerzo de Validaciones

- **Arquitectura de validación**:
  - Implementación de clase abstracta `BaseDto` para reutilización de lógica de sanitización y normalización
  - Implementación de transformadores automáticos para normalización de datos de entrada
  - Mejora en el pipeline global de validación con mensajes de error más descriptivos

- **Validadores avanzados**:
  - Validador de cuentas bancarias que previene formatos inválidos y duplicados
  - Validador de códigos de moneda según estándar ISO 4217
  - Validador contra inyección de caracteres maliciosos en campos de texto

- **Transformaciones automáticas**:
  - Formateo automático de CUIT al estándar argentino (XX-XXXXXXXX-X)
  - Normalización de números de cuenta (eliminación de caracteres no numéricos)
  - Sanitización de texto para prevenir XSS y otras vulnerabilidades
  - Normalización de correos electrónicos y números telefónicos

- **Validaciones contextuales**:
  - Validación cruzada entre cuentas de origen y destino
  - Validación de montos máximos según tipo de operación
  - Validación condicional basada en estado de la transferencia

#### Correcciones de Seguridad

- **Prevención de ataques**:
  - Sanitización de inputs para prevenir inyección SQL
  - Validación estricta contra patrones de XSS
  - Filtrado de caracteres especiales en campos de texto libre

- **Mejoras en manejo de errores**:
  - Respuestas de error más descriptivas y seguras
  - Validación de límites en campos numéricos y de texto
  - Bloqueo de valores potencialmente peligrosos

### 1.0.0 (Abril 2025)

- Lanzamiento inicial del Backend Challenge API
- Implementación de arquitectura hexagonal
- API de Empresas con operaciones CRUD básicas
- API de Transferencias con operaciones CRUD básicas
- Implementación de pruebas unitarias y end-to-end
- Configuración de Docker y Docker Compose
- Documentación inicial con Swagger