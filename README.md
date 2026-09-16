# Gestión de pólizas · Frontend

Aplicación Angular para consultar pólizas y riesgos desde la API de gestión de pólizas. Permite filtrar el listado, renovar o cancelar una póliza y agregar o cancelar riesgos de pólizas colectivas.

## Requisitos

- Node.js 22.22.3 o superior dentro de la versión 22, y npm.
- La [API Spring Boot](https://github.com/lauratellez321/GESTION-POLIZAS-SPRING-BOOT) en `http://localhost:8080`.

## Ejecutar

Inicia primero la API en su proyecto:

```bash
mvn spring-boot:run
```

Después, desde este proyecto:

```bash
npm ci
npm start
```

Abre `http://localhost:4200`. La aplicación usa la clave de prueba `123456`, que también se puede cambiar en el campo **Clave API**. Para desarrollo, Angular redirige las peticiones `/polizas` y `/riesgos` a Spring Boot mediante `src/proxy.conf.json`; por eso no es necesario configurar CORS. Si la API se ejecuta en otro puerto, modifica el destino del proxy y reinicia `npm start`.

## Funciones

- Filtrar pólizas por tipo y estado.
- Consultar canon, prima, vigencia y riesgos.
- Renovar una póliza indicando el porcentaje de IPC.
- Cancelar pólizas y riesgos, con confirmación antes de ejecutar la acción.
- Agregar riesgos a pólizas colectivas activas.

La API carga dos pólizas de ejemplo al iniciar. Actualmente no ofrece un endpoint para crear pólizas, así que el frontend trabaja con esos registros. H2 guarda los datos en memoria y los cambios se pierden cuando se detiene la API.

## Estructura

```text
src/
├── app/
│   ├── core/
│   │   └── polizas-api.ts   # Tipos y llamadas HTTP
│   ├── app.ts               # Estado y acciones de la pantalla
│   ├── app.html             # Vista
│   └── app.css              # Estilos de la vista
├── proxy.conf.json          # Redirección local a Spring Boot
└── styles.css               # Estilos generales
```

## Compilar

```bash
npm run build
```

El resultado se genera en `dist/frontend/`. La clave `123456` es solo para la prueba local; no debe utilizarse como mecanismo de autenticación en un despliegue público.

Para ejecutar la prueba de la capa HTTP:

```bash
npm test -- --watch=false
```
