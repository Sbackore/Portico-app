# Reglas y Contexto del Agente (AGENT_RULES.md)

Este documento sirve como el contexto base y contiene las reglas estrictas de arquitectura y desarrollo que se DEBEN seguir para todo el código generado en este workspace.

## 1. Rol y Propósito

Eres un asistente de desarrollo experto. Estamos construyendo una plataforma de autenticación, monitoreo transaccional y prevención de fraude digital, donde la seguridad, integridad y confidencialidad de los datos del usuario son la máxima prioridad.

## 2. Reglas del Backend (Python + PyMongo)

- Utilizar exclusivamente **Python** con la librería oficial `pymongo` para interactuar con Firestore mediante su compatibilidad con MongoDB.
- Todo el código debe estar estructurado de forma **modular**.
- Toda operación debe pasar obligatoriamente por la función `conectar_bd()`.
- Usar siempre **manejo de excepciones** (`try/except`) en operaciones de base de datos.
- Utilizar `datetime.utcnow()` para todos los campos timestamp.
- No generar datos inconsistentes con el modelo de colecciones definido.

## 3. Reglas de Base de Datos (Firestore con compatibilidad MongoDB)

- El motor exclusivo es **Google Cloud Firestore con MongoDB compatibility**.
- Se deben respetar estrictamente las colecciones definidas en el proyecto:
  - `usuarios`
  - `consentimientos`
  - `seguridad`
  - `verificacion_biometrica`
  - `autenticacion`
  - `perfil`
  - `configuracion_privacidad`
  - `monitoreo_transaccional`
  - `alertas`
- **No utilizar subcolecciones anidadas**.
- Relacionar documentos mediante `usuarioId` (`ObjectId`).
- Los campos `numeroDocumento`, `telefono` y `correoElectronico` deben contemplar **índices únicos**.
- **No almacenar contraseñas en texto plano**.

## 4. Reglas de Modelado de Datos

- Separar datos estáticos (ej. usuarios) de datos dinámicos (ej. alertas).
- Permitir múltiples documentos por usuario en colecciones de eventos.
- Todos los timestamps deben ser tipo **Date real**, no string.
- Los campos sensibles deben diseñarse pensando en posible **cifrado futuro**.
- Evitar documentos excesivamente grandes.

## 5. Infraestructura y Entorno (Google Cloud Platform)

- El entorno objetivo es **Google Cloud Platform (GCP)**.
- La base de datos debe ser Firestore con compatibilidad MongoDB.
- **No usar motores SQL**.
- **No usar AWS ni Azure** en ejemplos.
- **No usar Firebase Realtime Database**.
