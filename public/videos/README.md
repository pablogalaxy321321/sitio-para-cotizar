# 📹 Carpeta de Videos

## Instrucciones

Esta carpeta contiene los videos que se usan en el sitio web durante el desarrollo local.

### 📁 Video Requerido

Coloca aquí el siguiente video:

- **Nombre**: `maqueta_virtual_piping_cabecera.mp4`
- **Descripción**: Video principal de la sección hero con efecto de scroll

### 🔄 Cambiar entre Local y Cloudinary

Para cambiar entre video local y Cloudinary, edita el archivo:
`src/components/HomePage.jsx`

Busca la línea:

```javascript
const USE_LOCAL_VIDEO = true;
```

- **Desarrollo Local**: `USE_LOCAL_VIDEO = true` (usa el video de esta carpeta)
- **Producción**: `USE_LOCAL_VIDEO = false` (usa Cloudinary)

### ⚡ Ventajas del Video Local

- ✅ No consume cuota de Cloudinary durante desarrollo
- ✅ Carga más rápida en desarrollo
- ✅ No requiere conexión a internet
- ✅ Fácil de cambiar a producción

### 📝 Nota

El video en Cloudinary está en:
`https://res.cloudinary.com/ddle2pz8m/video/upload/q_auto,f_auto/v1760757594/maqueta_virtual_piping_cabecera_cljbya.mp4`

Descarga ese video y guárdalo aquí con el nombre `maqueta_virtual_piping_cabecera.mp4`
