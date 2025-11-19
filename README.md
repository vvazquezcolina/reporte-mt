# Reportes MT - Sistema de Reportes de Ventas

Sistema de reportes de ventas para eventos de Mandala Tickets. Muestra un resumen de ventas por ubicación y fecha.

## Características

- Consulta de ventas por ubicación (Vagalume, Bonbonniere, Bagatelle)
- Visualización de datos en tabla similar al diseño proporcionado
- Integración con la API de Mandala Tickets
- Despliegue en Vercel

## Instalación

```bash
npm install
```

## Configuración

El API key está configurado en el código. Si deseas usar una variable de entorno, crea un archivo `.env.local` (opcional):
```bash
MANDALA_API_KEY=tu_api_key_aqui
```

## Desarrollo

```bash
npm run dev
```

Abre [http://localhost:3000](http://localhost:3000) en tu navegador.

## Despliegue en Vercel

1. Instala la CLI de Vercel (si no la tienes):
```bash
npm i -g vercel
```

2. Inicia sesión en Vercel:
```bash
vercel login
```

3. Despliega el proyecto:
```bash
vercel
```

O conecta tu repositorio de GitHub/GitLab a Vercel desde el dashboard.

## Estructura del Proyecto

- `/app` - Páginas y layout de Next.js
- `/components` - Componentes React (SalesTable)
- `/data` - Configuración de eventos y ubicaciones
- `/lib` - Utilidades y funciones de API

## API

El proyecto utiliza la API de Mandala Tickets:
- Endpoint: `https://mandalatickets.com/api/ventas_agrupadas/X-API-KEY/{API_KEY}?fecha={fecha}&sucursal={sucursal}`
- API Key: Configurada en el código (con fallback a variable de entorno opcional)

## SEO

Este sitio está configurado para **no indexarse** en buscadores:
- Meta tags `robots: noindex, nofollow` en todas las páginas
- Archivo `robots.txt` que bloquea todos los crawlers

## Ubicaciones

- **Vagalume** (ID: 38)
- **Bonbonniere** (ID: 37)
- **Bagatelle** (ID: 41)


