# DayLog 📔

Una aplicación móvil moderna para gestionar tu diario personal, hábitos y análisis diarios. Construida con **Expo** y **React Native** para máxima compatibilidad y rendimiento.

![Version](https://img.shields.io/badge/version-1.0.0-blue)
![Expo](https://img.shields.io/badge/expo-~57.0.28-brightgreen)
![React Native](https://img.shields.io/badge/react%20native-0.86.3-blue)
![License](https://img.shields.io/badge/license-MIT-green)

## ✨ Características

- 📝 **Diario Personal** - Escribe y gestiona tus entradas diarias con categorías personalizadas
- 📊 **Análisis Avanzado** - Visualiza estadísticas con gráficos interactivos y reportes detallados
- 🎯 **Seguimiento de Hábitos** - Configura y monitorea tus hábitos con visualización de progreso
- 📅 **Calendario** - Navega fácilmente por tus entradas organizadas por fecha
- 🎨 **Personalización** - Tema personalizable, colores por categoría, emojis e íconos
- 🔑 **Gestión de Palabras Clave** - Etiqueta y busca tus entradas fácilmente
- 💾 **Almacenamiento Local** - Base de datos SQLite segura y privada en tu dispositivo
- 📄 **Exportar Reportes** - Comparte tus análisis en formato PDF

## 🚀 Inicio Rápido

### Requisitos Previos
- Node.js 18+ o Bun
- Expo CLI (`npm install -g expo-cli`)
- Simulador iOS o Emulador Android (opcional para desarrollo)

### Instalación

```bash
# Clonar el repositorio
git clone <repository-url>
cd daylog

# Instalar dependencias
npm install
# O con Bun
bun install

# Configurar la base de datos
npm run db:generate
```

### Desarrollo

```bash
# Iniciar servidor de desarrollo
npm start

# En iOS (requiere Xcode)
npm run ios

# En Android (requiere Android Studio)
npm run android

# En Web
npm run web
```

## 📁 Estructura del Proyecto

```
daylog/
├── src/
│   ├── app/                 # Rutas y navegación (Expo Router)
│   ├── components/          # Componentes reutilizables
│   │   ├── charts/         # Componentes de gráficos
│   │   ├── ColorPicker/
│   │   ├── EmojiPicker/
│   │   ├── DateNavigator/
│   │   └── ...
│   ├── screens/            # Pantallas principales
│   │   ├── Today/          # Pantalla de inicio
│   │   ├── Journal/        # Gestión de entradas
│   │   ├── Calendar/       # Vista de calendario
│   │   ├── Analytics/      # Gráficos y reportes
│   │   └── Settings/       # Configuración
│   ├── db/                 # Esquema y migraciones de Drizzle ORM
│   ├── repositories/       # Capa de acceso a datos
│   ├── services/           # Lógica de negocio
│   ├── stores/             # Estados globales (Zustand)
│   ├── theme/              # Sistema de temas
│   ├── types/              # Tipos TypeScript
│   └── utils/              # Utilidades y helpers
├── assets/                 # Imágenes e íconos
├── drizzle/               # Migraciones de BD
├── app.json               # Configuración Expo
├── tsconfig.json          # Configuración TypeScript
├── babel.config.js        # Configuración Babel
└── package.json           # Dependencias
```

## 🛠️ Tecnologías

### Frontend
- **React Native** - Framework móvil
- **Expo** - Plataforma de desarrollo y distribución
- **React Navigation** - Navegación entre pantallas
- **React Native Paper** - Componentes UI Material Design
- **Zustand** - Gestión de estado
- **React Native Gifted Charts** - Gráficos y visualizaciones

### Backend & Datos
- **Drizzle ORM** - ORM type-safe para TypeScript
- **SQLite** - Base de datos local embebida
- **Expo SQLite** - Acceso a SQLite desde React Native

### Utilidades
- **dayjs** - Manejo de fechas
- **Expo Crypto** - Operaciones criptográficas
- **Expo File System** - Acceso a archivos
- **Expo Print & Sharing** - Exportar y compartir

## 📚 Scripts Disponibles

| Script | Descripción |
|--------|-------------|
| `npm start` | Inicia el servidor de desarrollo Expo |
| `npm run ios` | Ejecuta en simulador iOS |
| `npm run android` | Ejecuta en emulador Android |
| `npm run web` | Ejecuta en navegador web |
| `npm run db:generate` | Genera migraciones de base de datos |
| `npm run db:studio` | Abre Drizzle Studio para inspeccionar BD |

## 🏗️ Arquitectura

### Estado Global (Zustand)
```
stores/
├── entryStore.ts        # Gestión de entradas del diario
├── habitStore.ts        # Gestión de hábitos
├── categoryStore.ts     # Gestión de categorías
└── settingsStore.ts     # Preferencias del usuario
```

### Base de Datos (Drizzle ORM)
- **entries** - Entradas del diario
- **habits** - Definición de hábitos
- **habitLogs** - Registro de cumplimiento diario
- **categories** - Categorías personalizadas
- **keywords** - Palabras clave/etiquetas
- **settings** - Configuración del usuario

### Pantallas Principales
- **Today** - Dashboard diario
- **Journal** - CRUD de entradas
- **Calendar** - Vista temporal
- **Analytics** - Visualización de datos
- **Settings** - Configuración y preferencias

## 🎨 Personalización

### Temas
La aplicación soporta temas personalizables. Accede a Settings > Tema para cambiar colores y apariencia.

### Categorías
Crea categorías personalizadas con íconos y colores en Settings > Categorías.

### Hábitos
Configura tus hábitos en Settings > Hábitos para un seguimiento personalizado.

## 📦 Build & Distribución

### Desarrollo
```bash
# Build local para iOS
npx expo run:ios

# Build local para Android
npx expo run:android
```

### Producción con EAS

```bash
# Configurar proyecto EAS
npx eas-cli init

# Build de producción
npx eas-cli build --platform ios --distribution app-store
npx eas-cli build --platform android --distribution play-store

# Enviar a stores
npx eas-cli submit
```

Para más información: [EAS Documentation](https://docs.expo.dev/eas/)

## 🔍 Lint & TypeCheck

```bash
# Linter
npx expo lint

# Type checking
npx tsc --noEmit

# Diagnóstico de dependencias
npx expo-doctor
```

## 🐛 Debugging

### Logs en desarrollo
```bash
# Ver logs de Expo
npm start
# Presiona 'j' para abrir debugger de React Native
```

### Drizzle Studio
Inspecciona y manipula tu base de datos:
```bash
npm run db:studio
```

## 📄 Licencia

Este proyecto está licenciado bajo la Licencia MIT - ver archivo [LICENSE](LICENSE) para más detalles.

## 🤝 Contribuir

Las contribuciones son bienvenidas. Por favor:

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## 📞 Soporte

Para reportar bugs o sugerir features, abre un [GitHub Issue](../../issues).

## 🎯 Roadmap

- [ ] Sincronización en la nube
- [ ] Búsqueda full-text avanzada
- [ ] Recordatorios y notificaciones
- [ ] Exportación a múltiples formatos
- [ ] Importación desde otras apps
- [ ] Modo oscuro mejorado
- [ ] Soporte multiidioma

---

**Desarrollado con ❤️ usando Expo & React Native**
