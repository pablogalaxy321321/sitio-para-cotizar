# Sitio Web de Cotización - Ingeniería de Piping

Sitio web moderno para presentar servicios de ingeniería de piping industrial con animaciones y efectos visuales avanzados.

## 🚀 Inicio Rápido

### 1. Instalar dependencias

```bash
npm install
```

### 2. Descargar video para desarrollo local

```powershell
.\descargar-video.ps1
```

O descarga manualmente el video desde:
`https://res.cloudinary.com/ddle2pz8m/video/upload/v1760757594/maqueta_virtual_piping_cabecera_cljbya.mp4`

Y guárdalo en: `public/videos/maqueta_virtual_piping_cabecera.mp4`

### 3. Iniciar servidor de desarrollo

```bash
npm run dev
```

## 📹 Configuración de Videos

### Desarrollo Local (Recomendado)

Durante el desarrollo, usa videos locales para no consumir la cuota de Cloudinary:

En `src/components/HomePage.jsx`:

```javascript
const USE_LOCAL_VIDEO = true; // ← Video local
```

### Producción

Para producción, cambia a Cloudinary para optimización automática:

```javascript
const USE_LOCAL_VIDEO = false; // ← Video de Cloudinary
```

## 🛠️ Tecnologías

- **React** - Biblioteca de UI
- **Vite** - Build tool y dev server
- **GSAP** - Animaciones y efectos de scroll
- **Tailwind CSS** - Estilos
- **Three.js** - (Opcional) Visualizaciones 3D

## 📦 Scripts Disponibles

- `npm run dev` - Iniciar servidor de desarrollo
- `npm run build` - Compilar para producción
- `npm run preview` - Vista previa de la build de producción
- `npm run lint` - Ejecutar ESLint

## 📁 Estructura del Proyecto

```
├── public/
│   └── videos/           # Videos para desarrollo local
├── src/
│   ├── components/       # Componentes React
│   │   ├── HomePage.jsx  # Página principal
│   │   └── ...
│   ├── assets/           # Imágenes y recursos estáticos
│   └── main.jsx          # Punto de entrada
└── descargar-video.ps1   # Script para descargar videos
```

## 🌐 Deployment

Antes de hacer deploy, asegúrate de:

1. Cambiar `USE_LOCAL_VIDEO` a `false` en `HomePage.jsx`
2. Compilar el proyecto: `npm run build`
3. Subir la carpeta `dist/` a tu servidor

---

# React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) (or [oxc](https://oxc.rs) when used in [rolldown-vite](https://vite.dev/guide/rolldown)) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.
